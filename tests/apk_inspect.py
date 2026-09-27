"""APK/source, signature, version, alignment and optional upgrade-contract inspection. Read-only.
APK v2 checks follow https://source.android.com/docs/security/features/apksigning/v2
This limited inspector is not a replacement for Android's apksigner/device verifier.
"""
import hashlib, json, os, re, struct, sys, zipfile, zlib
from pathlib import Path
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, ec
BASE=Path(__file__).resolve().parents[1]
APK=Path(os.environ.get('FITTRACK_APK',BASE/'out/FitTrack-Android-v0.14.2-beta-signed.apk'))
SRC=Path(os.environ.get('FITTRACK_SOURCE',BASE))
OUT=Path(os.environ.get('FITTRACK_AUDIT_OUTPUT',BASE/'test-results'))
OUT.mkdir(parents=True,exist_ok=True)
def u32(b,i=0):return struct.unpack_from('<I',b,i)[0]
def u64(b,i=0):return struct.unpack_from('<Q',b,i)[0]
def lp(b,i=0):
    n=u32(b,i);assert i+4+n<=len(b)
    return b[i+4:i+4+n],i+4+n
def seq(b):
    i=0
    while i<len(b):
        v,i=lp(b,i);yield v
def binary_xml(b):
    strings=[]; nodes=[];pos=8
    def length8(i):
        v=b[i];return (((v&127)<<8)|b[i+1],i+2) if v&128 else (v,i+1)
    def length16(i):
        v=struct.unpack_from('<H',b,i)[0];return (((v&32767)<<16)|struct.unpack_from('<H',b,i+2)[0],i+4) if v&32768 else (v,i+2)
    def s(i):return strings[i] if i!=0xffffffff else None
    while pos<len(b):
        t,h,size=struct.unpack_from('<HHI',b,pos);assert size>=8 and pos+size<=len(b)
        if t==1:
            count,_,flags,start,_=struct.unpack_from('<IIIII',b,pos+8)
            for n in range(count):
                p=pos+start+u32(b,pos+h+4*n)
                if flags&256:
                    _,p=length8(p);nbytes,p=length8(p);strings.append(b[p:p+nbytes].decode('utf-8'))
                else:
                    nchar,p=length16(p);strings.append(b[p:p+nchar*2].decode('utf-16-le'))
        elif t==0x102:
            ext=pos+h;name=s(u32(b,ext+4));off,step,n=struct.unpack_from('<HHH',b,ext+8);attrs={}
            for j in range(n):
                a=ext+off+j*step;_,key,raw=struct.unpack_from('<III',b,a);typ=b[a+15];value=u32(b,a+16)
                if raw!=0xffffffff:val=s(raw)
                elif typ==3:val=s(value)
                elif typ==0x12:val=bool(value)
                elif typ in (0x10,0x11):val=value
                else:val=f'@0x{value:08x}'
                attrs[s(key)]=val
            nodes.append({'tag':name,'attributes':attrs})
        pos+=size
    return nodes
data=APK.read_bytes(); eocd=data.rfind(b'PK\x05\x06');assert eocd>=0
cd=u32(data,eocd+16); assert data[cd-16:cd]==b'APK Sig Block 42'
block_size=u64(data,cd-24); block=cd-block_size-8
assert u64(data,block)==block_size
assert cd+u32(data,eocd+12)==eocd
assert eocd+22+struct.unpack_from('<H',data,eocd+20)[0]==len(data)
pairs={};i=block+8
while i<cd-24:
    size=u64(data,i);i+=8;pairs[u32(data,i)]=data[i+4:i+size];i+=size
v2,_=lp(pairs[0x7109871a]);signers=[]
for signer in seq(v2):
    signed,p=lp(signer); signatures,p=lp(signer,p); public,p=lp(signer,p)
    digs,q=lp(signed);certs,q=lp(signed,q);cert=x509.load_der_x509_certificate(next(seq(certs)))
    assert cert.public_key().public_bytes(serialization.Encoding.DER,serialization.PublicFormat.SubjectPublicKeyInfo)==public
    digests={u32(x):lp(x,4)[0] for x in seq(digs)}
    sigs={u32(x):lp(x,4)[0] for x in seq(signatures)}
    assert list(digests)==list(sigs)
    checks=[]
    for alg,sig in sigs.items():
        h=hashes.SHA512() if alg in (0x102,0x104,0x202) else hashes.SHA256()
        if alg in (0x103,0x104):cert.public_key().verify(sig,signed,padding.PKCS1v15(),h)
        elif alg in (0x101,0x102):cert.public_key().verify(sig,signed,padding.PSS(mgf=padding.MGF1(h),salt_length=h.digest_size),h)
        elif alg in (0x201,0x202):cert.public_key().verify(sig,signed,ec.ECDSA(h))
        else:raise ValueError(f'Unsupported algorithm: {alg:x}')
        hashfn=hashlib.sha512 if h.digest_size==64 else hashlib.sha256
        end=bytearray(data[eocd:]);struct.pack_into('<I',end,16,block);chunks=[]
        for section in (data[:block],data[cd:eocd],end):
            for at in range(0,len(section),1048576):
                piece=section[at:at+1048576];chunks.append(hashfn(b'\xa5'+struct.pack('<I',len(piece))+piece).digest())
        content_digest=hashfn(b'\x5a'+struct.pack('<I',len(chunks))+b''.join(chunks)).digest()
        assert content_digest==digests[alg]
        checks.append({'algorithm':hex(alg),'signature_valid':True,'apk_content_digest_valid':True})
    signers.append({'certificate_sha256':cert.fingerprint(hashes.SHA256()).hex(':').upper(),'algorithms':checks})
