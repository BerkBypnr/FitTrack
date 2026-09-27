#!/usr/bin/env python3
"""Create a clean source archive; fail closed on key files or private key markers."""
import argparse,base64,hashlib,json,re,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
EXCLUDED={'node_modules','.git','.gradle','.kotlin','.build-tools','.local-tools','graft','test-results','out','out-apktool','deliverables','www','__pycache__','build','dist','original'}
def main():
 p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);args=p.parse_args();target=args.output.resolve();target.parent.mkdir(parents=True,exist_ok=True);temporary=target.with_name(target.name+'.partial');files=[]
 for f in sorted(ROOT.rglob('*')):
  if not f.is_file() or f.resolve() in {target,temporary}:continue
  rel=f.relative_to(ROOT)
  if any(part in EXCLUDED for part in rel.parts) or f.name=='local.properties':continue
  if f.suffix.lower() in {'.apk','.aab','.jks','.keystore','.p12','.pfx','.pyc'} or (f.name=='.env' or f.name.startswith('.env.') and f.name!='.env.example'):raise RuntimeError('Private/build file in source tree: '+str(rel))
  data=f.read_bytes()
  if re.search(rb'sb_secret_[A-Za-z0-9_-]{20,}|sbp_[A-Za-z0-9]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',data):raise RuntimeError('Potential secret: '+str(rel))
  for token in re.findall(rb'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',data):
   try:
    part=token.split(b'.')[1];claim=json.loads(base64.urlsafe_b64decode(part+b'='*(-len(part)%4)))
   except Exception:continue
   if claim.get('role')=='service_role':raise RuntimeError('Service-role token: '+str(rel))
  files.append((rel,data,0o100755 if f.stat().st_mode & 0o111 else 0o100644))
 with zipfile.ZipFile(temporary,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for rel,data,mode in files:
   info=zipfile.ZipInfo(ROOT.name+'/'+rel.as_posix(),(2026,9,21,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=mode<<16;info.create_system=3;z.writestr(info,data)
 with zipfile.ZipFile(temporary) as z:assert z.testzip() is None
 temporary.replace(target)
 print(json.dumps({'filename':target.name,'files':len(files),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}))
if __name__=='__main__':main()
