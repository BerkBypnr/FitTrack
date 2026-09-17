#!/usr/bin/env python3
"""Read-only 0.12.0 A inventory; writes only the explicitly selected JSON report.

Input ZIP/APK must be the original 0.11.9 release, not a new checkpoint archive.
Does not extract archives, execute app code, connect to Supabase or sign an APK.
"""
import argparse
import datetime
import hashlib
import json
import re
import shutil
import stat
import subprocess
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
ZIP_SHA = "7bf6883635206fcd18a40f970a60280055a725159fffbbe646fafd71969745a4"
APK_SHA = "4035b4f07308f85831d2e6b02db7f104d0d46a949c8f45da09940d8fd9f46e23"
ROOT_WEB = ["app.js", "cloud.js", "config.js", "index.html", "styles.css",
            "member-ui.css", "sw.js", "icon.svg", "manifest.webmanifest"]
ANDROID_NS = "{http://schemas.android.com/apk/res/android}"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def text(relative):
    return (ROOT / relative).read_text(encoding="utf-8")


def strings(source, names):
    values = dict(re.findall(r'\bvar\s+(\w+)\s*=\s*"([^"\n]+)";', source))
    return {name: values[name] for name in names}


def version(command):
    if not shutil.which(command[0]):
        return "not available on PATH"
    result = subprocess.run(command, capture_output=True, text=True, timeout=15)
    lines = (result.stdout + result.stderr).strip().splitlines()
    return {"exit_code": result.returncode, "version": lines[0] if lines else "no output"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-zip", type=Path, required=True)
    parser.add_argument("--apk", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    require(output not in {args.source_zip.resolve(), args.apk.resolve()}, "Output must not replace an input")
    require(not output.exists(), "Output already exists; choose a new report path")
    source_bytes, apk_bytes = args.source_zip.read_bytes(), args.apk.read_bytes()
    require(sha(source_bytes) == ZIP_SHA, "Original source ZIP hash mismatch")
    require(sha(apk_bytes) == APK_SHA, "Original APK hash mismatch")

    fingerprints = {}
    changed, ignored = [], []
    with zipfile.ZipFile(args.source_zip) as archive:
        require(archive.testzip() is None, "Source ZIP CRC failure")
        seen = set()
        for entry in archive.infolist():
            parts = PurePosixPath(entry.filename).parts
            require(not entry.filename.startswith('/') and '..' not in parts and '\\' not in entry.filename,
                    "Unsafe source ZIP entry")
            require(not stat.S_ISLNK(entry.external_attr >> 16), "Source ZIP contains a symbolic link")
            require(entry.filename not in seen, "Duplicate source ZIP entry")
            seen.add(entry.filename)
            require(parts and parts[0] == 'FitTrack-Beta-0.11.9', "Unexpected ZIP root")
            if entry.is_dir():
                continue
            relative = PurePosixPath(*parts[1:]).as_posix()
            current = ROOT / relative
            require(current.is_file() and not current.is_symlink(), "Missing or symlinked source: " + relative)
            if relative.startswith('test-results/'):
                ignored.append(relative)
                continue
            baseline = sha(archive.read(entry))
            fingerprints[relative] = baseline
            if sha(current.read_bytes()) != baseline:
                changed.append(relative)
        count = len(archive.infolist())
    require(set(changed) <= {'scripts/test.cjs'}, "Unexpected baseline source change: " + ', '.join(changed))

    with zipfile.ZipFile(args.apk) as archive:
        require(archive.testzip() is None, "APK ZIP CRC failure")
        web_paths = ROOT_WEB + [p.relative_to(ROOT).as_posix() for directory in ['assets', 'vendor']
                               for p in (ROOT / directory).rglob('*') if p.is_file()]
        for relative in web_paths:
            require(archive.read('assets/public/' + relative) == (ROOT / relative).read_bytes(),
                    "APK web asset differs: " + relative)

    manifest = ET.fromstring(text('android/AndroidManifest.xml'))
    app = manifest.find('application')
    activity = app.find('activity')
    native = json.loads(text('android/assets/capacitor.config.json'))
    plugins = json.loads(text('android/assets/capacitor.plugins.json'))
    yml = text('android/apktool.yml')
    app_text, cloud_text = text('app.js'), text('cloud.js')
    app_constants = strings(app_text, ['VERSION', 'STORAGE_KEY', 'ACCOUNT_KEY_PREFIX'])
    schema = int(re.search(r'var SCHEMA = (\d+)', app_text)[1])
    require(app_constants['VERSION'] == '0.11.9' and schema == 14, "Version/schema changed")
    require(manifest.attrib['package'] == 'com.fittracklabs.mobile', "Package identity changed")
    require(native['server']['androidScheme'] == 'https' and not native['server'].get('url'), "Origin configuration changed")
    require(re.search(r'versionCode:\s*26\b', yml), "Android versionCode changed")

    groups = {}
    for name, select in {
        'product_web': lambda p: p in ROOT_WEB or p.startswith(('assets/', 'vendor/')),
        'android': lambda p: p.startswith('android/'),
        'supabase': lambda p: p.startswith('supabase/'),
        'dependencies': lambda p: p in {'package.json', 'package-lock.json'},
    }.items():
        paths = sorted(p for p in fingerprints if select(p))
        require(not any(p in changed for p in paths), "Changed product group: " + name)
        groups[name] = {"file_count": len(paths), "unchanged": True,
                        "tree_sha256": sha(''.join(p + '\0' + fingerprints[p] + '\n' for p in paths).encode())}

    baseline_immutable_paths = [p for p in fingerprints if p != 'scripts/test.cjs']
    legacy = json.loads(re.search(r'var LEGACY_KEYS = (\[[^;]+\]);', app_text)[1])
    result = {
        'phase': '0.12.0 A', 'status': 'PASS',
        'generated_at_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'source_zip_sha256': ZIP_SHA, 'apk_sha256': APK_SHA, 'source_archive_entries': count,
        'original_files_checked': len(fingerprints), 'original_files_unchanged': len(fingerprints) - len(changed),
        'allowed_existing_file_changes': changed, 'regenerated_evidence_files_not_compared': len(ignored),
        'groups': groups, 'apk_web_files_matched': len(web_paths),
        'identity': {'version': app_constants.pop('VERSION'), 'version_code': 26, 'schema': schema,
                     'package': manifest.attrib['package'], 'minimum_api': 24, 'target_api': 36,
                     'auth_callback': 'com.fittracklabs.mobile://auth-callback'},
        'native': {
            'source_form': 'Preserved Smali/XML, not original Gradle/Java/Kotlin source',
            'plugin_packages': [p['pkg'] for p in plugins],
            'original_native_dependency_versions': 'Not established by this source package; do not guess',
            'inferred_origin': 'https://localhost',
            'origin_evidence': 'androidScheme=https; hostname omitted; decoded CapConfig default is localhost; not measured on device',
            'web_dir': native['webDir'], 'actual_packaged_assets': 'assets/public',
            'dom_storage_enabled_in_bridge': 'setDomStorageEnabled' in text('android/smali_classes5/com/getcapacitor/Bridge.smali'),
            'permissions': [p.attrib[ANDROID_NS + 'name'] for p in manifest.findall('uses-permission')],
            'allow_backup': app.attrib.get(ANDROID_NS + 'allowBackup'),
            'debuggable': app.attrib.get(ANDROID_NS + 'debuggable'),
            'main_activity': activity.attrib[ANDROID_NS + 'name'],
            'launch_mode': activity.attrib[ANDROID_NS + 'launchMode'],
            'storage_directory_on_device': 'Not observed; must verify WebView profile and origin during real upgrade',
        },
        'storage': {
            'app_constants': app_constants, 'legacy_keys': legacy,
            'cloud_constants': strings(cloud_text, ['DEVICE_KEY', 'ACTIVE_GYM_KEY', 'LAST_INVITE_KEY', 'QUEUE_PREFIX', 'SNAPSHOT_PREFIX']),
            'auth_storage_key': 'fittrack-beta-010-auth',
            'editor_template': 'fittrack-beta-0114-editor-{userId|local}-{gymId|none}',
            'deletion_ack_template': 'fittrack-deletion-acks:{userId}:{gymId}',
            'native_preferences': {'file': 'CapWebViewSettings', 'keys': ['serverBasePath', 'lastBinaryVersionCode', 'lastBinaryVersionName']},
            'secure_native_session_store': 'No configured Keychain/Keystore-backed Auth storage adapter in cloud.js',
        },
        'environment': {'node': version(['node', '--version']), 'python': sys.version.split()[0],
                        'java': version(['java', '-version']), 'adb_on_path': bool(shutil.which('adb')),
                        'gradle_on_path': bool(shutil.which('gradle'))},
        'commit': 'No Git checkout in this attachment workspace; no commit or remote CI run',
        'build': 'No new APK produced in A', 'migration': 'None; no database writes',
        'physical_gate_0': 'PENDING: Samsung S23 / Android 16 acceptance not supplied',
        'limits': ['Not an Android package-manager verifier', 'Not a real browser render',
                   'No live Auth, SMTP, Realtime or two-device test',
                   'Original APK certificate/digest inspection is a separate apk-inspection.json',
                   'Dependency vulnerability service not contacted by this script'],
    }
    require(output not in {(ROOT / p).resolve() for p in baseline_immutable_paths}, "Output targets source")
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8') as destination:
        json.dump(result, destination, ensure_ascii=False, indent=2)
        destination.write('\n')
    print(json.dumps({'status': result['status'], 'unchanged_groups': groups,
                      'apk_web_files_matched': len(web_paths), 'allowed_existing_file_changes': changed}, ensure_ascii=False))


if __name__ == '__main__':
    main()
