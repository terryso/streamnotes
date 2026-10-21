---
title: "How to Configure OBS for Streaming: Bitrate, Resolution, Keyframe Interval, and Encoder Choice"
seoTitle: "OBS Streaming Settings: Bitrate & Keyframes"
description: "An OBS streaming settings guide for enterprise and course livestreams: how to set bitrate from your upload bandwidth, how to balance resolution and frame rate, why a 2-second keyframe interval is recommended, how to choose between x264 and hardware encoders (NVENC, QuickSync, AMF, Apple VT), and a pre-broadcast checklist."
pubDate: 2026-10-20
updatedDate: 2026-10-21
category: tutorial
hidePromo: true
tags: [OBS, Streaming settings, Bitrate, Keyframes, Encoders]
tldr:
  - "Measure upload bandwidth first, then set bitrate: keep total streaming bitrate (video + audio) at or below 60–70% of your stable upload bandwidth to leave headroom for fluctuations."
  - "Match resolution and frame rate to bitrate: when bitrate is limited, sharp and stable 720p usually beats blurry, stuttering 1080p, and 30 fps is plenty for lectures and meetings."
  - "A 2-second keyframe interval is a common requirement across most platforms; it affects time to first frame, latency, and alignment of transcoding segments."
  - "Prefer a hardware encoder if you have a discrete GPU or a recent integrated GPU; consider x264 only when you have plenty of CPU headroom and want the best quality per bit."
faq:
  - q: "What bitrate should I use in OBS?"
    a: "There is no single number; it depends on your upload bandwidth and target resolution. Common rules of thumb are about 2,500–4,000 kbps for 720p30 and about 4,500–6,000 kbps for 1080p30. Follow your streaming platform's recommendations, and keep total bitrate below 60–70% of your stable upload bandwidth."
  - q: "Can I leave the keyframe interval at 0 (auto)?"
    a: "Not recommended. In auto mode the keyframe interval can be very long, slowing time to first frame and increasing latency, and some platforms will warn that the keyframe interval doesn't meet their requirements. Set it manually to 2 seconds."
  - q: "Should I use CBR or VBR?"
    a: "For live streaming, CBR (constant bitrate) is the usual choice: the bitrate is steady and friendlier to the network and server-side transcoding. VBR is better suited to local recording."
  - q: "Is stuttering always a network problem?"
    a: "Not necessarily. It can also come from encoding overload (the CPU or GPU can't keep up) or rendering lag (the scene is too complex). In OBS's Stats panel, check frames skipped due to encoding lag, frames dropped due to network, and frames missed due to rendering lag—these map to encoding, network, and rendering problems respectively."
sources:
  - title: "OBS Studio official Help Portal"
    url: https://obsproject.com/help
  - title: "OBS Studio official wiki (GitHub)"
    url: https://github.com/obsproject/obs-studio/wiki
  - title: "YouTube Help - Choose live encoder settings, bitrates, and resolutions"
    url: https://support.google.com/youtube/answer/2853702
  - title: "Twitch Help - Broadcasting Guidelines"
    url: https://help.twitch.tv/s/article/broadcasting-guidelines
related: [live-latency-protocols, corporate-training-live]
---

Many companies start their first livestream with OBS: it's free, open source, cross-platform, and can stream to any platform that accepts RTMP. But OBS has a lot of settings, and the defaults don't necessarily suit your network or scenario. This article follows the order **bitrate first, then picture, then encoder** to explain the parameters that most affect stream quality.

> Bitrate first, then picture, then encoder—get the order right and you can head off most streaming problems before you go live.

## 1. Measure upload bandwidth, then set bitrate

Streaming consumes **upload** bandwidth, not the download figure that stands out in most speed tests. Before going live, run a speed test several times on the streaming computer and take a stable, conservative upload value.

Follow one simple rule when setting bitrate: **video bitrate + audio bitrate ≤ stable upload bandwidth × 60–70%**. The remaining headroom absorbs network fluctuations and usage by other devices on the same network.

Example: with a stable upload of about 10 Mbps, a total streaming bitrate of around 6,000 kbps is a safe choice. If the office network is shared, connect the streaming computer by cable or run a dedicated line.

In OBS, bitrate is set under **Settings → Output** (set Output Mode to **Advanced** to see more options):

- **Rate control**: choose CBR (constant bitrate). Streaming platforms and CDNs prefer a steady stream.
- **Video bitrate**: set it using the rule above, and check the platform's recommended values.
- **Audio bitrate**: 128 kbps is enough for speech; for music performances, use 192–320 kbps.

