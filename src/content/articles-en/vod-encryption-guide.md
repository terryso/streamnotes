---
title: "How to Encrypt Video on Demand: A Practical Guide to HLS AES-128, DRM, Hotlink Protection, and Watermarking"
description: "A systematic look at the four layers of VOD content protection—transport and storage security, HLS AES-128 and SAMPLE-AES, commercial DRM, and URL authentication, hotlink protection, and digital watermarking—with recommended combinations for different businesses."
pubDate: 2026-10-08
category: tutorial
tags: [Video encryption, VOD, DRM, HLS encryption, Hotlink protection, Video watermarking]
tldr:
  - "No solution is truly screen-recording-proof. The goal of video protection is to raise the cost of piracy and make leaks traceable to their source."
  - "HLS AES-128 is simple and widely compatible, but its security depends on whether key delivery is authenticated."
  - "Commercial DRM (Widevine, FairPlay, PlayReady) offers stronger security, at a higher cost for integration and licensing."
  - "Recommended combination: segment encryption + an authenticated key service + signed URLs for hotlink protection + user-identifying watermarks."
faq:
  - q: "Can a video still be downloaded after HLS AES-128 encryption?"
    a: "The segment files themselves can be downloaded, but they can't be decrypted and played without the key. If the key endpoint isn't authenticated, an attacker can simply fetch the key, so the key service must verify the user's identity and playback credentials."
  - q: "Do we have to use DRM?"
    a: "Not necessarily. Commercial DRM is needed when film and TV rights holders explicitly require it. For corporate training, paid courses, and similar scenarios, a combination of segment encryption, key authentication, hotlink protection, and watermarking usually strikes a good balance between cost and security."
  - q: "Can watermarks stop screen recording?"
    a: "Watermarks can't stop screen recording, but a watermark showing a user ID, part of a phone number, or a timestamp can identify the leaker after a video gets out, which acts as both a deterrent and a way to trace the source."
  - q: "What's the difference between hotlink protection and encryption?"
    a: "Hotlink protection controls who can access the resource URL—for example with URL signing, Referer checks, and IP allowlists and blocklists. Encryption ensures that even someone who has the file can't watch it. They solve different problems and should be used together."
sources:
  - title: "RFC 8216 - HTTP Live Streaming (EXT-X-KEY encryption methods)"
    url: https://www.rfc-editor.org/rfc/rfc8216
  - title: "W3C - Encrypted Media Extensions"
    url: https://www.w3.org/TR/encrypted-media/
  - title: "Apple Developer - FairPlay Streaming"
    url: https://developer.apple.com/streaming/fps/
related: [live-latency-protocols, private-deployment-polyv]
---

For online education, corporate training, and paid-content platforms, video is the core asset. When courses are downloaded and resold, the damage isn't just lost revenue—internal materials can leak too. This article walks through common approaches to VOD content protection so you can combine them to fit your business.

> As long as a video can play on a screen, it can be screen-recorded. The goal of content protection is to raise the cost of piracy and make leaks traceable.

## 1. Set the right goal: raise the cost + make leaks traceable

Start by accepting one fact: as long as a video can play on a screen, it can be screen-recorded. So content protection has two reasonable goals:

1. **Raise the cost of piracy**, so ordinary users can't get a playable file with a simple download tool.
2. **Make leaks traceable**, so you can identify which account leaked the video and when.

Around those two goals, you can build four layers of defense.

## 2. Layer one: transport and storage security

- **HTTPS everywhere**: prevents video URLs and keys from being sniffed in transit.
- **Private storage buckets**: set source-file storage to private read, accessible only to the transcoding service and CDN origin fetches.
- **Tiered admin permissions**: grant upload, review, publish, and delete operations by role, and keep operation logs.

This layer costs the least but is the easiest to overlook.

## 3. Layer two: segment encryption

### HLS AES-128

