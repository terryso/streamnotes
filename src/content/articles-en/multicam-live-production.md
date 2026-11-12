---
title: "Multi-Camera Live Production: Camera Plans, Switching, and Program Output"
seoTitle: "Multi-Camera Live Production: Plans, Switching, and Output"
description: "Corporate launches, training, and interviews increasingly rely on multi-camera livestreams. This article starts from what the program must show, then covers how to plan cameras and content sources, switch between preview and program, keep audio and lip-sync under control, and prepare the program feed, ISO recordings, and backups so the show holds up both live and on replay."
pubDate: 2026-11-12
category: tutorial
tags: [multi-camera, switching, live production, video switcher, corporate livestream]
tldr:
  - "Multi-camera work is not a contest of how many cameras you own: first define what the audience should see at each moment, then decide the camera plan, the switching method, and where the program feed goes."
  - "Match resolution, frame rate, color, and white balance across cameras in advance, and keep one safety shot you can take at any time. Bring slides in as a discrete content source instead of pointing a camera at a screen."
  - "Direct from preview and program, not by hunting for a shot on the live output. Use cuts for dialogue and demos; check lower thirds and graphics on preview before they go to air."
  - "Treat audio and lip-sync as a separate design, and measure them. Record and contribute the program (PGM) feed, add ISO recordings when you will need a recut, and plan encoder and network backups."
faq:
  - q: "How many cameras does a corporate event actually need?"
    a: "There is no fixed number; it depends on the shots you must deliver. A speech usually needs at least a wide or safety shot, a medium-close shot of the speaker, and a discrete feed of the presentation. Interviews add a camera per guest plus a two-shot so you are not cutting to empty frames. List the pictures the program must explain, then choose the count, and always keep one shot you can take at any time."
  - q: "Should we use a hardware switcher or a software director?"
    a: "Both have to solve the same problem: prepare the next shot on preview, then take it to program. When you have few cameras, mostly HDMI or USB capture, and a limited budget, a software director such as OBS Studio's Studio Mode is often enough. When you have many cameras, must stay on SDI, or need hardware tally and tighter switching delay, a hardware switcher is the better fit. What matters is rehearsing on the same input and output path you will use on the day, not only previewing the show on a laptop."
  - q: "Why shouldn't we just point a camera at the presentation screen?"
    a: "Shooting a screen invites moiré, color shift, reflections, and exposure fights, and the result rarely matches the sharpness of the speaker cameras. Bring the computer output in as its own content source. You can then control the title-safe area and crop independently, and use picture-in-picture when needed, which is more stable than adding another camera to film the projector."
  - q: "What is the difference between ISO recording and the program (PGM) recording?"
    a: "PGM is the switched, finished feed used for the livestream and an immediate replay. ISO (isolated recording) is each camera or content source recorded on its own. If you only keep PGM, a wrong take or a graphic that covers text is hard to fix later. When you will recut a VOD or share the event externally, record PGM and ISOs of the key sources, and agree in advance where the clean feed (no graphics) and the dirty, fully packaged feed should go."
sources:
  - title: "ITU-R BT.1359-1 - Relative timing of sound and vision for broadcasting"
    url: https://www.itu.int/rec/R-REC-BT.1359-1-199811-I/en
  - title: "EBU R 128 - Loudness normalisation and permitted maximum level of audio signals"
    url: https://tech.ebu.ch/publications/r128
  - title: "ITU-R BT.709 - Parameter values for the HDTV standards for production and international programme exchange"
    url: https://www.itu.int/rec/R-REC-BT.709
  - title: "OBS Studio Overview (Studio Mode)"
    url: https://obsproject.com/kb/obs-studio-overview
related: [obs-streaming-settings, live-latency-protocols, corporate-training-live, medical-conference-surgery-live]
---

A product launch, all-hands meeting, training session, or dealer event rarely succeeds if the audience can only "see one person clearly." Viewers also need the slides, a product detail, or the relationship between speakers. A single camera packs those needs into one framing and leaves the director almost no choice. The value of a multi-camera setup is to design cameras, switching, and the output path into a rehearsal-ready, fail-soft program chain before you go live—not to add cameras at the last minute.

> Multi-camera production is not a contest of camera count. First define the pictures the program must explain, then decide how many cameras you need, how you will switch, where the program feed goes, and which source you can take if something fails.

## 1. Define the program, then place the cameras

Most corporate events need at least three kinds of pictures, and they do not share a single camera plan:

| Scenario | What must be shown | Camera emphasis |
|---|---|---|
| Launch or keynote | Speaker, slides, product or stage wide | Wide, speaker medium-close, and a discrete content source (slides or demo) |
| Interview or round table | Host, guests, and a two-shot | One camera per person plus a relationship shot, so you are not cutting to empty frames |
| Training or a hands-on demo | Speaker, screen, and close-ups of hands or props | Prioritize the content source and close-up cameras; keep the wide as a safety shot |

Keep at least one safety shot—usually a slightly wide establishing frame or a locked-off speaker shot—so you can return to it when a take is uncertain or a source drops. Bring slides and computer video in as their own inputs rather than filming a screen, which readily introduces moiré, color shift, and exposure conflicts.

