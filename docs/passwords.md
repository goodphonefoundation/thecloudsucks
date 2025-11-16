---
meta_title: "The Best Password Managers to Protect Your Privacy and Security - The Cloud Sucks"
title: Password Managers
icon: material/form-textbox-password
description: Password managers allow you to securely store and manage passwords and other credentials.
cover: passwords.webp
schema:
  -
    "@context": http://schema.org
    "@type": WebPage
    name: Password Manager Recommendations
    url: "./"
  -
    "@context": http://schema.org
    "@type": SoftwareApplication
    name: Bitwarden
    image: /assets/img/password-management/bitwarden.svg
    url: https://bitwarden.com
    sameAs: https://en.wikipedia.org/wiki/Bitwarden
    applicationCategory: Password Manager
    operatingSystem:
      - Windows
      - macOS
      - Linux
      - Android
      - iOS
    subjectOf:
      "@context": http://schema.org
      "@type": WebPage
      url: "./"
  -
    "@context": http://schema.org
    "@type": SoftwareApplication
    name: 1Password
    image: /assets/img/password-management/1password.svg
    url: https://1password.com
    sameAs: https://en.wikipedia.org/wiki/1Password
    applicationCategory: Password Manager
    operatingSystem:
      - Windows
      - macOS
      - Linux
      - Android
      - iOS
    subjectOf:
      "@context": http://schema.org
      "@type": WebPage
      url: "./"
  -
    "@context": http://schema.org
    "@type": SoftwareApplication
    name: Proton Pass
    image: /assets/img/password-management/protonpass.svg
    url: https://proton.me/pass
    applicationCategory: Password Manager
    operatingSystem:
      - Android
      - iOS
    subjectOf:
      "@context": http://schema.org
      "@type": WebPage
      url: "./"
  -
    "@context": http://schema.org
    "@type": SoftwareApplication
    name: Psono
    image: /assets/img/password-management/psono.svg
    url: https://psono.com
    applicationCategory: Password Manager
    operatingSystem:
      - Android
      - iOS
    subjectOf:
      "@context": http://schema.org
      "@type": WebPage
      url: "./"
  -
    "@context": http://schema.org
    "@type": SoftwareApplication
    name: KeePassXC
    image: /assets/img/password-management/keepassxc.svg
    url: https://keepassxc.org
    sameAs: https://en.wikipedia.org/wiki/KeePassXC
    applicationCategory: Password Manager
    operatingSystem:
      - Windows
      - macOS
      - Linux
    subjectOf:
      "@context": http://schema.org
      "@type": WebPage
      url: "./"
  -
    "@context": http://schema.org
    "@type": SoftwareApplication
    name: KeePassDX
    image: /assets/img/password-management/keepassdx.svg
    url: https://keepassdx.com
    applicationCategory: Password Manager
    operatingSystem: Android
    subjectOf:
      "@context": http://schema.org
      "@type": WebPage
      url: "./"
  -
    "@context": http://schema.org
    "@type": SoftwareApplication
    name: Gopass
    image: /assets/img/password-management/gopass.svg
    url: https://gopass.pw
    applicationCategory: Password Manager
    operatingSystem:
      - Windows
      - macOS
      - Linux
      - FreeBSD
    subjectOf:
      "@context": http://schema.org
      "@type": WebPage
      url: "./"
---
<small>Protects against the following threat(s):</small>

