declare module "secp256k1/lib/js" {

  /**
   * Verify an ECDSA privateKey.
   */
  export function privateKeyVerify(privateKey: Uint8Array): boolean

  /**
   * Verify an ECDSA publicKey.
   */
  export function publicKeyVerify(publicKey: Uint8Array): boolean

}