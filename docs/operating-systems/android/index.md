---
title: "Android"
description: Our advice for replacing privacy-invasive default Android features with private and secure alternatives.
icon: 'simple/android'
cover: android.webp
schema:
  -
    "@context": http://schema.org
    "@type": WebPage
    name: Android Recommendations
    url: "./"
  -
    "@context": http://schema.org
    "@type": CreativeWork
    name: Android
    image: /assets/img/android/android.svg
    url: https://source.android.com/
    sameAs: https://en.wikipedia.org/wiki/Android_(operating_system)
---

![Android logo](../assets/img/android/android.svg){ align=right }

The **Android Open Source Project** (AOSP) is an open-source mobile operating system led by Google which powers the majority of the world's mobile devices. Most phones sold with Android are modified to include invasive integrations and apps such as Google Play Services, so you can significantly improve your privacy on your mobile device by replacing your phone's default installation with a version of Android without these invasive features.

[General Android Overview :material-arrow-right-drop-circle:](../os/android-overview.md){ .md-button .md-button--primary }

## Android Security Model (AVB, SELinux, Sandboxing)

**Android Verified Boot (AVB)**: cryptographic chain of trust from bootloader to system partition. Boot process verifies each stage with keys in hardware. Prevents rootkits, bootloader tampering. Custom ROMs must properly implement AVB or security model breaks (unsigned partitions = verification disabled).

**SELinux (Security-Enhanced Linux)**: mandatory access control. Every process and file has security context; policy enforces what each process can do. Enforcing mode (production): violations blocked. Permissive mode (debug): violations logged but allowed. Custom ROMs with permissive SELinux = much weaker security.

**App sandboxing**: each app runs as separate Linux user with unique UID. Filesystem permissions + SELinux isolate apps from each other. Apps cannot read other apps' data. Permissions required for sensitive resources (camera, location, contacts).

**Google Play Services architecture**: privileged system app with extensive permissions. Provides APIs for location, push notifications (FCM), SafetyNet/Play Integrity, app licensing. Apps depend on it; deeply integrated. Privacy concern: sees all apps using it, tracks location, analyzes usage patterns.

**Why rooting breaks security**: disables Verified Boot (modified system partition). Exposes root access via su binary. Apps can request root, bypass sandboxing, escalate privileges. SELinux policies weakened. Update integrity compromised (OTA updates fail or require unsigned images).

**Custom ROM security considerations**: many ROMs ship userdebug builds (adb root enabled, permissive SELinux). GrapheneOS/CalyxOS use production builds with proper AVB. Check: rollback protection (prevent downgrade attacks), timely security patches, enforcing SELinux, locked bootloader after install.

**Example: app permission enforcement**:
1. App requests camera access (manifest declares `<uses-permission android:name="android.permission.CAMERA" />`).
2. User grants permission via OS prompt.
3. SELinux policy allows app's UID to access `/dev/video*` devices.
4. App can now open camera. Revoke permission: SELinux denies access even if app tries.

**Google Play Services alternatives**: MicroG (open-source reimplementation of Play Services APIs; limited functionality), sandboxed Play Services (GrapheneOS approach: runs Play Services as normal app without special privileges), or no Play Services (many apps break; banking apps often require it).

## Our Advice

### Replace Google Services

There are many methods of obtaining apps on Android while avoiding Google Play. Whenever possible, try using one of these methods before getting your apps from non-private sources:

[Obtaining Applications :material-arrow-right-drop-circle:](obtaining-apps.md){ .md-button }

There are also many private alternatives to the apps that come pre-installed on your phone, such as the camera app. Besides the Android apps we recommend throughout this site in general, we've created a list of system utilities specific to Android which you might find useful.

[General App Recommendations :material-arrow-right-drop-circle:](general-apps.md){ .md-button }

### Install a Custom Distribution

