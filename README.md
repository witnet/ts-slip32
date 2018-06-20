<h1>ts-slip32</h1>

<div>
    <a href="https://gitter.im/witnet/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"><img src="https://badges.gitter.im/witnet/community.svg" alt="Join the chat at https://gitter.im/witnet/community"/></a>
    <a href="https://travis-ci.org/witnet/ts-slip32"><img src="https://travis-ci.org/witnet/ts-slip32.svg?branch=master" alt="Build Status" /></a>
    <a href="https://github.com/witnet/ts-slip32/blob/master/LICENSE"><img src="https://img.shields.io/github/license/witnet/ts-slip32.svg" alt="MIT" /></a>
    <br /><br />
    <p><strong>ts-slip32</strong> is a typescript implementation of the SLIP-0032 extended serialization format for BIP-32 wallets.</p>
</div>

## Installation

From npm:
```bash
npm install slip32
```

From git:
```bash
git clone https://github.com/witnet/ts-slip32.git
cd ts-slip32
yarn
yarn build
```

## Usage

Extracted from `slip32.d.ts`:
```typescript
/**
 * Import key from Slip32 format
 * @param {string} slip32
 * @returns {{keyPath: KeyPath; extendedKey: ExtendedKey<PrivateKey | PublicKey>}}
 */
export declare const importKeyFromSlip32: (slip32: string) => {
    keyPath: number[];
    extendedKey: ExtendedKey<PrivateKey | PublicKey>;
};

/**
 * Export key to Slip32 format
 * @param {KeyPath} keyPath
 * @param {ExtendedKey<PrivateKey> | ExtendedKey<PublicKey>} extendedKey
 * @returns {string}
 */
export declare const exportKeyToSlip32: (keyPath: number[], extendedKey: ExtendedKey<PrivateKey | PublicKey>) => string;
```

The aforementioned functions use the following interfaces and types:

```typescript
/**
 * Key interface
 * The buffer should have a length of 32 bytes
 */
export interface Key {
    bytes: Uint8Array;
}

/**
 * Chain code (32 bytes)
 */
export declare type ChainCode = Uint8Array;

/**
 * Private Key (33 bytes)
 */
export interface PrivateKey extends Key {
    type: "private";
}

/**
 * Public Key (33 bytes)
 */
export interface PublicKey extends Key {
    type: "public";
}

/**
 * Extended keys, as introduced by BIP-0032, pair a key with a chain code
 */
export declare type ExtendedKey<Key> = {
    key: Key;
    chainCode: ChainCode;
};
```

## Example

```typescript
import * as Slip32 from "slip32"

const keyToImport = "xprv1qxqqqqqq78qr7hlewyyfzt74vasa87k63pu7g9e6hfzlzrdyh0v5k8zfw9sqpsyv7vcejeyzcpkm85jel7vmujlhpquzf4f3sh3nry0w0n4jh7t0jhc039"

// Import key as {keyPath: KeyPath, extendedKey: ExtendedKey<PrivateKey | PublicKey>}
const importedKey = Slip32.importKeyFromSlip32(keyToImport)

// Export key as string
const exportedKey = Slip32.exportKeyToSlip32(importedKey.keyPath, importedKey.extendedKey)
```

## License
This library is free and open-source software released under the [MIT](LICENSE) license.