- [:material-target-account: Targeted Attacks](basics/common-threats.md#attacks-against-specific-individuals){ .pg-red }
- [:material-bug-outline: Passive Attacks](basics/common-threats.md#security-and-privacy){ .pg-orange }
- [:material-server-network: Service Providers](basics/common-threats.md#privacy-from-service-providers){ .pg-teal }

**Password managers** allow you to securely store and manage passwords and other credentials with the use of a master password.

[Introduction to Passwords :material-arrow-right-drop-circle:](basics/passwords-overview.md)

<div class="admonition info" markdown>
<p class="admonition-title">Info</p>

Built-in password managers in software like browsers and operating systems are sometimes not as good as dedicated password manager software. The advantage of a built-in password manager is good integration with the software, but it can often be very simple and lack privacy and security features that standalone offerings have.

For example, the password manager in Microsoft Edge doesn't offer end-to-end encryption at all. Google's password manager has [optional](https://support.google.com/accounts/answer/11350823) E2EE, and [Apple's](https://support.apple.com/HT202303) offers E2EE by default.

</div>

## How Passwords and Password Managers Work (Technical but Practical)

At a high level, a password is just a shared secret used to prove that "you are you." The security you actually get depends on:

- **How unpredictable the secret is** (entropy).
- **How many guesses an attacker can make** (online vs. offline attacks).
- **How your provider stores it** (hashing and key-derivation functions).
- **Whether you reuse it** across multiple sites.

### Online vs. Offline Attacks

- **Online attack** – attacker talks directly to the service (e.g., the login API) and is rate-limited.
  - Example: a site allows 5 login attempts per minute per IP and locks the account after 10 failures.
  - Even a relatively weak password can survive if the rate limit is strict and additional factors (2FA) are in place.

- **Offline attack** – attacker steals a password database (hashes) and can try billions of guesses per second on their own hardware.
  - Example: a breached site used plain SHA-1 with no or low iteration count.
  - A human-style password like `Spring2025!` can fall in seconds in an offline attack.

Password managers primarily protect you from *yourself* (weak or reused passwords) and from **credential stuffing**, where attackers reuse passwords leaked from one site against other sites.

### Entropy and Why "Length + Randomness" Wins

Entropy is a measure of how many bits of uncertainty your password contains. Rough intuition:

- A single lowercase letter from `a–z` → ~4.7 bits.
- A character from `A–Z a–z 0–9 !@#$…` (~70 symbols) → ~6.13 bits.

If you pick **random characters** from a 70-character set:

- 10 characters → ~61 bits.
- 16 characters → ~98 bits.

A random 16-character password is well beyond what attackers can practically brute-force *if* your provider uses a strong password hashing scheme.

A more human approach is a **passphrase** – multiple random words from a large word list:

```text path=null start=null
correct-horse-battery-staple

# 4 random words from a list of 7776 words (Diceware)
# Entropy ≈ 4 × log2(7776) ≈ 4 × 12.9 ≈ 51.6 bits
```

Password managers make it realistic to use **random 20–30 character passwords** for every account without ever memorizing them.

### How a Password Manager Protects Your Vault

Most modern password managers use a two-layer design:

1. **Vault encryption key** – a high-entropy symmetric key (e.g., 256-bit) that encrypts your vault contents.
2. **Master password → key-derivation function (KDF)** – derives a *key-encryption key* from your master password.

The KDF is designed to be *expensive* to compute in order to slow offline attackers who steal your encrypted vault.

Common KDFs:

- **PBKDF2** (RFC 8018)
  - Iterative HMAC-based KDF: `key = PBKDF2(HMAC-SHA256, password, salt, iterations)`.
  - Security depends heavily on the number of iterations (e.g., 600k+ or in the millions).

- **Argon2id** (PHC winner, RFC 9106)
  - Memory-hard, tunable function with parameters for iterations, parallelism, and memory size.
  - Designed to be expensive on GPUs/ASICs, not just CPUs.

- **scrypt**
  - Also memory-hard, widely used historically, but Argon2id is generally preferred for new designs.

When you log in:

1. Your master password + salt → KDF → key-encryption key.
2. That key decrypts the **vault encryption key**.
3. The vault key decrypts your stored entries locally.

The password manager provider (if designed correctly) never sees your master password or your vault in plaintext – they only see an encrypted blob.

### Example: Offline Attack on a Vault

Imagine an attacker steals an encrypted vault file:

- Vault is encrypted with AES‑256‑GCM.
- Master password is processed with Argon2id using 256 MB memory and 3 iterations.

To try a single password guess, the attacker must:

1. Run Argon2id with those parameters.
2. Attempt to decrypt the vault key and check if the result looks valid.

Even with powerful GPUs, this may limit them to thousands of guesses per second instead of billions, massively increasing the time required to brute-force the vault.

### Why Unique Passwords Everywhere Matter

Most real-world breaches arise not from brute-force attacks on strong KDFs, but from **reuse**:

- Site A is compromised; your password `MyPassword123!` leaks.
- Attackers try that combination on Site B (email, bank, social media).
- If you reuse the password, they get in without breaking any cryptography.

A password manager fixes this by:

- Generating a **different random password** for every site.
- Making it practical to rotate credentials quickly when a breach occurs.

### Passwords, Passkeys, and the Future

Many password managers now also store **passkeys** (FIDO2/WebAuthn credentials):

- Instead of "something you know" (a password), you authenticate with a **key pair** stored on your device or security key.
- The private key never leaves your device; the server stores only a public key.
- Phishing a passkey is significantly harder because the authentication is bound to a specific domain ("origin-bound").

In practice, you'll likely use a mix of:

- **Passwords** (strong, unique, stored in a manager) for legacy sites.
- **Passkeys** for new services that support them.

**Selected technical references:**

- NIST SP 800‑63B – *Digital Identity Guidelines: Authentication and Lifecycle Management*
- RFC 8018 – *PKCS #5: Password-Based Cryptography Specification Version 2.1* (PBKDF2)
- RFC 9106 – *Argon2 Memory-Hard Function*
- OWASP Password Storage Cheat Sheet – https://cheatsheetseries.owasp.org

## Cloud-based

These password managers sync your passwords to a cloud server for easy accessibility from all your devices and safety against device loss.

### Bitwarden

<div class="admonition recommendation" markdown>

![Bitwarden logo](assets/img/password-management/bitwarden.svg){ align=right }

**Bitwarden** is a free and open-source password and passkey manager. It aims to solve password management problems for individuals, teams, and business organizations. Bitwarden is among the best and safest solutions to store all of your logins and passwords while conveniently keeping them synced between all of your devices.

[:octicons-home-16: Homepage](https://bitwarden.com){ .md-button .md-button--primary }
[:octicons-eye-16:](https://bitwarden.com/privacy){ .card-link title="Privacy Policy" }
[:octicons-info-16:](https://bitwarden.com/help){ .card-link title="Documentation" }
[:octicons-code-16:](https://github.com/bitwarden){ .card-link title="Source Code" }

<details class="downloads" markdown>
<summary>Downloads</summary>

- [:simple-googleplay: Google Play](https://play.google.com/store/apps/details?id=com.x8bit.bitwarden)
- [:simple-appstore: App Store](https://apps.apple.com/app/id1137397744)
- [:simple-github: GitHub](https://github.com/bitwarden/android/releases)
- [:fontawesome-brands-windows: Windows](https://bitwarden.com/download)
- [:simple-apple: macOS](https://bitwarden.com/download)
- [:simple-linux: Linux](https://bitwarden.com/download)
- [:simple-flathub: Flathub](https://flathub.org/apps/details/com.bitwarden.desktop)
- [:simple-firefoxbrowser: Firefox](https://addons.mozilla.org/firefox/addon/bitwarden-password-manager)
- [:simple-googlechrome: Chrome](https://chrome.google.com/webstore/detail/nngceckbapebfimnlniiiahkandclblb)
- [:fontawesome-brands-edge: Edge](https://microsoftedge.microsoft.com/addons/detail/jbkfoedolllekgbhcbcoahefnbanhhlh)
- [:simple-safari: Safari](https://apps.apple.com/app/id1352778147)

</details>

</div>

Bitwarden uses [PBKDF2](https://bitwarden.com/help/kdf-algorithms/#pbkdf2) as its key derivation function (KDF) algorithm by default. It also offers [Argon2](https://bitwarden.com/help/kdf-algorithms/#argon2id), which is more secure, as an alternative. You can change your account's KDF algorithm in the web vault:

- [x] Select **Settings → Security → Keys → KDF algorithm → Argon2id**

Bitwarden's server-side code is [open source](https://github.com/bitwarden/server), so if you don't want to use the Bitwarden cloud, you can easily host your own Bitwarden sync server.

### Proton Pass

<div class="admonition recommendation" markdown>

![Proton Pass logo](assets/img/password-management/protonpass.svg){ align=right }

**Proton Pass** is an open-source, end-to-end encrypted password manager developed by Proton, the team behind [Proton Mail](email.md#proton-mail). It securely stores your login credentials, generates unique email aliases, and supports and stores passkeys.

[:octicons-home-16: Homepage](https://proton.me/pass){ .md-button .md-button--primary }
[:octicons-eye-16:](https://proton.me/pass/privacy-policy){ .card-link title="Privacy Policy" }
[:octicons-info-16:](https://proton.me/support/pass){ .card-link title="Documentation" }
[:octicons-code-16:](https://github.com/protonpass){ .card-link title="Source Code" }

<details class="downloads" markdown>
<summary>Downloads</summary>

- [:simple-googleplay: Google Play](https://play.google.com/store/apps/details?id=proton.android.pass)
- [:simple-appstore: App Store](https://apps.apple.com/app/id6443490629)
- [:fontawesome-brands-windows: Windows](https://proton.me/pass/download)
- [:simple-firefoxbrowser: Firefox](https://addons.mozilla.org/firefox/addon/proton-pass)
- [:simple-googlechrome: Chrome](https://chromewebstore.google.com/detail/ghmbeldphafepmbegfdlkpapadhbakde)
- [:fontawesome-brands-edge: Edge](https://microsoftedge.microsoft.com/addons/detail/gcllgfdnfnllodcaambdaknbipemelie)
- [:octicons-browser-16: Web](https://pass.proton.me)

</details>

</div>

With the acquisition of SimpleLogin in April 2022, Proton has offered a "hide-my-email" feature that lets you create 10 aliases (free plan) or unlimited aliases (paid plans).

The Proton Pass mobile apps and browser extension underwent an audit performed by Cure53 throughout May and June 2023. The security analysis company concluded:

> Proton Pass apps and components leave a rather positive impression in terms of security.

All issues were addressed and fixed shortly after the [report](https://res.cloudinary.com/dbulfrlrz/images/v1707561557/wp-pme/Cure53-proton-pass-20230717/Cure53-proton-pass-20230717.pdf).

### 1Password

<div class="admonition recommendation" markdown>

![1Password logo](assets/img/password-management/1password.svg){ align=right }

**1Password** is a password manager with a strong focus on security and ease-of-use that allows you to store passwords, passkeys, credit cards, software licenses, and any other sensitive information in a secure digital vault. Your vault is hosted on 1Password's servers for a [monthly fee](https://1password.com/sign-up).

1Password is [audited](https://support.1password.com/security-assessments) on a regular basis and provides exceptional customer support. 1Password is closed source; however, the security of the product is thoroughly documented in their [security white paper](https://1passwordstatic.com/files/security/1password-white-paper.pdf).

[:octicons-home-16: Homepage](https://1password.com){ .md-button .md-button--primary }
[:octicons-eye-16:](https://1password.com/legal/privacy){ .card-link title="Privacy Policy" }
[:octicons-info-16:](https://support.1password.com){ .card-link title="Documentation" }

<details class="downloads" markdown>
<summary>Downloads</summary>

- [:simple-googleplay: Google Play](https://play.google.com/store/apps/details?id=com.onepassword.android)
- [:simple-appstore: App Store](https://apps.apple.com/app/id1511601750)
- [:fontawesome-brands-windows: Windows](https://1password.com/downloads/windows)
- [:simple-apple: macOS](https://1password.com/downloads/mac)
- [:simple-linux: Linux](https://1password.com/downloads/linux)
- [:simple-firefoxbrowser: Firefox](https://addons.mozilla.org/firefox/addon/1password-x-password-manager)
- [:simple-googlechrome: Chrome](https://chrome.google.com/webstore/detail/aeblfdkhhhdcdjpifhhbdiojplfjncoa)
- [:fontawesome-brands-edge: Edge](https://microsoftedge.microsoft.com/addons/detail/dppgmdbiimibapkepcbdbmkaabgiofem)
- [:simple-safari: Safari](https://apps.apple.com/app/id1569813296)
- [:octicons-browser-16: Web](https://my.1password.com/signin)

</details>

</div>

Traditionally, 1Password has offered the best password manager user experience for people using macOS and iOS; however, it has now achieved feature parity across all platforms. 1Password's clients boast many features geared towards families and less technical people, such as an intuitive UI for ease-of-use and navigation, as well as advanced functionality. Notably, nearly every feature of 1Password is available within its native mobile or desktop clients.

Your 1Password vault is secured with both your master password and a randomized 34-character security key to encrypt your data on their servers. This security key adds a layer of protection to your data because your data is secured with high entropy regardless of your master password. Many other password manager solutions are entirely reliant on the strength of your master password to secure your data.

### Psono

<div class="admonition recommendation" markdown>

![Psono logo](assets/img/password-management/psono.svg){ align=right }

**Psono** is a free and open-source password manager from Germany, with a focus on password management for teams. Psono supports secure sharing of passwords, files, bookmarks, and emails. All secrets are protected by a master password.

[:octicons-home-16: Homepage](https://psono.com){ .md-button .md-button--primary }
[:octicons-eye-16:](https://psono.com/privacy-policy){ .card-link title="Privacy Policy" }
[:octicons-info-16:](https://doc.psono.com){ .card-link title="Documentation" }
[:octicons-code-16:](https://gitlab.com/psono){ .card-link title="Source Code" }

<details class="downloads" markdown>
<summary>Downloads</summary>

- [:simple-googleplay: Google Play](https://play.google.com/store/apps/details?id=com.psono.psono)
- [:simple-appstore: App Store](https://apps.apple.com/app/id1545581224)
- [:simple-firefoxbrowser: Firefox](https://addons.mozilla.org/firefox/addon/psono-pw-password-manager)
- [:simple-googlechrome: Chrome](https://chrome.google.com/webstore/detail/eljmjmgjkbmpmfljlmklcfineebidmlo)
- [:simple-docker: Docker Hub](https://hub.docker.com/r/psono/psono-client)

</details>

</div>

Psono provides extensive documentation for their product. The web-client for Psono can be self-hosted; alternatively, you can choose the full Community Edition or the Enterprise Edition with additional features.

In April 2024, Psono added [support for passkeys](https://psono.com/blog/psono-introduces-passkeys) for the browser extension only.

### Criteria

**Please note we are not affiliated with any of the projects we recommend.** In addition to [our standard criteria](about/criteria.md), we have developed a clear set of requirements to allow us to provide objective recommendations. We suggest you familiarize yourself with this list before choosing to use a project, and conduct your own research to ensure it's the right choice for you.

#### Minimum Requirements

- Must utilize strong, standards-based/modern E2EE.
- Must have thoroughly documented encryption and security practices.
- Must have a published audit from a reputable, independent third party.
- All non-essential telemetry must be optional.
- Must not collect more PII than is necessary for billing purposes.

#### Best-Case

Our best-case criteria represents what we would like to see from the perfect project in this category. Our recommendations may not include any or all of this functionality, but those which do may rank higher than others on this page.

- Telemetry should be opt-in (disabled by default) or not collected at all.
- Should be open source and reasonably self-hostable.

## Local Storage

These options allow you to manage an encrypted password database locally.

### KeePassXC

<div class="admonition recommendation" markdown>

![KeePassXC logo](assets/img/password-management/keepassxc.svg){ align=right }

**KeePassXC** is a community fork of KeePassX, a native cross-platform port of KeePass Password Safe, with the goal of extending and improving it with new features and bug fixes to provide a feature-rich, cross-platform, and modern open-source password manager.

[:octicons-home-16: Homepage](https://keepassxc.org){ .md-button .md-button--primary }
[:octicons-eye-16:](https://keepassxc.org/privacy){ .card-link title="Privacy Policy" }
[:octicons-info-16:](https://keepassxc.org/docs){ .card-link title="Documentation" }
[:octicons-code-16:](https://github.com/keepassxreboot/keepassxc){ .card-link title="Source Code" }
[:octicons-heart-16:](https://keepassxc.org/donate){ .card-link title="Contribute" }

<details class="downloads" markdown>
<summary>Downloads</summary>

- [:fontawesome-brands-windows: Windows](https://keepassxc.org/download/#windows)
- [:simple-apple: macOS](https://keepassxc.org/download/#mac)
- [:simple-linux: Linux](https://keepassxc.org/download/#linux)
- [:simple-flathub: Flathub](https://flathub.org/apps/details/org.keepassxc.KeePassXC)
- [:simple-firefoxbrowser: Firefox](https://addons.mozilla.org/firefox/addon/keepassxc-browser)
- [:simple-googlechrome: Chrome](https://chrome.google.com/webstore/detail/oboonakemofpalcgghocfoadofidjkkk)

</details>

</div>

KeePassXC stores its export data as [CSV](https://en.wikipedia.org/wiki/Comma-separated_values) files. You may encounter data loss if you import this file into another password manager. We advise you check each record manually.

### KeePassDX (Android)

<div class="admonition recommendation" markdown>

![KeePassDX logo](assets/img/password-management/keepassdx.svg){ align=right }

**KeePassDX** is a lightweight password manager for Android; it allows for editing encrypted data in a single file in KeePass format and can fill in forms securely.

[:octicons-home-16: Homepage](https://keepassdx.com){ .md-button .md-button--primary }
[:octicons-info-16:](https://github.com/Kunzisoft/KeePassDX/wiki){ .card-link title="Documentation" }
[:octicons-code-16:](https://github.com/Kunzisoft/KeePassDX){ .card-link title="Source Code" }
[:octicons-heart-16:](https://keepassdx.com/#donation){ .card-link title="Contribute" }

<details class="downloads" markdown>
<summary>Downloads</summary>

- [:simple-googleplay: Google Play](https://play.google.com/store/apps/details?id=com.kunzisoft.keepass.free)
- [:simple-github: GitHub](https://github.com/Kunzisoft/KeePassDX/releases)

</details>

</div>

The [pro version](https://play.google.com/store/apps/details?id=com.kunzisoft.keepass.pro) of the app allows you to unlock cosmetic content and non-standard protocol features, but more importantly, it helps and encourages development.

### KeePassium (iOS & macOS)

<div class="admonition recommendation" markdown>

![KeePassium logo](assets/img/password-management/keepassium.svg){ align=right }

KeePassium is a commercial, open-source password manager made by KeePassium Labs that's compatible with other KeePass applications. It provides autofill support, passkey management, automatic two-way synchronization through [most cloud storage providers](https://support.keepassium.com/kb/sync), and more.

[:material-star-box: Read our latest KeePassium review.](https://www.thecloudsucks.guide/articles/2025/05/13/keepassium-review)

[:octicons-home-16: Homepage](https://keepassium.com){ .md-button .md-button--primary }
[:octicons-eye-16:](https://keepassium.com/privacy/app){ .card-link title="Privacy Policy" }
[:octicons-info-16:](https://support.keepassium.com){ .card-link title="Documentation" }
[:octicons-code-16:](https://github.com/keepassium/KeePassium){ .card-link title="Source Code" }
[:octicons-heart-16:](https://keepassium.com/donate){ .card-link title="Contribute" }

<details class="downloads" markdown>
<summary>Downloads</summary>

- [:simple-appstore: App Store](https://apps.apple.com/us/app/id1435127111)

</details>

</div>

KeePassium offers a [Premium version](https://keepassium.com/pricing) with additional features such as support for multiple databases, YubiKey support, and a password audit tool.

KeePassium's iOS app has been [audited](https://cure53.de/pentest-report_keepassium.pdf) by Cure53 in October 2024, and all [issues](https://keepassium.com/blog/2024/11/independent-security-audit-complete) found in the audit were subsequently fixed.

### Gopass (CLI)

<div class="admonition recommendation" markdown>

![Gopass logo](assets/img/password-management/gopass.svg){ align=right }

**Gopass** is a minimal password manager for the command line written in Go. It can be used within scripting applications and works on all major desktop and server operating systems.

[:octicons-home-16: Homepage](https://gopass.pw){ .md-button .md-button--primary }
[:octicons-info-16:](https://github.com/gopasspw/gopass/tree/master/docs){ .card-link title="Documentation" }
[:octicons-code-16:](https://github.com/gopasspw/gopass){ .card-link title="Source Code" }
[:octicons-heart-16:](https://github.com/sponsors/dominikschulz){ .card-link title="Contribute" }

<details class="downloads" markdown>
<summary>Downloads</summary>

- [:fontawesome-brands-windows: Windows](https://gopass.pw/#install-windows)
- [:simple-apple: macOS](https://gopass.pw/#install-macos)
- [:simple-linux: Linux](https://gopass.pw/#install-linux)
- [:simple-freebsd: FreeBSD](https://gopass.pw/#install-bsd)

</details>

</div>

### Criteria

**Please note we are not affiliated with any of the projects we recommend.** In addition to [our standard criteria](about/criteria.md), we have developed a clear set of requirements to allow us to provide objective recommendations. We suggest you familiarize yourself with this list before choosing to use a project, and conduct your own research to ensure it's the right choice for you.

- Must be cross-platform.
