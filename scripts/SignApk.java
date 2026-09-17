import com.android.apksig.ApkSigner;
import com.android.apksig.ApkVerifier;
import java.io.*;
import java.security.*;
import java.security.cert.X509Certificate;
import java.util.*;

/** Official Android apksig wrapper. Secrets only via environment, never arguments. */
public class SignApk {
  private static String env(String name) { String v=System.getenv(name); if(v==null||v.isEmpty()) throw new IllegalArgumentException("Missing environment variable: "+name); return v; }
  public static void main(String[] args) throws Exception {
    if(args.length==2 && args[0].equals("verify")) { verify(new File(args[1])); return; }
    if(args.length!=2) throw new IllegalArgumentException("Usage: SignApk unsigned.apk signed.apk | SignApk verify signed.apk");
    KeyStore ks=KeyStore.getInstance("JKS");
    char[] storePass=env("FITTRACK_STORE_PASSWORD").toCharArray();
    char[] keyPass=env("FITTRACK_KEY_PASSWORD").toCharArray();
    try(InputStream stream=new FileInputStream(env("FITTRACK_KEYSTORE"))) {ks.load(stream,storePass);}
    String alias=env("FITTRACK_KEY_ALIAS");
    PrivateKey key=(PrivateKey)ks.getKey(alias,keyPass);
    List<X509Certificate> chain=new ArrayList<>();
    for(java.security.cert.Certificate c:ks.getCertificateChain(alias)) chain.add((X509Certificate)c);
    Arrays.fill(storePass,'\0');Arrays.fill(keyPass,'\0');
    ApkSigner.SignerConfig signer=new ApkSigner.SignerConfig.Builder("FITTRACK",key,chain).build();
    new ApkSigner.Builder(Collections.singletonList(signer)).setInputApk(new File(args[0])).setOutputApk(new File(args[1])).setMinSdkVersion(24).setV1SigningEnabled(true).setV2SigningEnabled(true).build().sign();
    verify(new File(args[1]));
  }
  private static void verify(File apk) throws Exception {
    ApkVerifier.Result result=new ApkVerifier.Builder(apk).setMinCheckedPlatformVersion(23).build().verify();
    if(!result.isVerified()) {
      System.err.println("v1="+result.isVerifiedUsingV1Scheme()+"; v2="+result.isVerifiedUsingV2Scheme());
      for(ApkVerifier.Result.V1SchemeSignerInfo signer:result.getV1SchemeSigners()) System.err.println(signer.getErrors());
      for(ApkVerifier.Result.V2SchemeSignerInfo signer:result.getV2SchemeSigners()) System.err.println(signer.getErrors());
      throw new SecurityException("APK verification failed: "+result.getErrors());
    }
    for(X509Certificate c:result.getSignerCertificates()) {
      byte[] digest=MessageDigest.getInstance("SHA-256").digest(c.getEncoded());
      StringBuilder s=new StringBuilder();for(byte b:digest){if(s.length()>0)s.append(':');s.append(String.format("%02X",b&255));}
      System.out.println("Signer SHA-256: "+s);
    }
    System.out.println("Verified: "+result.isVerified()+"; v1="+result.isVerifiedUsingV1Scheme()+"; v2="+result.isVerifiedUsingV2Scheme());
  }
}
