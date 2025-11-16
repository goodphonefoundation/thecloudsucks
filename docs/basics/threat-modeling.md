---
meta_title: "Threat Modeling: The First Step on Your Privacy Journey - The Cloud Sucks"
title: "Threat Modeling"
icon: 'material/target-account'
description: Balancing security, privacy, and usability is one of the first and most difficult tasks you'll face on your privacy journey.
---

Balancing security, privacy, and usability is one of the first and most difficult tasks you'll face on your privacy journey. Everything is a trade-off: The more secure something is, the more restricting or inconvenient it generally is, etc. Often, people find that the problem with the tools they see recommended is that they're just too hard to start using!

If you wanted to use the **most** secure tools available, you'd have to sacrifice *a lot* of usability. And, even then, ==nothing is ever fully secure.== There's **high** security, but never **full** security. That's why threat models are important.

**So, what are these threat models, anyway?**

==A threat model is a list of the most probable threats to your security and privacy endeavors.== Since it's impossible to protect yourself against **every** attack(er), you should focus on the **most probable** threats. In computer security, a threat is an event that could undermine your efforts to stay private and secure.

Focusing on the threats that matter to you narrows down your thinking about the protection you need, so you can choose the tools that are right for the job.

## Threat Modeling Framework (Assets, Adversaries, Capabilities, Risks)

**Assets**: what you're protecting. Not just files/data but also: metadata (who you talk to, when), identity (real name vs pseudonym), location, associations (political group, religion), reputation. Digital assets: encryption keys, account credentials, communications, browsing history.

**Adversaries**: who threatens your assets. Different adversaries have different:
- **Capabilities**: nation-state (zero-days, mass surveillance, legal compulsion) vs hacker (exploits, social engineering) vs ex-partner (physical access, social knowledge) vs corporation (data purchases, tracking networks).
- **Motivations**: surveillance, profit, harassment, theft, censorship, exposure.
- **Resources**: time, money, technical skill, legal authority.

**Attack vectors**: how adversaries can compromise assets. Technical: malware, network interception, service provider access. Non-technical: physical device theft, coercion, legal demands, social engineering.

**Risk = Likelihood × Impact**: prioritize high-likelihood or high-impact threats. Example: state surveillance (low likelihood for most people, extreme impact for journalists/activists). Ransomware (higher likelihood, variable impact based on backups).

**Security vs privacy vs anonymity**:
- **Security**: protecting from unauthorized access/modification. Technical controls: encryption, authentication, patching. Prevents data breaches, account takeovers.
- **Privacy**: controlling how your data is used/shared. Limits what service providers see. E2EE = privacy from provider. Metadata still exposed.
- **Anonymity**: disassociating actions from identity. Tor hides your IP. Pseudonyms separate online/offline identities. Hardest to achieve; requires perfect operational security.

**Usability trade-offs**: more security/privacy = more friction. Examples:
- 2FA: better security, slower login.
- E2EE messaging: privacy from server, but backups harder, multi-device sync complex.
- Tor: anonymity, but slow, breaks some websites.
- Qubes OS: strong isolation, but steep learning curve, high resource usage.

Choose protections proportional to actual risks, not imagined worst-cases. Unusable security won't be used consistently.

**Example threat model comparison**:

**Journalist covering corruption**:
- Assets: sources' identities, unpublished documents, communications.
- Adversaries: government (surveillance, legal demands), subjects of investigation (retaliation).
- Risks: source exposure = imprisonment/death. Very high impact.
- Mitigations: Tor + Tails for anonymity, Signal for source comms, encrypted storage, no cloud services, physical security (burner phones, leave devices at border).

**Average user concerned about ad tracking**:
- Assets: browsing history, interests, purchasing behavior.
- Adversaries: ad networks, data brokers.
- Risks: creepy ads, insurance/employment discrimination (low-medium impact).
- Mitigations: browser content blocker (uBlock Origin), privacy-focused search engine, VPN for public Wi-Fi. Overkill: Tor for daily browsing (slow, breaks sites).

## Creating Your Threat Model

To identify what could happen to the things you value and determine from whom you need to protect them, you should answer these five questions:

1. What do I want to protect?
2. Who do I want to protect it from?
3. How likely is it that I will need to protect it?
4. How bad are the consequences if I fail?
5. How much trouble am I willing to go through to try to prevent potential consequences?

### What do I want to protect?

An “asset” is something you value and want to protect. In the context of digital security, ==an asset is usually some kind of information.== For example, your emails, contact lists, instant messages, location, and files are all possible assets. Your devices themselves may also be assets.

