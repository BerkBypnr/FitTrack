#!/usr/bin/env python3
"""Web-only beta repack. Native DEX stays byte-identical; this is NOT a Gradle build.
Signing credentials are read only from the same FITTRACK_* env used by build_android.py.
Requires a verified, compatible previous-version base APK and external apktool/apksigner jars.
"""
import argparse, hashlib, json, os, re, shutil, subprocess, tempfile, zipfile
from pathlib import Path
from zipalign_apk import align_apk
ROOT=Path(__file__).resolve().parents[1]
CERT='38a4aba95148dfcf9c67b936fb0268b58878a1d22d67ef789689879c756cc4ce'
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def main():
    p=argparse.ArgumentParser();p.add_argument('--base-apk',type=Path,required=True);p.add_argument('--apktool',type=Path,required=True);p.add_argument('--apksigner',type=Path,required=True);p.add_argument('--output',type=Path,default=ROOT/'out');args=p.parse_args()
    # Signing stays a separate final step when the existing release key is unavailable.
    unsigned_only = os.environ.get('FITTRACK_UNSIGNED_ONLY') == '1'
    if not unsigned_only:
        for key in ('FITTRACK_KEYSTORE','FITTRACK_KEY_ALIAS','FITTRACK_STORE_PASSWORD','FITTRACK_KEY_PASSWORD'):
            if not os.environ.get(key): raise SystemExit('Missing '+key)
    version=json.loads((ROOT/'package.json').read_text())['version'];code=int(re.search(r'versionCode\s+(\d+)',(ROOT/'android/app/build.gradle').read_text()).group(1))
    args.output.mkdir(parents=True,exist_ok=True);evidence=ROOT/'test-results';evidence.mkdir(exist_ok=True);events=[]
    def run(command):
        result=subprocess.run([str(x) for x in command],cwd=ROOT,text=True,capture_output=True)
        events.append(result.stdout+result.stderr);(evidence/'release-build.log').write_text('\n'.join(events))
        if result.returncode: raise RuntimeError('Command failed: '+str(command[0])+', see test-results/release-build.log')
        return result.stdout
    signer=['java','-cp',args.apksigner,'com.android.apksigner.ApkSignerTool']
    base_verified=run(signer+['verify','--verbose','--print-certs',args.base_apk])
    assert re.search(r'certificate SHA-256 digest:\s*'+CERT,base_verified,re.I),'Unexpected base certificate'
    run(['node','scripts/stage_web.cjs']);run(['node','node_modules/@capacitor/cli/bin/capacitor','sync','android'])
    with zipfile.ZipFile(args.base_apk) as base:
        assert base.testzip() is None
        assert base.read('assets/native-bootstrap.js')==(ROOT/'android/app/src/main/assets/native-bootstrap.js').read_bytes(),'Native bootstrap changed; use Gradle instead'
        assert json.loads(base.read('assets/capacitor.config.json'))==json.loads((ROOT/'android/app/src/main/assets/capacitor.config.json').read_text()),'Native config changed; use Gradle'
        assert json.loads(base.read('assets/capacitor.plugins.json'))==json.loads((ROOT/'android/app/src/main/assets/capacitor.plugins.json').read_text()),'Native plugins changed; use Gradle'
    work=Path(tempfile.mkdtemp(prefix='repack-',dir=args.output));decoded=work/'decoded'
    run(['java','-jar',args.apktool,'d','--no-src','-p',args.output/'framework-cache',args.base_apk,'-o',decoded])
    metadata=decoded/'apktool.yml';text=metadata.read_text();text=re.sub(r'(?m)^  versionCode:.*$',f'  versionCode: {code}',text);text=re.sub(r'(?m)^  versionName:.*$',f'  versionName: {version}',text);metadata.write_text(text)
    # The only replaced folder is generated in our fresh temporary decode.
    shutil.move(decoded/'assets/public',work/'previous-public');shutil.copytree(ROOT/'www',decoded/'assets/public')
    unsigned=args.output/f'FitTrack-Android-v{version}-unsigned.apk';aligned=work/'aligned.apk';apk=args.output/f'FitTrack-Android-v{version}-beta-signed.apk'
    run(['java','-jar',args.apktool,'b','-p',args.output/'framework-cache',decoded,'-o',unsigned]);align_apk(unsigned,aligned)
    if unsigned_only:
        shutil.copy2(aligned,unsigned)
        with zipfile.ZipFile(args.base_apk) as before,zipfile.ZipFile(unsigned) as after:
            names=[n for n in before.namelist() if re.fullmatch(r'classes\d*\.dex',n)];assert names
            for name in names: assert before.read(name)==after.read(name),'Native DEX changed'
            assert after.testzip() is None
        result={'version':version,'versionCode':code,'schema':15,'native':'Controlled web-only repack; not a Gradle build','signed':False,'apk':unsigned.name,'bytes':unsigned.stat().st_size,'sha256':sha(unsigned),'expected_signing_certificate_sha256':CERT,'base_apk_sha256':sha(args.base_apk),'native_dex_preserved':True,'phone_test':'NOT_RUN','status':'AWAITING_EXISTING_RELEASE_KEY'}
        (args.output/'build-result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));return
    run(signer+['sign','--ks',os.environ['FITTRACK_KEYSTORE'],'--ks-key-alias',os.environ['FITTRACK_KEY_ALIAS'],'--ks-pass','env:FITTRACK_STORE_PASSWORD','--key-pass','env:FITTRACK_KEY_PASSWORD','--v1-signing-enabled','true','--v2-signing-enabled','true','--v3-signing-enabled','true','--v4-signing-enabled','false','--out',apk,aligned])
    verified=run(signer+['verify','--verbose','--print-certs',apk]);assert re.search(r'certificate SHA-256 digest:\s*'+CERT,verified,re.I)
    (evidence/'apksigner-verification.txt').write_text(verified)
    with zipfile.ZipFile(args.base_apk) as before,zipfile.ZipFile(apk) as after:
        names=[n for n in before.namelist() if re.fullmatch(r'classes\d*\.dex',n)];assert names
        for name in names: assert before.read(name)==after.read(name),'Native DEX changed'
        assert after.testzip() is None
    result={'version':version,'versionCode':code,'schema':15,'native':'Controlled web-only repack of verified previous-version APK, not a fresh Gradle build','signed':True,'apk':apk.name,'bytes':apk.stat().st_size,'sha256':sha(apk),'certificate_sha256':CERT,'base_apk_sha256':sha(args.base_apk),'native_dex_preserved':True,'apktool_sha256':sha(args.apktool),'apksigner_sha256':sha(args.apksigner),'phone_test':'NOT_RUN'}
    (args.output/'build-result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
if __name__=='__main__':main()
