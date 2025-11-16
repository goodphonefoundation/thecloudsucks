---
title: Financial Services
icon: material/bank
cover: financial-services.webp
description: These services can assist you in protecting your privacy from merchants and other trackers, which is one of the biggest challenges to privacy today.
---
<small>Protects against the following threat(s):</small>

- [:material-account-cash: Surveillance Capitalism](basics/common-threats.md#surveillance-as-a-business-model){ .pg-brown }

Making payments online is one of the biggest challenges to privacy. These services can assist you in protecting your privacy from merchants and other trackers, provided you have a strong understanding of how to make private payments effectively. We strongly encourage you first read our payments overview article before making any purchases:

[Making Private Payments :material-arrow-right-drop-circle:](advanced/payments.md){ .md-button }

## Payment Privacy (Cards, KYC, Merchant Tracking)

**Payment tracking mechanisms**: credit card networks (Visa, Mastercard) see every transaction (merchant, amount, time, location). Banks see the same. Merchants collect purchase history, correlate with loyalty programs, share/sell data to brokers (data fusion: combine payment data with browsing, location, demographics).

**Virtual card services**: generate disposable card numbers linked to your real account. Merchant charges virtual card; service forwards charge to your real card. Merchant doesn't see real card details. Limits tracking: each merchant gets unique card number (can't correlate across merchants). Can set spending limits, pause/delete cards.

**KYC (Know Your Customer)**: financial regulations require identity verification. Virtual card services must verify your identity (Social Security Number, ID scan, address). Not anonymous but compartmentalizes payment data (merchant sees virtual card issuer, not your name/bank).

**Virtual cards do NOT protect against**: 
1. **Service provider**: Privacy.com/MySudo see all your transactions (logs, may share with bank/authorities).
2. **Card network**: Visa/Mastercard still process transaction (see merchant, amount, time).
3. **Shipping address**: physical purchases require real address (correlates identity).
4. **IP address**: online merchant logs your IP (link payment to browsing session; use VPN/Tor).

**Private spend mode** (Privacy.com feature): hides merchant name from your bank. Bank sees "Privacy.com charge $50" not "Privacy.com - adultshop.example $50". Reduces judgment/embarrassment but Privacy.com still knows.

**Cryptocurrency gift cards**: buy gift cards with crypto (Monero preferred for privacy). No KYC for small amounts. Merchant sees only gift card, not payment method. Still risks: IP tracking, shipping address, purchase patterns. Best with Tor + mail forwarding service.

**Example: payment tracking without virtual cards**:
1. Buy $100 item at store A with card 1234.
2. Buy $50 item at store B with same card 1234.
3. Data broker buys transaction data from both merchants.
4. Broker merges: "Cardholder 1234 shops at A and B, buys X and Y categories."
5. Sell profile to advertisers, insurance, employers.

With virtual cards: stores see different card numbers, can't merge without additional identifiers (email, phone, address).

## Payment Masking Services

<small>Protects against the following threat(s):</small>

