import { encryptData, decryptData } from '../01_Areas/Codebases/ailcc/dashboard/lib/security';

const testText = "AILCC SECURE MISSION PARAMETERS: LEVEL 12 ACTIVE";
console.log("Original Text:", testText);

try {
    const encrypted = encryptData(testText);
    console.log("Encrypted Payload:", encrypted);

    if (!encrypted.includes(':')) {
        throw new Error("Encryption failed: No IV separator found");
    }

    const decrypted = decryptData(encrypted);
    console.log("Decrypted Text:", decrypted);

    if (decrypted === testText) {
        console.log("✅ CRYPTO VERIFIED: AES-256-GCM Integrity Confirmed.");
    } else {
        console.error("❌ CRYPTO FAILED: Decrypted text mismatch.");
    }
} catch (error) {
    console.error("❌ CRYPTO ERROR:", error.message);
}
