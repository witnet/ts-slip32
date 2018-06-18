import { ExtendedKey, KeyPath, PrivateKey, PublicKey } from "./types"
import { privateKeyVerify, publicKeyVerify } from "secp256k1/lib/js"
import * as Bech32 from "bech32"

/**
 * Depth of key path: 1 byte (uint8)
 * @type {number}
 */
const DEPTH_LENGTH = 1
/**
 * KeyPath: 4 bytes (uint32)
 * @type {number}
 */
const KEYPATH_LENGTH = 4
/**
 * Chaincode: 32 bytes
 * @type {number}
 */
const CHAINCODE_LENGTH = 32
/**
 * Key: 33 bytes
 * @type {number}
 */
const KEY_LENGTH = 33

/**
 * Bech32 encoding limit for slip32 serialization
 * LIMIT = 1 byte + 4 * MAX_DEPTH bytes + 32 bytes + 33 bytes
 * @type {number}
 */
const BECH32_LIMIT = computeSlip32Limit()

/**
 * Buffer with a Human Readable Part (hrp) as prefix, used for Bech32 encoding/decoding
 */
type PrefixedBuffer = {
  hrp: string
  bytes: Uint8Array
}

/**
 * Extends a private or public key with the given chaincode
 * @param {PrivateKey | PublicKey} key
 * @param {Buffer} chainCode
 * @returns {ExtendedKey<PrivateKey | PublicKey>}
 */
export const extendKey =
  (key: PrivateKey | PublicKey, chainCode: Uint8Array): ExtendedKey<PrivateKey | PublicKey> => {
    return {
      key,
      chainCode
    }
  }

/**
 * Bech32 decode wrapper using the predefined limit
 * @param {string} encodedBech32
 * @returns {PrefixedBuffer}
 */
export const decode = (encodedBech32: string): PrefixedBuffer => {
  const { prefix: hrp, words } = Bech32.decode(encodedBech32, BECH32_LIMIT)
  const bytes = Bech32.fromWords(words)

  return { hrp, bytes }
}

/**
 * Bech32 decode wrapper using the predefined limit
 * @param {string} hrp
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export const encode = ({ hrp, bytes }: PrefixedBuffer): string => {
  const intArray = new Uint8Array(bytes)

  return Bech32.encode(hrp, Bech32.toWords(intArray), BECH32_LIMIT)
}

/**
 * Export key to slip32 format
 * @param {KeyPath} keyPath
 * @param {ExtendedKey<PrivateKey> | ExtendedKey<PublicKey>} extKey
 * @returns {string}
 */
export const exportKeyToSlip32 =
  (keyPath: KeyPath, extKey: ExtendedKey<PrivateKey | PublicKey>): string => {

    // ArrayBuffer to store all bytes
    const expectedLength = getExpectedDataLength(keyPath.length)
    const buffer: ArrayBuffer = new ArrayBuffer(expectedLength)

    // Depth (offset: 0, length: 1 byte)
    new DataView(buffer).setUint8(0, keyPath.length)

    // KeyPath (offset: 1, length: depth*4 bytes)
    const keyPathView = new DataView(buffer, DEPTH_LENGTH, keyPath.length * KEYPATH_LENGTH)
    keyPath.forEach((item: number, index: number) => {
      keyPathView.setUint32(index * 4, item, false)
    })

    // ChainCode (offset: depth + keyPath, length: 32 bytes)
    const chainCodeOffset = DEPTH_LENGTH + keyPath.length * KEYPATH_LENGTH
    const chainCodeView = new DataView(buffer, chainCodeOffset, CHAINCODE_LENGTH)
    extKey.chainCode.forEach((byte, index) => {
      chainCodeView.setUint8(index, byte)
    })

    // Key (offset: depth + keyPath + chainCode, length: 33 bytes)
    const keyView = new DataView(buffer, chainCodeOffset + CHAINCODE_LENGTH, KEY_LENGTH)
    extKey.key.bytes.forEach((byte, index) => {
      keyView.setUint8(index, byte)
    })

    // Encode hrp + bytes
    const bytes = new Uint8Array(buffer)
    if (extKey.key.type === "private") {
      return encode({ hrp: "xprv", bytes })
    } else {
      return encode({ hrp: "xpub", bytes })
    }
  }

/**
 * Import key from slip32 format
 * @param {string} slip32
 * @returns {{keyPath: KeyPath; extendedKey: ExtendedKey<PrivateKey | PublicKey>}}
 */
export const importKeyFromSlip32 =
  (slip32: string): { keyPath: KeyPath, extendedKey: ExtendedKey<PrivateKey | PublicKey> } => {

    // Decode slip32
    const { hrp, bytes }: { hrp: string, bytes: Uint8Array } = decode(slip32)

    // Check hrp
    if (!((hrp === "xprv") || (hrp === "xpub"))) {
      throw Error("Malformed slip32 serialized key: invalid hrp")
    }

    // Check expected data length & buffer
    const depth = bytes[0]
    const expectedLength = getExpectedDataLength(depth)
    if (bytes.length !== expectedLength) {
      throw Error("Malformed slip32 serialized key: invalid data length" +
        `(expected: ${expectedLength}, was: ${bytes.length}`)
    }

    const buffer = new Uint8Array(bytes).buffer

    // Extract key path (32-bit unsigned integers, big endian)
    const keyPath: KeyPath = []
    const keyPathView = new DataView(buffer, DEPTH_LENGTH, depth * KEYPATH_LENGTH)
    for (let i = 0; i < depth; i++) {
      keyPath.push((keyPathView.getUint32(i * KEYPATH_LENGTH, false)))
    }

    // Extract chain code
    const chainCode: Uint8Array = new Uint8Array(CHAINCODE_LENGTH)
    const chainCodeOffset = DEPTH_LENGTH + depth * KEYPATH_LENGTH
    const chainCodeView = new DataView(buffer, chainCodeOffset, CHAINCODE_LENGTH)
    for (let i = 0; i < chainCode.length; i++) {
      chainCode[i] = (chainCodeView.getUint8(i))
    }

    // Extract Key
    const key: Uint8Array = new Uint8Array(KEY_LENGTH)
    const keyView = new DataView(buffer, chainCodeOffset + CHAINCODE_LENGTH)
    for (let i = 0; i < key.length; i++) {
      key[i] = (keyView.getUint8(i))
    }

    // Check if private or public key are valid
    // (1st private key byte is sliced due to check requires 32-bytes)
    if ((hrp === "xprv" && !privateKeyVerify(key.slice(1))) ||
      (hrp === "xpub" && !publicKeyVerify(key))) {
      throw Error(`Import slip32 error: invalid ${hrp} key`)
    }

    // Create Extended Key of the type private (xprv) or public (xpub)
    const extendedKey: ExtendedKey<PrivateKey | PublicKey> =
      hrp === "xprv" ? extendKey({ type: "private", bytes: key }, chainCode) :
        extendKey({ type: "public", bytes: key }, chainCode)

    return {
      keyPath,
      extendedKey
    }
  }

/**
 * Computes the Bech32 limit for the slip32 serialization
 * @returns {number}
 */
export function computeSlip32Limit() {
  return DEPTH_LENGTH + ((Math.pow(256, DEPTH_LENGTH) - 1) * KEYPATH_LENGTH) +
    CHAINCODE_LENGTH + KEY_LENGTH
}

/**
 * Returns the expected data length given a depth (in bytes)
 * @param {number} depth
 * @returns {number}
 */
function getExpectedDataLength(depth: number) {
  return DEPTH_LENGTH + depth * KEYPATH_LENGTH + CHAINCODE_LENGTH + KEY_LENGTH
}