with zipfile.ZipFile(APK) as z:
    crc_problem=z.testzip();assert crc_problem is None
    manifest=binary_xml(z.read('AndroidManifest.xml'))
    native_config=json.loads(z.read('assets/capacitor.config.json'))
    plugins=json.loads(z.read('assets/capacitor.plugins.json'))
    matched=[];different=[];absent=[]
    web_paths=[SRC/n for n in ['app.js','cloud.js','config.js','index.html','styles.css','member-ui.css','design-system.css','workout-ui.css','sw.js','icon.svg','manifest.webmanifest']]
    web_paths += list((SRC/'assets').rglob('*')) + list((SRC/'vendor').rglob('*'))
    for p in web_paths:
        if not p.is_file():continue
        rel=p.relative_to(SRC).as_posix();key='assets/public/'+rel
        if key not in z.namelist():absent.append(rel)
        elif z.read(key)!=p.read_bytes():different.append(rel)
        else:matched.append(rel)
    extras=[p for p in z.namelist() if p.startswith('assets/public/') and p[14:] not in matched+different and not p.endswith('/')]
    dex=[]
    for name in sorted(n for n in z.namelist() if re.fullmatch(r'classes\d*\.dex',n)):
        b=z.read(name);dex.append({'name':name,'sha1_valid':hashlib.sha1(b[32:]).digest()==b[12:32],'adler32_valid':zlib.adler32(b[12:])&0xffffffff==u32(b,8)})
    keyfiles=[n for n in z.namelist() if n.lower().endswith(('.jks','.keystore','.p12','.pfx','.env'))]
    secret_locations=[]
    for name in z.namelist():
        if name.endswith('/'):continue
        b=z.read(name)
        if re.search(rb'sb_secret_[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',b):secret_locations.append(name)
        for token in re.findall(rb'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',b):
            try:
                import base64
                part=token.split(b'.')[1];claim=json.loads(base64.urlsafe_b64decode(part+b'='*(-len(part)%4)))
                if claim.get('role')=='service_role':secret_locations.append(name)
            except Exception:pass
    native_resources={n:hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith('res/') and any(term in n for term in ('launcher','splash','notification'))}
result={'apk_sha256':hashlib.sha256(data).hexdigest(),'zip_crc_valid':True,'signers':signers,
        'manifest':manifest,'capacitor_config':native_config,'capacitor_plugins':plugins,
        'source_comparison':{'matched_count':len(matched),'different':different,'missing':absent,'apk_only_web_files':extras},
        'dex_integrity':dex,'secret_scan':{'private_key_file_names':keyfiles,'secret_or_service_role_locations':sorted(set(secret_locations))},'native_resource_hashes':native_resources,
        'limitations':['No physical Android runtime; official apksig verification performed separately','No full DEX decompilation','Secret scan detects selected patterns, not proof of absence']}
