---
title: Calendar Sync
icon: material/calendar
description: Calendars contain some of your most sensitive data; use products that implement encryption at rest.
cover: calendar.webp
---
<small>Protects against the following threat(s):</small>

- [:material-bug-outline: Passive Attacks](basics/common-threats.md#security-and-privacy){ .pg-orange }
- [:material-server-network: Service Providers](basics/common-threats.md#privacy-from-service-providers){ .pg-teal }

**Calendars** contain some of your most sensitive data; use products that implement end-to-end encryption at rest to prevent a provider from reading them.

## Calendar Privacy and E2EE (Events, Invites, and Metadata)

**Why calendars are sensitive**: events reveal location (meeting addresses), associations (attendee lists), habits (recurring appointments), potentially embarrassing or compromising info (doctor visits, legal meetings).

**Traditional calendar services** (Google Calendar, Outlook): events stored in plaintext on provider's servers. Provider can read, analyze (for ads, features), share with third parties, comply with legal requests.

**E2EE calendars**: event details (title, description, location, attendees) encrypted on device before sync. Server stores ciphertext; only your devices (with key) can decrypt.

**CalDAV and encryption**: CalDAV is standard protocol for calendar sync (like IMAP for email). By itself, CalDAV uses TLS for transport but doesn't specify E2EE. E2EE calendars (Proton, Tuta) use CalDAV-like sync with custom encryption layer.

**Event sharing challenges**: inviting attendees requires sharing encrypted event. Options:
1. **Encrypt event for each attendee's public key** (hybrid encryption). Requires all attendees use same encrypted calendar service (key distribution).
2. **Share decryption key out-of-band** (insecure if sent via email/SMS).
3. **Federated trust**: calendar provider handles key exchange between users (relies on provider's infrastructure).

**Metadata leakage**: even with E2EE, server sees event timestamps, duration, number of attendees (unless obfuscated). Enough to infer patterns (work hours, meeting frequency).

**Native OS integration**: encrypted calendar services often lack full integration with iOS/macOS Calendar or Android Calendar apps (due to encryption layer incompatibility with CalDAV). May require dedicated app.

**Example: Proton Calendar E2EE**:
1. User creates event, enters title/location/attendees.
2. Client encrypts event data with user's private key.
3. For shared events, encrypts event key with each attendee's public key.
4. Uploads encrypted event to Proton servers.
5. Attendees fetch event, decrypt with their private keys, see plaintext in their client.
6. Proton servers see encrypted blob + metadata (timestamp, attendee count).

## Tuta

<div class="admonition recommendation" markdown>

![Tuta logo](assets/img/email/tuta.svg#only-light){ align=right }
![Tuta logo](assets/img/email/tuta-dark.svg#only-dark){ align=right }

**Tuta** offers a free and encrypted calendar across their supported platforms. Features include automatic E2EE of all data, sharing features, import/export functionality, multifactor authentication, and [more](https://tuta.com/calendar-app-comparison).

Multiple calendars and extended sharing functionality are limited to paid subscribers.

[:octicons-home-16: Homepage](https://tuta.com/calendar){ .md-button .md-button--primary }
[:octicons-eye-16:](https://tuta.com/privacy){ .card-link title="Privacy Policy" }
[:octicons-info-16:](https://tuta.com/support){ .card-link title="Documentation" }
[:octicons-code-16:](https://github.com/tutao/tutanota){ .card-link title="Source Code" }
[:octicons-heart-16:](https://tuta.com/community#donate){ .card-link title="Contribute" }

<details class="downloads" markdown>
<summary>Downloads</summary>

- [:simple-googleplay: Google Play](https://play.google.com/store/apps/details?id=de.tutao.calendar)
- [:simple-appstore: App Store](https://apps.apple.com/app/id6657977811)
- [:simple-github: GitHub](https://github.com/tutao/tutanota/releases?q=Calendar)
- [:fontawesome-brands-windows: Windows](https://tuta.com/blog/desktop-clients)
- [:simple-apple: macOS](https://tuta.com/blog/desktop-clients)
- [:simple-linux: Linux](https://tuta.com/blog/desktop-clients)
- [:simple-flathub: Flathub](https://flathub.org/apps/com.tutanota.Tutanota)
- [:octicons-browser-16: Web](https://app.tuta.com)

</details>

</div>

## Proton Calendar

<div class="admonition recommendation" markdown>

![Proton](assets/img/calendar/proton-calendar.svg){ align=right }

**Proton Calendar** is an encrypted calendar service available to Proton members via its web or mobile clients. Features include automatic E2EE of all data, sharing features, import/export functionality, and [more](https://proton.me/support/proton-calendar-guide).

Those on the free tier have access to 3 calendars, whereas paid subscribers can create up to 25 calendars. Extended sharing functionality is also limited to paid subscribers.

[:octicons-home-16: Homepage](https://proton.me/calendar){ .md-button .md-button--primary }
[:octicons-eye-16:](https://proton.me/calendar/privacy-policy){ .card-link title="Privacy Policy" }
[:octicons-info-16:](https://proton.me/support/calendar){ .card-link title="Documentation" }
[:octicons-code-16:](https://github.com/orgs/ProtonMail/repositories?q=calendar){ .card-link title="Source Code" }

<details class="downloads" markdown>
<summary>Downloads</summary>

- [:simple-googleplay: Google Play](https://play.google.com/store/apps/details?id=me.proton.android.calendar)
- [:simple-appstore: App Store](https://apps.apple.com/app/id1514709943)
- [:octicons-browser-16: Web](https://calendar.proton.me)

</details>

</div>

In 2021, Securitum [audited](https://proton.me/community/open-source#:~:text=Proton%20Calendar) Proton Calendar's web client and provided a [letter of attestation](https://res.cloudinary.com/dbulfrlrz/images/v1714639870/wp-pme/letter-of-attestation-proton-calendar-20211109_3138998f9b/letter-of-attestation-proton-calendar-20211109_3138998f9b.pdf) for the Android app.

## Criteria

**Please note we are not affiliated with any of the projects we recommend.** In addition to [our standard criteria](about/criteria.md), we have developed a clear set of requirements to allow us to provide objective recommendations. We suggest you familiarize yourself with this list before choosing to use a project, and conduct your own research to ensure it's the right choice for you.

### Minimum Qualifications

- Must sync and store information with E2EE to ensure data is not visible to the service provider.

### Best-Case

Our best-case criteria represents what we would like to see from the perfect project in this category. Our recommendations may not include any or all of this functionality, but those which do may rank higher than others on this page.

- Should integrate with native OS calendar and contact management apps if applicable.