The HLS standard (RFC 8216) defines encryption through the `EXT-X-KEY` tag. In AES-128 mode, each entire segment is encrypted with AES-128-CBC, and the player fetches the key from the `URI` in the playlist before decrypting and playing.

```
#EXT-X-KEY:METHOD=AES-128,URI="https://key.example.com/getkey?vid=123&token=xxx",IV=0x...
```

Its advantage is that almost every HLS-capable player can play it, and integration is simple. **The key risk is the key endpoint**: if the `URI` can be accessed by anyone, the encryption is effectively useless. Do it properly:

- Have the key endpoint verify the login session or a one-time playback token, with a short expiry.
- Use a different key for each video, and rotate keys periodically if needed.
- Obfuscate the key on the player side so it never appears in plain text in network requests.

### SAMPLE-AES

SAMPLE-AES encrypts only the audio and video sample data while leaving the container structure in the clear. It is often used together with DRM schemes such as FairPlay.

## 4. Layer three: commercial DRM

DRM relies on the browser's EME (Encrypted Media Extensions) interface and the device's CDM module to decrypt in a trusted environment, so keys are never exposed to JavaScript. There are three mainstream systems:

| System | Main platform coverage |
|---|---|
| Google Widevine | Chrome, Android, some smart TVs |
| Apple FairPlay | Safari, iOS, tvOS |
| Microsoft PlayReady | Edge, Windows, some smart TVs |

Covering every platform usually means running multiple DRMs side by side with CENC/CMAF packaging, which raises integration and licensing costs. Film and TV rights holders usually require DRM explicitly; corporate training scenarios can evaluate it as needed.

## 5. Layer four: hotlink protection and watermarking

### URL authentication and hotlink protection

- **URL signing**: playback URLs carry an expiry time and a signature and stop working once expired, so forwarded links can't be used indefinitely.
- **Referer / domain allowlists**: only your own sites or apps may embed the content.
- **IP allowlists and blocklists, plus rate limiting**: block abnormal bulk requests.

### Digital watermarks

- **Visible watermarks**: overlay the user's nickname, ID, or part of a phone number on the picture, optionally moving to random positions to make cropping harder.
- **Invisible watermarks**: imperceptible to the eye, they let you extract user information from a leaked video—suited to content with stricter copyright requirements.

## 6. Hardening the player side

However well the server side is built, the player is where attackers focus. Common hardening measures include:

- **Limit concurrent playback**: warn or block when one account plays on several devices at once, reducing account sharing.
- **Detect debugging and screen-recording environments**: in your app, detect emulators, debugging tools, and some screen-recording software, and pause playback when found.
- **Block screenshots and recording on mobile**: Android provides a secure-window flag that prevents screenshots, and iOS can detect screen-recording status and respond.
- **Encrypt offline caches**: if offline viewing is allowed, cached files must be stored encrypted and bound to the device and an expiry.

These measures can't guarantee complete protection either, but they stop most casual downloading.

## 7. Operational measures

Beyond technology, management measures matter just as much: explicitly prohibit redistribution of course content in your user agreement; set alerts for abnormal playback (for example, pulling a large number of segments in a short time); and when a leak is found, identify the account via the watermark and act under the agreement. Only technology and policy together form a complete content protection system.

## 8. Recommended combinations by scenario

| Scenario | Recommended combination |
|---|---|
| Corporate training, internal materials | HTTPS + segment encryption + login authentication + visible watermark, optionally integrated with enterprise single sign-on |
| Paid courses | Segment encryption + one-time playback tokens + URL signing + moving (marquee) watermark |
| Film and TV licensed content | Multi-DRM + CMAF + invisible watermark |

If your team doesn't want to build the whole system in-house, choose a VOD platform with built-in video encryption. During selection, ask vendors to explain, item by item, their AES encryption, URL authentication, video watermarking, IP allowlists and blocklists, and operation logs, and check them against the four layers above.