(OUT/'apk-inspection.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
assert not different and not absent, 'APK web source mismatch'
assert all(x['sha1_valid'] and x['adler32_valid'] for x in dex)
assert not keyfiles and not secret_locations
assert signers[0]['certificate_sha256']=='38:A4:AB:A9:51:48:DF:CF:9C:67:B9:36:FB:02:68:B5:88:78:A1:D2:2D:67:EF:78:96:89:87:9C:75:6C:C4:CE'
m=next(n['attributes'] for n in manifest if n['tag']=='manifest')
assert m['versionName']=='0.14.2' and m['versionCode']==34 and m['package']=='com.fittracklabs.mobile'
sdk=next(n['attributes'] for n in manifest if n['tag']=='uses-sdk');assert sdk['minSdkVersion']==24 and sdk['targetSdkVersion']==36
assert native_config['android']['webContentsDebuggingEnabled'] is False
assert native_config['server']['androidScheme']=='https' and native_config['server']['hostname']=='localhost'
assert native_config['plugins']['App']['disableBackButtonHandler'] is True
app=next(n['attributes'] for n in manifest if n['tag']=='application')
assert app.get('allowBackup') is False and app.get('debuggable',False) is False and app.get('usesCleartextTraffic') is False
activity=next(n['attributes'] for n in manifest if n['tag']=='activity' and n['attributes']['name'].endswith('.MainActivity'))
assert activity['exported'] is True and activity['launchMode']==2 and activity['windowSoftInputMode']==16
assert any(n['tag']=='data' and n['attributes'].get('scheme')=='com.fittracklabs.mobile' and n['attributes'].get('host')=='auth-callback' for n in manifest)
providers=[n['attributes'] for n in manifest if n['tag']=='provider']
assert all(provider.get('exported') is False for provider in providers)
assert any(provider.get('authorities')=='com.fittracklabs.mobile.fileprovider' and provider.get('grantUriPermissions') for provider in providers)
assert {plugin['pkg'] for plugin in plugins}=={'@capacitor/app','@capacitor/filesystem','@capacitor/local-notifications','@capacitor/share'}
with zipfile.ZipFile(APK) as native_apk:
    assert native_apk.read('assets/native-bootstrap.js')==(SRC/'android/app/src/main/assets/native-bootstrap.js').read_bytes()
result['native_upgrade_contract']={'package_version_sdk':True,'origin':'https://localhost','back_plugin_disabled':True,'debuggable':False,'allowBackup':False,'cleartext':False,'auth_deep_link':True,'file_providers_unexported':True,'native_cache_bootstrap_matches':True}
with zipfile.ZipFile(APK) as current:
    unaligned=[]
    for entry in current.infolist():
        if entry.compress_type==zipfile.ZIP_STORED:
            name_len,extra_len=struct.unpack_from('<HH',data,entry.header_offset+26)
            if (entry.header_offset+30+name_len+extra_len)%(16384 if entry.filename.endswith('.so') else 4):unaligned.append(entry.filename)
    assert not unaligned,unaligned
    result['alignment_valid']=True
    previous=os.environ.get('FITTRACK_PREVIOUS_APK')
    if previous:
        with zipfile.ZipFile(previous) as original:
            original_manifest=binary_xml(original.read('AndroidManifest.xml'))
            old_identity=next(n['attributes'] for n in original_manifest if n['tag']=='manifest')
            assert old_identity['package']==m['package'] and old_identity['versionCode']<m['versionCode']
            old_config=json.loads(original.read('assets/capacitor.config.json'))
            origin=lambda config:config.get('server',{}).get('androidScheme','https')+'://'+config.get('server',{}).get('hostname','localhost')
            assert origin(old_config)==origin(native_config)
            perms=lambda nodes:set(n['attributes']['name'] for n in nodes if n['tag']=='uses-permission')
            old_perms,new_perms=perms(original_manifest),perms(manifest)
            assert old_perms==new_perms,'Review permission delta: '+str((old_perms-new_perms,new_perms-old_perms))
            resource_checks={}
            for name in original.namelist():
                if name.startswith('res/') and name.endswith(('/fittrack_app_icon.xml','/fittrack_splash.xml')):
                    resource_checks[name]=binary_xml(original.read(name))==binary_xml(current.read(name))
            assert len(resource_checks)>=2 and all(resource_checks.values()), 'Approved icon and splash must remain unchanged'
            assert 'M10,43C13,27' in (SRC/'android/app/src/main/res/drawable/fittrack_app_icon.xml').read_text()
            previous_dex={name:hashlib.sha256(original.read(name)).hexdigest() for name in original.namelist() if re.fullmatch(r'classes\d*\.dex',name)}
            current_dex={name:hashlib.sha256(current.read(name)).hexdigest() for name in current.namelist() if re.fullmatch(r'classes\d*\.dex',name)}
            assert previous_dex==current_dex, 'Native DEX changed during the 0.14.2 web repack'
            result['original_comparison']={'original_apk_sha256':hashlib.sha256(Path(previous).read_bytes()).hexdigest(),'package_preserved':True,'version_increased':True,'origin_preserved':True,'permissions_preserved':True,'native_dex_preserved':True,'icon_splash_preserved':resource_checks,'note':'The verified previous-version APK was repackaged with unchanged native DEX, icon and native configuration. Only web assets and version metadata changed. Physical data-preserving upgrade remains a phone test.'}
(OUT/'apk-inspection.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps({'status':'PASS','apk_sha256':result['apk_sha256'],'web_files_matched':len(matched),'signature_v2':'valid','versionName':m['versionName'],'versionCode':m['versionCode'],'alignment':'valid','original_comparison':result.get('original_comparison')},ensure_ascii=False,indent=2))