In the same program, match resolution, frame rate, color space, and white balance across cameras before you start. Mixing 25 fps with 30 fps, or ITU-R BT.709 with unlocked auto settings, on one switcher often shows up as judder or color drift, and it makes later ISO media harder to align. Set lighting and white balance to the key light on site, and walk every camera across the same chart or reference before you go live.

Watch the axis in framing. Once the speaker's orientation to the audience or the screen is set, do not casually "cross the line," or spatial relationships will flip on a cut. Plan a path and enough cable (or wireless) slack for any moving camera, and keep it out of other cameras' shots.

## 2. The switcher: preview, program, and pacing

Whether you use a hardware switcher or a software director such as OBS Studio's Studio Mode, the core idea is the same two buses: Preview and Program. Confirm framing, focus, and graphics on preview, then take the shot to program. Do not hunt for the next picture on the live output.

Be conservative with transitions. Cuts are the right default for dialogue, argument, and demonstrations: they are clean and do not compete with the content. Dissolves (mixes) fit section changes, openings, and closes. Frequent wipes, effects, or a rapid barrage of angles pull a corporate audience from the material to the production itself. Check lower thirds and name supers on preview so they do not cover a face, a gesture, or a critical number on a slide.

If talent is on camera, give the cameras tally lights so speakers know which one is on the air. Without tally, agree on a hand cue or intercom call from the floor manager. The director, camera operators, audio, and floor should share short, unambiguous calls ("preview 2, take," "back to the wide") and should walk the opening, the demo, Q&A, and the close in rehearsal.

## 3. Audio will ruin a livestream faster than a wrong camera

The most common multi-camera failure is not a bad take. It is audio: two microphones open at once and a comb-filter effect, playback stacked on a live mic, or sound that drifts off the picture. Design the tracks on their own: a lav or headset for the speaker, a handheld or lectern mic as backup, a playback or system feed, and a room mic only if you need it. Before you go live, decide which microphone is primary, and whether the floor mics should be dipped when a video plays.

Measure lip-sync in the chain; do not trust a glance. ITU-R BT.1359 recommends that, from the final program-source selection point to the input of the transmitter, sound should not lead the picture by more than about 22.5 ms, and should not lag it by more than about 30 ms. Typical causes on site are a camera's internal buffer, wireless-video delay, capture delay in software, or mixing a picture that already carries system sound with a separate console feed. Professional plants lock devices to a common sync reference. Even with a software director, keep audio and video on the same host clock, and check delay with a clap or with bars and tone.

Loudness needs a constraint as well. EBU R 128 sets a target of −23 LUFS for broadcast programmes and asks you to measure loudness, not just peak level. A corporate event does not have to be delivered as a broadcast master, but you should still avoid an opening track that is far too hot, speech that is too quiet, or wild swings from section to section. Send the console's program output to the encoder, and keep a local recording of that same feed so you can audit a problem later.

## 4. Program output, ISOs, and backups

The switcher's program output (PGM) is the feed that should go to the encoder. A typical path is: PGM into a contribution encoder (RTMP, SRT, and the like), while a high-bitrate local recording of PGM is made at the same time. If you will recut or produce a polished VOD later, also make ISO recordings (isolated recordings) of each camera and content source—each source on its own disk—rather than keeping only the already-switched show. Distinguish a clean feed (no captions or bugs) from a dirty, fully packaged feed: overflow rooms, interpreters, and partners often need the clean one.

Plan backups around points of failure, not just around an extra camera. At a minimum, consider a second encoder or a redundant contribution, a local recording that does not depend on the network, a backup network path, and one safety shot that does not rely on complex effects. Before you go live, run an end-to-end rehearsal at the same resolution and bitrate you will use on the day, and confirm that switching, graphics, playback, and the walk-off all appear on the program output. For contribution settings, latency, and weak-network behavior, see the site's articles on [OBS streaming settings](/en/articles/obs-streaming-settings/) and [live streaming on weak networks](/en/articles/live-weak-network-optimization/).

## 5. A practical checklist

- The camera plot names each camera's job, lens, axis, and backup role. Content sources are separate inputs; no camera has to cover both a person and a screen.
- Resolution, frame rate, color, and white balance are matched; a safety shot can be taken at any time.
- The director works preview and program, defaults to cuts, and confirms graphics on preview. Talent can see tally or a floor cue.
- Primary and backup mics, playback, and the program audio record are clearly routed; lip-sync and loudness have been checked with a test signal.
- PGM is contributed and recorded locally; ISOs are enabled if a recut is planned; the destinations of the clean and packaged feeds are agreed.
- The encoder, network, and recording have backups, and a rehearsal has been run at the official parameters.

## 6. Closing

Multi-camera directing is not about stacking gear. It is about turning "what the audience should see now" into a camera plan and a switching method, then delivering a stable program feed. Match the cameras, take shots from preview, design audio and sync on their own, and prepare PGM, ISOs, and backups together. Those four habits are what make a corporate live production hold up both on the livestream and on replay.
