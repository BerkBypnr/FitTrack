#!/usr/bin/env python3
"""Verify unsigned build content. Does not approve signing or phone installation."""
import argparse,hashlib,json,subprocess,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
 p=argparse.ArgumentParser();p.add_argument('--apk',type=Path,required=True);p.add_argument('--build-tools',type=Path,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
 version=json.loads((ROOT/'package.json').read_text())['version']
 badging=subprocess.check_output([str(a.build_tools/'aapt2'),'dump','badging',str(a.apk)],text=True)
 assert "name='com.fittracklabs.mobile'" in badging and "versionCode='29'" in badging and f"versionName='{version}'" in badging
 assert "minSdkVersion:'24'" in badging and "targetSdkVersion:'36'" in badging
 alignment=subprocess.run([str(a.build_tools/'zipalign'),'-c','-P','16','4',str(a.apk)],text=True,capture_output=True);assert alignment.returncode==0,alignment.stderr
 files=[ROOT/x for x in ['index.html','app.js','cloud.js','config.js','styles.css','member-ui.css','sw.js','manifest.webmanifest','icon.svg']]
 for directory in ['assets','vendor']:files += [f for f in (ROOT/directory).rglob('*') if f.is_file()]
 matched=[]
 with zipfile.ZipFile(a.apk) as z:
  assert z.testzip() is None
  for f in files:
   rel=f.relative_to(ROOT).as_posix()
   assert z.read('assets/public/'+rel)==f.read_bytes(),rel+' differs'
   matched.append(rel)
  assert z.read('assets/native-bootstrap.js')==(ROOT/'android/app/src/main/assets/native-bootstrap.js').read_bytes()
  config=json.loads(z.read('assets/capacitor.config.json'))
  assert config['server']['hostname']=='localhost' and config['server']['androidScheme']=='https'
  assert not config['android']['webContentsDebuggingEnabled']
  assert config['plugins']['App']['disableBackButtonHandler']
  plugins=json.loads(z.read('assets/capacitor.plugins.json'))
  assert {x['pkg'] for x in plugins}=={'@capacitor/app','@capacitor/filesystem','@capacitor/local-notifications','@capacitor/share'}
  forbidden=[x for x in z.namelist() if x.endswith(('.jks','.keystore','.p12','.pfx'))];assert not forbidden
 result={'version':version,'versionCode':29,'package':'com.fittracklabs.mobile','signed':False,'installable_update':False,
 'apk_sha256':hashlib.sha256(a.apk.read_bytes()).hexdigest(),'apk_bytes':a.apk.stat().st_size,'zip_crc_valid':True,'alignment_16k':True,
 'canonical_web_matches':len(matched),'matched_files':matched,'native_bootstrap_matches':True,'capacitor_config':config,'plugins':plugins,
 'limitations':['Unsigned APK: existing beta signing key required','No physical Android upgrade or runtime claim']}
 a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({k:v for k,v in result.items() if k not in ['matched_files','capacitor_config','plugins']},ensure_ascii=False))
if __name__=='__main__':main()
