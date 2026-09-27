#!/usr/bin/env python3
"""Align stored APK entries without recompressing or changing entry bytes."""
import struct
import sys
import zipfile
from pathlib import Path

LOCAL = 0x04034B50
CENTRAL = 0x02014B50
EOCD = 0x06054B50


def u16(data, offset):
    return struct.unpack_from('<H', data, offset)[0]


def u32(data, offset):
    return struct.unpack_from('<I', data, offset)[0]


def align_apk(source, target):
    data = source.read_bytes()
    eocd = data.rfind(b'PK\x05\x06')
    if eocd < 0 or u32(data, eocd) != EOCD:
        raise ValueError('EOCD not found')
    entry_count = u16(data, eocd + 10)
    old_cd_offset = u32(data, eocd + 16)
    records = []
    position = old_cd_offset
    for _ in range(entry_count):
        if u32(data, position) != CENTRAL:
            raise ValueError(f'Bad central record at {position}')
        name_len = u16(data, position + 28)
        extra_len = u16(data, position + 30)
        comment_len = u16(data, position + 32)
        size = 46 + name_len + extra_len + comment_len
        raw = bytearray(data[position:position + size])
        name = bytes(raw[46:46 + name_len]).decode('utf-8')
        records.append({'raw': raw, 'name': name, 'old_offset': u32(raw, 42)})
        position += size
    central_tail = data[position:eocd]
    ordered = sorted(records, key=lambda item: item['old_offset'])
    out = bytearray(data[:ordered[0]['old_offset']])
    new_offsets = {}
    for index, record in enumerate(ordered):
        old_offset = record['old_offset']
        if u32(data, old_offset) != LOCAL:
            raise ValueError(f'Bad local record for {record["name"]}')
        name_len = u16(data, old_offset + 26)
        extra_len = u16(data, old_offset + 28)
        name_start = old_offset + 30
        extra_start = name_start + name_len
        payload_start = extra_start + extra_len
        payload_end = ordered[index + 1]['old_offset'] if index + 1 < len(ordered) else old_cd_offset
        method = u16(data, old_offset + 8)
        alignment = 16384 if record['name'].startswith('lib/') and record['name'].endswith('.so') else 4
        padding = 0 if method != 0 else (-(len(out) + 30 + name_len + extra_len)) % alignment
        if extra_len + padding > 0xFFFF:
            raise ValueError(f'Extra field overflow for {record["name"]}')
        header = bytearray(data[old_offset:old_offset + 30])
        struct.pack_into('<H', header, 28, extra_len + padding)
        new_offsets[old_offset] = len(out)
        out += header
        out += data[name_start:extra_start]
        out += data[extra_start:payload_start]
        out += b'\0' * padding
        out += data[payload_start:payload_end]
    new_cd_offset = len(out)
    for record in records:
        struct.pack_into('<I', record['raw'], 42, new_offsets[record['old_offset']])
        out += record['raw']
    out += central_tail
    new_cd_size = len(out) - new_cd_offset
    end = bytearray(data[eocd:])
    struct.pack_into('<I', end, 12, new_cd_size)
    struct.pack_into('<I', end, 16, new_cd_offset)
    out += end
    target.write_bytes(out)
    with zipfile.ZipFile(target) as archive:
        if archive.testzip() is not None:
            raise ValueError('CRC validation failed')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('usage: zipalign_apk.py input.apk output.apk')
    align_apk(Path(sys.argv[1]), Path(sys.argv[2]))