## 2. Resolution and frame rate: match them to bitrate

Resolution and frame rate are set under **Settings → Video**. There are two values to keep apart:

- **Base (canvas) resolution**: the size OBS uses to composite the scene, usually the same as your monitor or main camera.
- **Output (scaled) resolution**: the size actually encoded and sent out, which must match your bitrate.

Forcing 1080p with too little bitrate produces obvious blockiness during motion. The table below shows common pairings; your streaming platform's recommendations take precedence:

| Output resolution / frame rate | Typical video bitrate | Best for |
|---|---|---|
| 1280×720 / 30fps | 2,500–4,000 kbps | Lectures, interviews, limited upload bandwidth |
| 1920×1080 / 30fps | 4,500–6,000 kbps | Launch events, company meetings, product demos |
| 1920×1080 / 60fps | 6,000–9,000 kbps | Sports, gaming, fast motion |

For content with little on-screen change—lectures, meetings, product explainers—30 fps is enough. Spending the saved bitrate on resolution and image quality gives viewers a better experience. For the scale filter, Lanczos produces a sharper downscaled image but uses a bit more GPU.

## 3. Keyframe interval: set it to 2 seconds manually

A keyframe (I-frame) is a complete picture that can be decoded on its own. The keyframe interval (GOP duration) affects three things:

1. **Time to first frame**: when viewers join, the player has to wait for the next keyframe before showing a picture. The longer the interval, the longer the wait.
2. **Latency**: server-side transcoding and HLS segmenting usually cut on keyframe boundaries, so an interval that's too long stretches segments and increases latency.
3. **Image quality**: an interval that's too short means too many keyframes, which lowers quality at the same bitrate.

All things considered, **2 seconds** is the general-purpose setting that balances quality, time to first frame, and latency, and mainstream streaming platforms' guidelines generally ask for it. The OBS default keyframe interval is 0 (auto); change it to 2. For a detailed look at how latency works, see [Where Does Live Streaming Latency Come From?](/en/articles/live-latency-protocols/)

## 4. Choosing an encoder: software or hardware

OBS offers two main kinds of encoders:

- **Software encoding (x264)** encodes on the CPU and gives better quality at the same bitrate. The **CPU Usage Preset** trades quality against performance (slower presets mean better quality and higher CPU usage). It suits machines with powerful CPUs and plenty of headroom.
- **Hardware encoding** uses NVENC on NVIDIA GPUs, QuickSync on Intel integrated graphics, AMF on AMD GPUs, and Apple VT on Macs. These use almost no CPU, and the latest hardware generations come close to x264's medium preset in quality.

Recommendations:

- When one computer is simultaneously running a camera, slides, a browser, and screen capture, prefer hardware encoding to avoid dropped frames from a maxed-out CPU.
- For hardware encoders, start with the **Quality** preset and leave tuning options at their defaults.
- H.264 has the best compatibility and is the first choice for streaming. HEVC (H.265) and AV1 save bitrate, but first confirm your platform supports ingesting them.

In addition, set **Profile** to high; leaving **B-frames** at the default is usually fine. If you're very sensitive to latency, reduce or disable B-frames to trade a little quality for lower encoding delay.

## 5. Pre-broadcast checklist

1. Double-check the server URL and stream key, and never share screenshots of the stream key.
2. Open the Stats panel (**View → Stats**) and do a 10-minute test stream. Confirm all three kinds of dropped frames are close to zero:
   - Frames skipped due to encoding lag: the encoder can't keep up—use a faster preset or switch to hardware encoding.
   - Frames dropped due to network: upload is insufficient or unstable—lower the bitrate or switch to a wired connection.
   - Frames missed due to rendering lag: the scene is too complex or the GPU is saturated—simplify the scene and remove unneeded sources.
3. Under **Advanced** settings, enable **Automatically Reconnect** with a sensible retry delay so the stream can recover after brief network drops.
4. Watch on another device (ideally a phone on 4G/5G) to confirm audio/video sync and suitable volume.
5. Record a local copy at the same time (recording can use higher quality) as a backup if the stream is interrupted and as material for later editing.

## Conclusion

OBS streaming comes down to three things: keep bitrate within your upload capacity, match resolution to bitrate, and fix the keyframe interval at 2 seconds. On top of that, choose an encoder based on your computer's performance and run a full test with the Stats panel before going live. You'll catch and fix the vast majority of quality and stuttering problems before the broadcast starts.
