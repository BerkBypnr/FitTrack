#!/usr/bin/env python3
"""Package only the current signed beta, clean source and current QA evidence."""
import argparse, hashlib, json, shutil, subprocess, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def main():
    p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);args=p.parse_args();dest=args.output.resolve()
    if dest.exists() and any(dest.iterdir()):raise SystemExit('Output must be empty; do not mix releases.')
    version=read(ROOT/'package.json')['version'];build=read(ROOT/'out/build-result.json');inspect=read(ROOT/'test-results/apk-inspection.json')
    suites=read(ROOT/'test-results/suites.json')['results'];browser=read(ROOT/'test-results/browser-0141/results.json')
    assert build['signed'] and build['version']==version
    assert all(x['status']=='PASS' for x in suites) and all(x['status']=='PASS' for x in browser['results'])
    assert not inspect['source_comparison']['missing'] and not inspect['source_comparison']['different']
    assert inspect['alignment_valid'] and inspect['original_comparison']['native_dex_preserved']
    apk=ROOT/'out'/build['apk'];assert sha(apk)==build['sha256']==inspect['apk_sha256']
    dest.mkdir(parents=True,exist_ok=True);proof=dest/'Dogrulama';proof.mkdir();screens=dest/'Ekranlar';screens.mkdir()
    shutil.copy2(apk,dest/apk.name)
    for source,name in [
        (ROOT/f'docs/FITTRACK_ALPER_CHATGPT_DEVIR_v{version}.md',f'FitTrack-v{version}-Alper-ChatGPT-Devir.md'),
        (ROOT/f'docs/FITTRACK_v{version}_TELEFON_TESTLERI.md',f'FitTrack-v{version}-Telefon-Testleri.md'),
        (ROOT/'docs/UI_0140_OLCUM_SOZLESMESI.md','Olcum-Sozlesmesi.md'),
        (ROOT/f'BETA_{version}_NOTLARI.md','BASLAMADAN_OKU.md'),
        (ROOT/'docs/references/YOL_HARITASI_REV9_ORIJINAL.md','Yol-Haritasi-Rev9.md')]:
        shutil.copy2(source,dest/name)
    for name in ('apk-inspection.json','suites.json','workout-0140.json','database-0114.json','npm-audit-production.json','apksigner-verification.txt','release-build.log'):
        shutil.copy2(ROOT/'test-results'/name,proof/name)
    shutil.copy2(ROOT/'out/build-result.json',proof/'build-result.json')
    shutil.copy2(ROOT/'test-results/browser-0141/results.json',proof/'browser-0141.json')
    for name in ('final-active-dark-red','final-active-plum-night','final-active-redline-editorial','final-active-rosewood-strength','final-history-dark-red','final-history-plum-night','final-history-redline-editorial','final-history-rosewood-strength','final-summary-dark-red','final-summary-redline-editorial','final-profile-name-light','active-320x568','active-740x360','large-text-320x568','currentWeight-keyboard','targetWeight-keyboard'):
        shutil.copy2(ROOT/'test-results/browser-0141'/(name+'.png'),screens/(name+'.png'))
    (screens/'OKU.md').write_text('Bunlar temsili veriyle gerçek Chromium ekran görüntüleridir; tasarım maketi veya fiziksel telefon kanıtı değildir. Klavye görselleri daraltılmış viewport simülasyonudur.\n',encoding='utf-8')
    report=f"""# FitTrack {version} — doğrulama özeti

- Sürüm: {version} / {build['versionCode']}; yerel şema 15.
- Yerel otomatik test grubu: {len(suites)}/{len(suites)} PASS.
- Gerçek Chromium kontrolü: {len(browser['results'])}/{len(browser['results'])} PASS.
- APK/kaynak eşleşmesi: {inspect['source_comparison']['matched_count']} dosya.
- APK V2/V3 imza, ZIP CRC ve hizalama başarılı.
- Önceki 0.14.0 ile paket, origin, izinler, native DEX, logo ve splash korunmuş.
- Üretim npm audit: {read(ROOT/'test-results/npm-audit-production.json')['metadata']['vulnerabilities']['total']} bilinen açık.
- Fiziksel telefon/IME, SMTP, push, temiz Gradle rebuild: NOT_RUN.
- Canlı Supabase, GitHub, gerçek müşteri verisi: DEĞİŞTİRİLMEDİ.

APK SHA-256: {build['sha256']}
Sertifika SHA-256: {build['certificate_sha256']}

Üretim yöntemi: {build['native']}.
Kısıtlar ve açık kabul işleri devir/telefon belgelerindedir. Yeni ölçüm kullanan pilot grubunun tüm cihazları 0.14 olmalı.
"""
    (dest/f'FitTrack-v{version}-Dogrulama-Raporu.md').write_text(report,encoding='utf-8')
    source=dest/f'FitTrack-Beta-{version}-Source.zip'
    subprocess.run(['python3',str(ROOT/'scripts/package_source.py'),'--output',str(source)],check=True)
    checks={f.relative_to(dest).as_posix():sha(f) for f in sorted(dest.rglob('*')) if f.is_file() and f.name!='SHA256SUMS.json'}
    (dest/'SHA256SUMS.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    bundle=dest.parent/f'FitTrack-v{version}-Tam-Teslim.zip'
    with zipfile.ZipFile(bundle,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for f in sorted(dest.rglob('*')):
            if f.is_file():z.write(f,dest.name+'/'+f.relative_to(dest).as_posix())
    with zipfile.ZipFile(bundle) as z:assert z.testzip() is None
    print(json.dumps({'bundle':str(bundle),'bytes':bundle.stat().st_size,'sha256':sha(bundle),'apk':str(dest/apk.name),'source':str(source)},indent=2))
if __name__=='__main__':main()
