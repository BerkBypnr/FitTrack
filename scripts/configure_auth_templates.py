#!/usr/bin/env python3
"""Install signup/recovery templates and set six-digit email codes.
Password login never sends a code; the Magic Link template is not changed.
Default: print reviewable configuration. --apply requires SUPABASE_ACCESS_TOKEN.
Never print the token or unrelated project configuration (SMTP secrets included).
"""
import argparse,json,os,sys,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PROJECT='eznxeqraejmwfpwcuxxc'

def desired():
 payload={'mailer_otp_length':6}
 for key,subject in [('confirmation','FitTrack e-posta doğrulama kodun'),('recovery','FitTrack şifre yenileme kodun')]:
  payload['mailer_templates_'+key+'_content']=(ROOT/'supabase/templates'/f'{key}.html').read_text(encoding='utf-8')
  payload['mailer_subjects_'+key]=subject
 return payload

def main():
 p=argparse.ArgumentParser();p.add_argument('--apply',action='store_true');p.add_argument('--backup',type=Path,default=ROOT/'out/auth-templates-before.json');args=p.parse_args();payload=desired()
 if not args.apply: print(json.dumps(payload,ensure_ascii=False,indent=2));return
 token=os.environ.get('SUPABASE_ACCESS_TOKEN')
 if not token:raise SystemExit('SUPABASE_ACCESS_TOKEN must be supplied privately through the environment. Do not put it in source control.')
 url=f'https://api.supabase.com/v1/projects/{PROJECT}/config/auth'
 def request(method,data=None):
  req=urllib.request.Request(url,data=json.dumps(data).encode() if data is not None else None,method=method,headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
  with urllib.request.urlopen(req,timeout=30) as response:return json.load(response)
 try:
  old=request('GET')
  if old.get('mailer_autoconfirm') is not False:raise SystemExit('Enable Confirm email in the dashboard first; signup must require email verification.')
  args.backup.parent.mkdir(parents=True,exist_ok=True);args.backup.write_text(json.dumps({k:old.get(k) for k in payload},ensure_ascii=False,indent=2),encoding='utf-8');request('PATCH',payload)
  actual=request('GET')
  if any(actual.get(k)!=v for k,v in payload.items()):raise SystemExit('Template verification failed. Inspect the dashboard before distributing the APK.')
  print('Signup/recovery templates and six-digit email OTP setting verified. Real email delivery still needs a device test.')
 except urllib.error.HTTPError as e:raise SystemExit('Supabase Management API returned HTTP '+str(e.code)+'. Check account permissions; no secret values were printed.') from None
if __name__=='__main__':main()