When you buy an Android phone, the default operating system comes bundled with apps and functionality that are not part of the Android Open Source Project. Many of these apps—even apps like the dialer which provide basic system functionality—require invasive integrations with Google Play Services, which in turn asks for privileges to access your files, contacts storage, call logs, SMS messages, location, camera, microphone, and numerous other things on your device in order for those basic system apps and many other apps to function in the first place. Frameworks like Google Play Services increase the attack surface of your device and are the source of various privacy concerns with Android.

This problem could be solved by using an alternative Android distribution, commonly known as a *custom ROM*, that does not come with such invasive integration. Unfortunately, many custom Android distributions often violate the Android security model by not supporting critical security features such as AVB, rollback protection, firmware updates, and so on. Some distributions also ship [`userdebug`](https://source.android.com/setup/build/building#choose-a-target) builds which expose root via [ADB](https://developer.android.com/studio/command-line/adb) and require [more permissive](https://github.com/LineageOS/android_system_sepolicy/search?q=userdebug&type=code) SELinux policies to accommodate debugging features, resulting in a further increased attack surface and weakened security model.

Ideally, when choosing a custom Android distribution, you should make sure that it upholds the Android security model. At the very least, the distribution should have production builds, support for AVB, rollback protection, timely firmware and operating system updates, and SELinux in [enforcing mode](https://source.android.com/security/selinux/concepts#enforcement_levels). All of our recommended Android distributions satisfy these criteria:

[Recommended Distributions :material-arrow-right-drop-circle:](distributions.md){ .md-button }

### Avoid Root

[Rooting](https://en.wikipedia.org/wiki/Rooting_(Android)) Android phones can decrease security significantly as it weakens the complete [Android security model](https://en.wikipedia.org/wiki/Android_(operating_system)#Security_and_privacy). This can decrease privacy should there be an exploit that is assisted by the decreased security. Common rooting methods involve directly tampering with the boot partition, making it impossible to perform successful Verified Boot. Apps that require root will also modify the system partition, meaning that Verified Boot would have to remain disabled. Having root exposed directly in the user interface also increases the attack surface of your device and may assist in [privilege escalation](https://en.wikipedia.org/wiki/Privilege_escalation) vulnerabilities and SELinux policy bypasses.

Content blockers which modify the [hosts file](https://en.wikipedia.org/wiki/Hosts_(file)) (like AdAway) and firewalls which require root access persistently (like AFWall+) are dangerous and should not be used. They are also not the correct way to solve their intended purposes. For content blocking, we suggest encrypted [DNS](../dns.md) or content blocking functionality provided by a VPN instead. TrackerControl and AdAway in non-root mode will take up the VPN slot (by using a local loopback VPN), preventing you from using privacy-enhancing services such as [Orbot](../alternative-networks.md#orbot) or a [real VPN provider](../vpn.md).

AFWall+ works based on the [packet filtering](https://en.wikipedia.org/wiki/Firewall_(computing)#Packet_filter) approach and may be bypassable in some situations.

We do not believe that the security sacrifices made by rooting a phone are worth the questionable privacy benefits of those apps.

### Install Updates Regularly

It's important to not use an [end-of-life](https://endoflife.date/android) version of Android. Newer versions of Android receive not only security updates for the operating system but also important privacy enhancing updates too.

For example, [prior to Android 10](https://developer.android.com/about/versions/10/privacy/changes) any apps with the [`READ_PHONE_STATE`](https://developer.android.com/reference/android/Manifest.permission#READ_PHONE_STATE) permission could access sensitive and unique serial numbers of your phone such as [IMEI](https://en.wikipedia.org/wiki/International_Mobile_Equipment_Identity), [MEID](https://en.wikipedia.org/wiki/Mobile_equipment_identifier), or your SIM card's [IMSI](https://en.wikipedia.org/wiki/International_mobile_subscriber_identity); whereas now they must be system apps to do so. System apps are only provided by the OEM or Android distribution.

### Use Built-in Sharing Features

You can avoid giving many apps permission to access your media with Android's built-in sharing features. Many applications allow you to "share" a file with them for media upload.

For example, if you want to post a picture to Discord you can open your file manager or gallery and share that picture with the Discord app, instead of granting Discord full access to your media and photos.
