/**
 * Secure storage utility for encrypting sensitive data in localStorage/sessionStorage
 * Uses the Web Crypto API for encryption
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

/**
 * Generates a cryptographic key from a password
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Gets or creates a storage encryption key
 */
async function getStorageKey(): Promise<CryptoKey> {
  // Use a combination of browser fingerprint and session data to derive key
  const keyMaterial = `${navigator.userAgent}|${window.location.origin}`;
  const salt = new TextEncoder().encode('docketchief-storage-salt-v1');
  return deriveKey(keyMaterial, salt);
}

/**
 * Encrypts data using AES-GCM
 */
async function encryptData(data: string): Promise<string> {
  const key = await getStorageKey();
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    dataBuffer
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts data using AES-GCM
 */
async function decryptData(encryptedData: string): Promise<string> {
  const key = await getStorageKey();

  // Decode from base64
  const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

  // Extract IV and encrypted data
  const iv = combined.slice(0, IV_LENGTH);
  const data = combined.slice(IV_LENGTH);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    data
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Secure storage wrapper for localStorage
 */
export class SecureStorage {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  /**
   * Sets an encrypted item in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      const encrypted = await encryptData(value);
      this.storage.setItem(key, encrypted);
    } catch (error) {
      console.error('[SecureStorage] Failed to encrypt and store item:', error);
      throw new Error('Failed to store secure data');
    }
  }

  /**
   * Gets and decrypts an item from storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const encrypted = this.storage.getItem(key);
      if (!encrypted) return null;
      return await decryptData(encrypted);
    } catch (error) {
      console.error('[SecureStorage] Failed to decrypt item:', error);
      // If decryption fails, remove the corrupted data
      this.storage.removeItem(key);
      return null;
    }
  }

  /**
   * Removes an item from storage
   */
  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  /**
   * Clears all items from storage
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Checks if an item exists in storage
   */
  hasItem(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }

  /**
   * Sets a JSON object in encrypted storage
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    const json = JSON.stringify(value);
    await this.setItem(key, json);
  }

  /**
   * Gets a JSON object from encrypted storage
   */
  async getObject<T>(key: string): Promise<T | null> {
    const json = await this.getItem(key);
    if (!json) return null;
    try {
      return JSON.parse(json) as T;
    } catch (error) {
      console.error('[SecureStorage] Failed to parse JSON:', error);
      this.removeItem(key);
      return null;
    }
  }
}

// Export singleton instances
export const secureLocalStorage = new SecureStorage(localStorage);
export const secureSessionStorage = new SecureStorage(sessionStorage);

/**
 * Migrates existing plain-text storage to encrypted storage
 */
export async function migrateToSecureStorage(keys: string[]): Promise<void> {
  for (const key of keys) {
    const plainValue = localStorage.getItem(key);
    if (plainValue && !plainValue.startsWith('encrypted:')) {
      try {
        await secureLocalStorage.setItem(key, plainValue);
        console.log(`[SecureStorage] Migrated key: ${key}`);
      } catch (error) {
        console.error(`[SecureStorage] Failed to migrate key: ${key}`, error);
      }
    }
  }
}
