---
title: "Pastebins"
icon: material/content-paste
description: These tools allow you to have full control of any pasted data you share to other parties.
cover: pastebins.webp
---
<small>Protects against the following threat(s):</small>

- [:material-server-network: Service Providers](basics/common-threats.md#privacy-from-service-providers){ .pg-teal }

[**Pastebins**](https://en.wikipedia.org/wiki/Pastebin) are online services most commonly used to share large blocks of code in a convenient and efficient manner. The pastebins listed here employ client-side encryption and password protection for pasted content; both of these features prevent the website or server operator from reading or accessing the contents of any paste.

## Pastebin Privacy (Client-Side Encryption, Zero-Knowledge)

**Traditional pastebins** (Pastebin.com, GitHub Gist): paste sent to server in plaintext. Server stores readable text. Operator can read, log, share with third parties, comply with legal requests. Public pastes indexed by search engines.

**Client-side E2EE pastebins**: JavaScript in browser encrypts paste before upload. Encryption key in URL fragment (e.g., `https://example.com/#key`). Fragment not sent to server (client-only). Server stores ciphertext; lacks decryption key.

**Zero-knowledge architecture**: 
1. User types paste in browser.
2. JavaScript generates random key (AES-256).
3. Encrypts paste with key.
4. Uploads ciphertext to server.
5. Server returns paste ID.
6. Client constructs URL: `https://example.com/paste/<ID>#<key>`.
7. Share URL. Recipient's browser extracts key from fragment, fetches ciphertext, decrypts.

**Server sees**: paste ID, ciphertext, IP address, timestamp. **Server cannot see**: paste content (lacks key).

**Optional password protection**: second encryption layer. User sets password; JavaScript derives key (PBKDF2/Argon2), encrypts again. Must share paste URL + password separately (out-of-band). Protects against: accidental URL leakage (chat logs), link interception.

**Expiration**: auto-delete after time/reads. Reduces exposure window. Requires trust server actually deletes (no verification).

**JavaScript trust issue**: server delivers encryption code. Malicious server can send backdoored JS (steal keys). Mitigations: browser extensions (PrivateBin has one), self-host (trust yourself), use reputable instances (audit/reputation).

**Example: PrivateBin flow**:
1. Paste code: `secret_api_key = "abc123"`.
2. Browser JS generates key: `k = random_bytes(32)`.
3. Encrypts: `ciphertext = AES256_GCM(plaintext, k)`.
4. Uploads ciphertext to server.
5. Server stores, returns paste ID `xyz789`.
6. Browser builds URL: `https://privatebin.example.com/?xyz789#k` (key in fragment).
7. Share URL via Signal/email.
8. Recipient opens URL: browser fetches ciphertext, decrypts with key from fragment.
9. Server logs: IP, paste ID, timestamp. Cannot read `secret_api_key`.

## PrivateBin

<div class="admonition recommendation" markdown>

![PrivateBin logo](assets/img/pastebins/privatebin.svg){ align=right }

**PrivateBin** is a minimalist, open-source, online pastebin where the server has zero knowledge of pasted data. Data is encrypted/decrypted in the browser using 256-bit AES. It is the improved version of ZeroBin.

[:octicons-home-16: Homepage](https://privatebin.info){ .md-button .md-button--primary }
[:octicons-server-16:](https://privatebin.info/directory){ .card-link title="Public Instances"}
[:octicons-info-16:](https://github.com/PrivateBin/PrivateBin/wiki/FAQ){ .card-link title="Documentation" }
[:octicons-code-16:](https://github.com/PrivateBin/PrivateBin){ .card-link title="Source Code" }

</div>

## Paaster

<div class="admonition recommendation" markdown>

![Paaster logo](assets/img/pastebins/paaster.svg){ align=right }

**Paaster** is a secure and user-friendly pastebin application that prioritizes privacy and simplicity. With end-to-end encryption and paste history, Paaster ensures that your pasted code remains confidential and accessible.

[:octicons-home-16: Homepage](https://paaster.io){ .md-button .md-button--primary }
[:octicons-eye-16:](https://paaster.io/privacy-policy){ .card-link title="Privacy Policy" }
[:octicons-info-16:](https://github.com/WardPearce/paaster#security){ .card-link title="Documentation" }
[:octicons-code-16:](https://github.com/WardPearce/paaster){ .card-link title="Source Code" }
[:octicons-heart-16:](https://github.com/sponsors/WardPearce){ .card-link title="Contribute" }

</div>

## Criteria

**Please note we are not affiliated with any of the projects we recommend.** In addition to [our standard criteria](about/criteria.md), we have developed a clear set of requirements to allow us to provide objective recommendations. We suggest you familiarize yourself with this list before choosing to use a project, and conduct your own research to ensure it's the right choice for you.

### Minimum Requirements

- Must be open source.
- Must implement "zero-trust" E2EE.
- Must support password-protected files.

### Best-Case

Our best-case criteria represents what we would like to see from the perfect project in this category. Our recommendations may not include any or all of this functionality, but those which do may rank higher than others on this page.

- Should have a published audit from a reputable, independent third party.
