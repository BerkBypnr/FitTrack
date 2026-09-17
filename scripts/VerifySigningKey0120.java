import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.*;
import java.security.cert.X509Certificate;
import java.util.Arrays;
import java.util.HexFormat;

/** Local challenge only. Does not build/sign an APK or export key material. */
class VerifySigningKey0120 {
    private static String env(String name) {
        String value = System.getenv(name);
        if (value == null || value.isEmpty()) throw new IllegalArgumentException("Missing signing input");
        return value;
    }
    public static void main(String[] args) {
        char[] store = null, password = null;
        try {
            store = env("FITTRACK_STORE_PASSWORD").toCharArray();
            password = env("FITTRACK_KEY_PASSWORD").toCharArray();
            KeyStore keys = KeyStore.getInstance("JKS");
            try (InputStream stream = Files.newInputStream(Path.of(env("FITTRACK_KEYSTORE")))) {
                keys.load(stream, store);
            }
            String alias = env("FITTRACK_KEY_ALIAS");
            PrivateKey key = (PrivateKey) keys.getKey(alias, password);
            X509Certificate certificate = (X509Certificate) keys.getCertificate(alias);
            String fingerprint = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(certificate.getEncoded()));
            if (!fingerprint.equals("38a4aba95148dfcf9c67b936fb0268b58878a1d22d67ef789689879c756cc4ce")) {
                throw new SecurityException("Unexpected certificate");
            }
            byte[] challenge = new byte[32]; new SecureRandom().nextBytes(challenge);
            String algorithm = switch (key.getAlgorithm()) {
                case "RSA" -> "SHA256withRSA";
                case "EC" -> "SHA256withECDSA";
                default -> throw new SecurityException("Unsupported signing algorithm");
            };
            Signature proof = Signature.getInstance(algorithm);
            proof.initSign(key); proof.update(challenge); byte[] signed = proof.sign();
            proof.initVerify(certificate); proof.update(challenge);
            if (!proof.verify(signed)) throw new SecurityException("Challenge verification failed");
            System.out.println("{\"status\":\"PASS\",\"expected_certificate\":true,\"private_key_challenge_verified\":true,\"apk_created\":false}");
        } catch (Exception error) {
            // Never log aliases, password values, key encodings or exception details.
            System.err.println("Signing-key check failed; recheck the private inputs.");
            System.exit(1);
        } finally {
            if (store != null) Arrays.fill(store, '\0');
            if (password != null) Arrays.fill(password, '\0');
        }
    }
}
