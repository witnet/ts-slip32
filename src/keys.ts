/**
 * Key interface
 * The buffer should have a length of 32 bytes
 */
export interface Key {
  bytes: Uint8Array
}

/**
 * Chain code (32 bytes)
 */
export type ChainCode = Uint8Array

/**
 * Private Key (33 bytes)
 */
export interface PrivateKey extends Key {
  type: "private"
}

/**
 * Public Key (33 bytes)
 */
export interface PublicKey extends Key {
  type: "public"
}

/**
 * Extended keys, as introduced by BIP-0032, pair a key with a chain code
 */
export type ExtendedKey<Key> = {
  key: Key
  chainCode: ChainCode
}

/**
 * Key Path: array of integers (4 bytes each)
 */
export type KeyPath = Array<number>