*Make a list of your assets: data that you keep, where it's kept, who has access to it, and what stops others from accessing it.*

### Who do I want to protect it from?

To answer this question, it's important to identify who might want to target you or your information. ==A person or entity that poses a threat to your assets is an “adversary”.== Examples of potential adversaries are your boss, your former partner, your business competition, your government, or a hacker on a public network.

*Make a list of your adversaries or those who might want to get hold of your assets. Your list may include individuals, a government agency, or corporations.*

Depending on who your adversaries are, this list might be something you want to destroy after you've finished developing your threat model.

### How likely is it that I will need to protect it?

==Risk is the likelihood that a particular threat against a particular asset will actually occur.== It goes hand-in-hand with capability. While your mobile phone provider has the capability to access all of your data, the risk of them posting your private data online to harm your reputation is low.

It is important to distinguish between what might happen and the probability it may happen. For instance, there is a threat that your building might collapse, but the risk of this happening is far greater in San Francisco (where earthquakes are common) than in Stockholm (where they are not).

Assessing risks is both a personal and subjective process. Many people find certain threats unacceptable, no matter the likelihood they will occur, because the mere presence of the threat is not worth the cost. In other cases, people disregard high risks because they don't view the threat as a problem.

*Write down which threats you are going to take seriously, and which may be too rare or too harmless (or too difficult to combat) to worry about.*

### How bad are the consequences if I fail?

There are many ways that an adversary could gain access to your data. For example, an adversary can read your private communications as they pass through the network, or they can delete or corrupt your data.

==The motives of adversaries differ widely, as do their tactics.== A government trying to prevent the spread of a video showing police violence may be content to simply delete or reduce the availability of that video. In contrast, a political opponent may wish to gain access to secret content and publish that content without you knowing.

Security planning involves understanding how bad the consequences could be if an adversary successfully gains access to one of your assets. To determine this, you should consider the capability of your adversary. For example, your mobile phone provider has access to all of your phone records. A hacker on an open Wi-Fi network can access your unencrypted communications. Your government might have stronger capabilities.

*Write down what your adversary might want to do with your private data.*

### How much trouble am I willing to go through to try to prevent potential consequences?

==There is no perfect option for security.== Not everyone has the same priorities, concerns, or access to resources. Your risk assessment will allow you to plan the right strategy for you, balancing convenience, cost, and privacy.

For example, an attorney representing a client in a national security case may be willing to go to greater lengths to protect communications about that case, such as using encrypted email, than a mother who regularly emails her daughter funny cat videos.

*Write down what options you have available to you to help mitigate your unique threats. Note if you have any financial constraints, technical constraints, or social constraints.*

### Try it yourself: Protecting Your Belongings

These questions can apply to a wide variety of situations, online and offline. As a generic demonstration of how these questions work, let's build a plan to keep your house and possessions safe.

**What do you want to protect? (Or, *what do you have that is worth protecting?*)**

:   Your assets might include jewelry, electronics, important documents, or photos.

**Who do you want to protect it from?**

:   Your adversaries might include burglars, roommates, or guests.

**How likely is it that you will need to protect it?**

:   Does your neighborhood have a history of burglaries? How trustworthy are your roommates or guests? What are the capabilities of your adversaries? What are the risks you should consider?

**How bad are the consequences if you fail?**

:   Do you have anything in your house that you cannot replace? Do you have the time or money to replace those things? Do you have insurance that covers goods stolen from your home?

**How much trouble are you willing to go through to prevent these consequences?**

:   Are you willing to buy a safe for sensitive documents? Can you afford to buy a high-quality lock? Do you have time to open a security box at your local bank and keep your valuables there?

Only once you have asked yourself these questions will you be in a position to assess what measures to take. If your possessions are valuable, but the probability of a break-in is low, then you may not want to invest too much money in a lock. But, if the probability of a break-in is high, you'll want to get the best lock on the market and consider adding a security system.

Making a security plan will help you to understand the threats that are unique to you and to evaluate your assets, your adversaries, and your adversaries' capabilities, along with the likelihood of risks you face.

## Further Reading

For people looking to increase their privacy and security online, we've compiled a list of common threats our visitors face or goals our visitors have, to give you some inspiration and demonstrate the basis of our recommendations.

- [Common Goals and Threats :material-arrow-right-drop-circle:](common-threats.md)

## Sources

- [EFF Surveillance Self Defense: Your Security Plan](https://ssd.eff.org/en/module/your-security-plan)