- [:material-account-search: Public Exposure](basics/common-threats.md#limiting-public-information){ .pg-green }

There are a number of services which provide "virtual debit cards" which you can use with online merchants without revealing your actual banking or billing information in most cases. It's important to note that these financial services are **not** anonymous and are subject to "Know Your Customer" (KYC) laws and may require your ID or other identifying information. These services are primarily useful for protecting you from merchant data breaches, less sophisticated tracking or purchase correlation by marketing agencies, and online data theft; and **not** for making a purchase completely anonymously.

<div class="admonition tip" markdown>
<p class="admonition-title">Check your current bank</p>

Many banks and credit card providers offer native virtual card functionality. If you use one which provides this option already, you should use it over the following recommendations in most cases. That way, you are not trusting multiple parties with your personal information.

</div>

### Privacy.com (US)

<div class="admonition recommendation" markdown>

![Privacy.com logo](assets/img/financial-services/privacy_com.svg#only-light){ align=right }
![Privacy.com logo](assets/img/financial-services/privacy_com-dark.svg#only-dark){ align=right }

**Privacy.com**'s free plan allows you to create up to 12 virtual cards per month, set spend limits on those cards, and shut off cards instantly. Their paid plans provide higher limits on the number of cards that can be created each month.

[:octicons-home-16: Homepage](https://privacy.com){ .md-button .md-button--primary }
[:octicons-eye-16:](https://privacy.com/privacy-policy){ .card-link title="Privacy Policy" }
[:octicons-info-16:](https://support.privacy.com){ .card-link title=Documentation}

</details>

</div>

Privacy.com gives information about the merchants you purchase from to your bank by [default](https://support.privacy.com/hc/en-us/articles/360012407533-What-will-I-see-on-my-bank-statement-when-I-make-a-purchase-with-Privacy). Their "[private spend mode](https://support.privacy.com/hc/en-us/articles/26732314558487-What-is-Private-Spend-Mode)" feature hides merchant information from your bank, so your bank only sees that a purchase was made with Privacy.com, but not where that money was spent. However, that is not foolproof, and of course, Privacy.com still has knowledge about the merchants you are spending money with.

### MySudo (US, Paid)

<div class="admonition recommendation" markdown>

![MySudo logo](assets/img/financial-services/mysudo.svg#only-light){ align=right }
![MySudo logo](assets/img/financial-services/mysudo-dark.svg#only-dark){ align=right }

**MySudo** provides up to 9 virtual cards depending on the plan you purchase. Their paid plans additionally include functionality which may be useful for making purchases privately, such as virtual phone numbers and email addresses, although we typically recommend other [email aliasing providers](email-aliasing.md) for extensive email aliasing use.

[:octicons-home-16: Homepage](https://mysudo.com){ .md-button .md-button--primary }
[:octicons-eye-16:](https://anonyome.com/privacy-policy){ .card-link title="Privacy Policy" }
[:octicons-info-16:](https://support.mysudo.com){ .card-link title=Documentation}

</details>

</div>

MySudo's virtual cards are currently only available via their iOS app.

### Criteria

**Please note we are not affiliated with any of the projects we recommend.** In addition to [our standard criteria](about/criteria.md), we have developed a clear set of requirements to allow us to provide objective recommendations. We suggest you familiarize yourself with this list before choosing to use a project, and conduct your own research to ensure it's the right choice for you.

- Allows the creation of multiple cards which function as a shield between the merchant and your personal finances.
- Cards must not require you to provide accurate billing address information to the merchant.

## Gift Card Marketplaces

<small>Protects against the following threat(s):</small>

- [:material-eye-outline: Mass Surveillance](basics/common-threats.md#mass-surveillance-programs){ .pg-blue }

These services allow you to purchase gift cards for a variety of merchants online with [cryptocurrency](cryptocurrency.md). Some of these services offer ID verification options for higher limits, but they also allow accounts with just an email address. Basic limits typically start at $5,000-10,000 a day for basic accounts, with significantly higher limits for ID verified accounts (if offered).

### Coincards

<div class="admonition recommendation" markdown>

![Coincards logo](assets/img/financial-services/coincards.svg){ align=right }

**Coincards** allows you to purchase gift cards for a large variety of merchants. Their homepage has a complete listing of the various countries where their service is available.

[:octicons-home-16: Homepage](https://coincards.com){ .md-button .md-button--primary }
[:octicons-eye-16:](https://coincards.com/privacy-policy){ .card-link title="Privacy Policy" }
[:octicons-info-16:](https://coincards.com/frequently-asked-questions){ .card-link title=Documentation}

</details>

</div>

### Criteria

**Please note we are not affiliated with any of the projects we recommend.** In addition to [our standard criteria](about/criteria.md), we have developed a clear set of requirements to allow us to provide objective recommendations. We suggest you familiarize yourself with this list before choosing to use a project, and conduct your own research to ensure it's the right choice for you.

- Accepts payment in [a recommended cryptocurrency](cryptocurrency.md).
- No ID requirement.

<div class="admonition tip" markdown>
<p class="admonition-title">Important notices</p>

The content here is not legal or financial advice. We do not endorse or encourage illicit activities, and we do not endorse or encourage anything which violates a company's terms of service. Check with a professional to confirm that these recommendations are legal and available in your jurisdiction. [See all notices](about/notices.md).

</div>
