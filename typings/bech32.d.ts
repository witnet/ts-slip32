declare module "bech32" {

  export function decode(str: string, LIMIT?: number): { prefix: string, words: Uint8Array }

  export function encode(prefix: string, words: Uint8Array, LIMIT?: number): string

  export function fromWords(words: Uint8Array): Uint8Array

  export function toWords(bytes: Uint8Array): Uint8Array

}