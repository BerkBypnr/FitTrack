#!/usr/bin/env python3
"""Build standard Gradle Android; optional signing uses FITTRACK_* env secrets."""
import argparse, hashlib, json, os, re, shutil, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
EXPECTED_CERT = '38a4aba95148dfcf9c67b936fb0268b58878a1d22d67ef789689879c756cc4ce'

def run(args, **kwargs):
    subprocess.run([str(x) for x in args], check=True, cwd=kwargs.pop('cwd', ROOT), **kwargs)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sign', action='store_true')
    parser.add_argument('--offline', action='store_true', help='Build only with already cached Gradle dependencies')
    parser.add_argument('--output', type=Path, default=ROOT/'out')
    parser.add_argument('--gradle', type=Path, help='Optional Gradle executable; default is checked-in wrapper')
    args = parser.parse_args()
    version = json.loads((ROOT/'package.json').read_text())['version']
    if args.sign:
        for name in ('FITTRACK_KEYSTORE','FITTRACK_KEY_ALIAS','FITTRACK_STORE_PASSWORD','FITTRACK_KEY_PASSWORD'):
            if not os.environ.get(name): raise SystemExit('Missing signing environment variable: '+name)
    run(['node', ROOT/'scripts/stage_web.cjs'])  # includes member-ui.css and all canonical assets
    run(['node', ROOT/'node_modules/@capacitor/cli/bin/capacitor', 'sync', 'android'])
    gradle = args.gradle or ROOT/'android'/('gradlew.bat' if os.name == 'nt' else 'gradlew')
    run([gradle, '--no-daemon', '--console=plain'] + (['--offline'] if args.offline else []) + ['clean', ':app:assembleRelease'], cwd=ROOT/'android')
    args.output.mkdir(parents=True, exist_ok=True)
    unsigned = args.output/f'FitTrack-Android-v{version}-unsigned.apk'
    shutil.copy2(ROOT/'android/app/build/outputs/apk/release/app-release-unsigned.apk', unsigned)
    result = {'version':version,'native':'standard Gradle/Capacitor','unsigned':unsigned.name,'signed':False}
    if args.sign:
        sdk = os.environ.get('ANDROID_HOME') or os.environ.get('ANDROID_SDK_ROOT')
        if not sdk: raise SystemExit('Set ANDROID_HOME to the Android SDK directory.')
        signer = Path(sdk)/'build-tools/36.0.0'/('apksigner.bat' if os.name == 'nt' else 'apksigner')
        apk = args.output/f'FitTrack-Android-v{version}-beta.apk'
        run([signer,'sign','--ks',os.environ['FITTRACK_KEYSTORE'],'--ks-key-alias',os.environ['FITTRACK_KEY_ALIAS'],
             '--ks-pass','env:FITTRACK_STORE_PASSWORD','--key-pass','env:FITTRACK_KEY_PASSWORD',
             '--v1-signing-enabled','true','--v2-signing-enabled','true','--v3-signing-enabled','true',
             '--out',apk,unsigned])
        checked = subprocess.run([str(signer),'verify','--verbose','--print-certs',str(apk)],check=True,text=True,capture_output=True)
        match = re.search(r'certificate SHA-256 digest:\s*([0-9a-fA-F:]+)',checked.stdout)
        if not match or match.group(1).replace(':','').lower() != EXPECTED_CERT:
            apk.unlink(missing_ok=True)
            raise SystemExit('Signing certificate mismatch; release APK removed.')
        (args.output/'apksigner-verification.txt').write_text(checked.stdout,encoding='utf-8')
        result.update(signed=True,apk=apk.name,bytes=apk.stat().st_size,sha256=hashlib.sha256(apk.read_bytes()).hexdigest(),certificate_sha256=EXPECTED_CERT)
    (args.output/'build-result.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result))

if __name__ == '__main__': main()
