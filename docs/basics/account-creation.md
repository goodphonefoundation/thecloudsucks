---
meta_title: "How to Create Internet Accounts Privately - The Cloud Sucks"
title: "Account Creation"
icon: 'material/account-plus'
description: Creating accounts online is practically an internet necessity, take these steps to make sure you stay private.
---

Often people sign up for services without thinking. Maybe it's a streaming service to watch that new show everyone's talking about, or an account that gives you a discount for your favorite fast food place. Whatever the case may be, you should consider the implications for your data now and later on down the line.

There are risks associated with every new service that you use. Data breaches; disclosure of customer information to third parties; rogue employees accessing data; all are possibilities that must be considered when giving your information out. You need to be confident that you can trust the service, which is why we don't recommend storing valuable data on anything but the most mature and battle-tested products. That usually means services which provide E2EE and have undergone a cryptographic audit. An audit increases assurance that the product was designed without glaring security issues caused by an inexperienced developer.

It can also be difficult to delete the accounts on some services. Sometimes [overwriting data](account-deletion.md#overwriting-account-information) associated with an account can be possible, but in other cases the service will keep an entire history of changes to the account.

## Account Privacy (Authentication, OAuth, Identity Correlation)

**Identity correlation across services**: services link accounts via email, phone number, payment methods, IP addresses, device fingerprints. Data brokers merge: email from breach A + phone from breach B + credit card from merchant C = comprehensive profile. Compartmentalization (unique identifiers per service) breaks correlation.

**Email-based tracking**: your email address is unique, persistent identifier. Service sends you emails; tracking pixels in emails reveal when/where you open them. Email breaches expose all accounts using that address. Aliasing mitigates: service A gets alias1@, service B gets alias2@; breach of A doesn't expose B.

**Phone number risks**: tied to real identity (carrier KYC). SIM swaps bypass SMS 2FA. VoIP numbers flagged as fraud by many services. Port-out scams. Phone numbers sold to data brokers. Avoid when possible; use for important accounts only (banking, government) where legally required.

**OAuth ("Sign in with Google/Facebook")**: **Advantages**: don't share password with untrusted service; OAuth provider (Google) has better security than random forum; hardware key on OAuth account protects all linked accounts. **Disadvantages**: OAuth provider tracks every service you log into; compromise of OAuth account = compromise of all linked accounts; bidirectional data sharing (service may post to your Twitter, read messages). Use sparingly for non-sensitive accounts.

**OAuth flow**:
1. Click "Sign in with Google" on forum.
2. Redirected to Google's auth server.
3. Google asks: "Allow forum.example to: read your email, post to profile?" (review permissions carefully).
4. Approve. Google issues token to forum.example.
5. Forum uses token to fetch your Google profile (name, email).
6. Forum creates account linked to your Google ID.
7. Google logs: "user accessed forum.example at timestamp".

Forum never sees your password. But Google knows you use forum. If forum malicious, can abuse granted permissions.

**Username-only accounts**: most anonymous option (no email, no phone). Used by: some forums, Tor hidden services. **Risk**: account unrecoverable if password forgotten. No password reset. Backup recovery codes essential. Use password manager; export/backup vault.

**Automated bans (false positives)**: services use fraud detection (IP reputation, VoIP detection, rate limiting). VPN/Tor users flagged. CAPTCHA challenges or account locks. Appeals often automated (ineffective). High-value accounts (email, banking) risky to protect with VPN during signup. Consider: create account from home IP, enable 2FA, then use VPN.

**Data minimization**: only provide required fields. Fake birthday (privacy), real name only if necessary (legal, shipping). Services often request optional data (phone for "security", real name for "verification"); skip unless required. Less data shared = less data breached.

## Terms of Service & Privacy Policy

The ToS are the rules that you agree to follow when using the service. With larger services these rules are often enforced by automated systems. Sometimes these automated systems can make mistakes. For example, you may be banned or locked out of your account on some services for using a VPN or VoIP number. Appealing such bans is often difficult, and involves an automated process too, which isn't always successful. This would be one of the reasons why we wouldn't suggest using Gmail for email as an example. Email is crucial for access to other services you might have signed up for.

The Privacy Policy is how the service says they will use your data, and it is worth reading so that you understand how your data will be used. A company or organization might not be legally obligated to follow everything contained in the policy (it depends on the jurisdiction). We would recommend having some idea what your local laws are and what they permit a provider to collect.

We recommend looking for particular terms such as "data collection", "data analysis", "cookies", "ads" or "3rd-party" services. Sometimes you will be able to opt out from data collection or from sharing your data, but it is best to choose a service that respects your privacy from the start.

Keep in mind you're also placing your trust in the company or organization and that they will comply with their own privacy policy.

## Authentication methods

There are usually multiple ways to sign up for an account, each with their own benefits and drawbacks.

### Email and password

The most common way to create a new account is by an email address and password. When using this method, you should use a password manager and follow [best practices](passwords-overview.md) regarding passwords.

<div class="admonition tip" markdown>
<p class="admonition-title">Tip</p>

You can use your password manager to organize other authentication methods too! Just add the new entry and fill the appropriate fields, you can add notes for things like security questions or a backup key.

</div>

You will be responsible for managing your login credentials. For added security, you can set up [MFA](multi-factor-authentication.md) on your accounts.

[Recommended password managers](../passwords.md){ .md-button }

#### Email aliases

If you don't want to give your real email address to a service, you have the option to use an alias. We describe them in more detail on our email services recommendation page. Essentially, alias services allow you to generate new email addresses that forward all emails to your main address. This can help prevent tracking across services and help you manage the marketing emails that sometimes come with the sign-up process. Those can be filtered automatically based on the alias they are sent to.

Should a service get hacked, you might start receiving phishing or spam emails to the address you used to sign up. Using unique aliases for each service can assist in identifying exactly what service was hacked.

[Recommended email aliasing services](../email-aliasing.md){ .md-button }

### "Sign in with..." (OAuth)

[Open Authorization (OAuth)](https://en.wikipedia.org/wiki/OAuth) is an authentication protocol that allows you to register for a service without sharing much information with the service provider, if any, by using an existing account you have with another service instead. Whenever you see something along the lines of "Sign in with *provider name*" on a registration form, it's typically using OAuth.

When you sign in with OAuth, it will open a login page with the provider you choose, and your existing account and new account will be connected. Your password won't be shared, but some basic information typically will (you can review it during the login request). This process is needed every time you want to log in to the same account.

The main advantages are:

- **Security**: You don't have to trust the security practices of the service you're logging into when it comes to storing your login credentials because they are stored with the external OAuth provider. Common OAuth providers like Apple and Google typically follow the best security practices, continuously audit their authentication systems, and don't store credentials inappropriately (such as in plain text).
- **Ease-of-use**: Multiple accounts are managed by a single login.

But there are disadvantages:

- **Privacy**: The OAuth provider you log in with will know the services you use.
- **Centralization**: If the account you use for OAuth is compromised, or you aren't able to log in to it, all other accounts connected to it are affected.

OAuth can be especially useful in those situations where you could benefit from deeper integration between services. Our recommendation is to limit using OAuth to only where you need it, and always protect the main account with [MFA](multi-factor-authentication.md).

All the services that use OAuth will be as secure as your underlying OAuth provider's account. For example, if you want to secure an account with a hardware key, but that service doesn't support hardware keys, you can secure the account you use with OAuth with a hardware key instead, and now you essentially have hardware MFA on all your accounts. It is worth noting though that weak authentication on your OAuth provider account means that any account tied to that login will also be weak.

There is an additional danger when using *Sign in with Google*, *Facebook*, or another service, which is that typically the OAuth process allows for *bidirectional* data sharing. For example, logging in to a forum with your Twitter account could grant that forum access to do things on your Twitter account such as post, read your messages, or access other personal data. OAuth providers will typically present you with a list of things you are granting the external service access to, and you should always ensure that you read through that list and don't inadvertently grant the external service access to anything it doesn't require.

Malicious applications, particularly on mobile devices where the application has access to the WebView session used for logging in to the OAuth provider, can also abuse this process by hijacking your session with the OAuth provider and gaining access to your OAuth account through those means. Using the *Sign in with* option with any provider should usually be considered a matter of convenience that you only use with services you trust to not be actively malicious.

### Phone number

We recommend avoiding services that require a phone number for sign up. A phone number can identify you across multiple services and depending on data sharing agreements this will make your usage easier to track, particularly if one of those services is breached as the phone number is often **not** encrypted.

You should avoid giving out your real phone number if you can. Some services will allow the use of VoIP numbers, however these often trigger fraud detection systems, causing an account to be locked down, so we don't recommend that for important accounts.

In many cases you will need to provide a number that you can receive SMS or calls from, particularly when shopping internationally, in case there is a problem with your order at border screening. It's common for services to use your number as a verification method; don't let yourself get locked out of an important account because you wanted to be clever and give a fake number!

### Username and password

Some services allow you to register without using an email address and only require you to set a username and password. These services may provide increased anonymity when combined with a VPN or Tor. Keep in mind that for these accounts there will most likely be **no way to recover your account** in the event you forget your username or password.
