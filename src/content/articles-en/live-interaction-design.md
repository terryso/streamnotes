---
title: "Designing Interaction in Enterprise Live Streams: Chat, Q&A, Polls, and Prize Draws"
seoTitle: "Enterprise Live Interaction Design: Chat, Q&A, Polls, Prize Draws"
description: "Interaction in an enterprise live stream is not a decorative toggle. This guide looks at chat, Q&A, polls and quizzes, and prize draws: how to pick the right tool for the event, how to handle identity and moderation, how to line interaction up with playback delay, and which prize-promotion rules apply when a draw is used for marketing."
pubDate: 2026-11-24
category: tutorial
tags: [live interaction, chat moderation, Q&A, polls and quizzes, prize-draw rules]
tldr:
  - "Decide what interaction must accomplish for training, a webinar, or a marketing event before you choose chat, Q&A, polls, or a prize draw. Do not reuse the same set of toggles for every stream."
  - "Chat needs identity, moderation, and alignment with playback delay, so answers or draw results do not appear in the public feed before they appear on screen."
  - "Keep Q&A out of the public chat so hosts can triage, mark, and carry questions into the replay. Lock eligibility, close time, and how results are shown before you start a poll or quiz."
  - "A marketing prize draw is a prize promotion: publish the rules, do not pre-select winners, and keep redemption records. Treat identifiable chat and user IDs as personal information, with a stated purpose and retention period."
faq:
  - q: "Why should chat and Q&A be separate features?"
    a: "The public feed is fine for short reactions, but a worthwhile question is easily pushed aside by a burst of messages. A separate Q&A queue lets a host merge similar questions, sort by upvotes, mark items as answered or private, and keep a highlights list in the replay. The two flows are moderated and retained differently, so they should not share one input box."
  - q: "What should we do when playback delay is high?"
    a: "If the picture is still ten or more seconds behind and chat is pushed in near real time, viewers will see answers or the winner list in the feed before they see the moment on screen. For interaction-heavy events, either reduce playback delay to match the interaction, or display chat, poll results, and draw announcements on program time rather than on the moment the server received them, so the interaction clock follows the media clock."
  - q: "What rules apply to prize draws in an enterprise live stream?"
    a: "Internal training tokens or souvenirs should still have published rules and an auditable process. If the draw is used to promote a product, attract customers, or gain a competitive advantage, it falls under China's Interim Provisions on Regulating Promotional Activities: before the draw you must clearly publish the prize tiers, entry and redemption terms, quantities or winning odds, and other required details; you must not invent prizes or pre-select winners; the top prize in a chance-based draw may not exceed 50,000 yuan; and you should keep records of the rules and redemptions for two years."
  - q: "Should chat and polls be kept in the replay?"
    a: "Quiz results, selected Q&A, and the prize-draw rules are useful in the on-demand version for people who missed the live event. A full chat replay is often too noisy; offer highlights or leave it out by default. Whatever you keep, do not inherit the live event's public visibility by default, and check for personal information that should not be republished."
sources:
  - title: "RFC 6455: The WebSocket Protocol"
    url: https://www.rfc-editor.org/rfc/rfc6455
  - title: "HTML Living Standard: Server-sent events (WHATWG)"
    url: https://html.spec.whatwg.org/multipage/server-sent-events.html
  - title: "Web Content Accessibility Guidelines (WCAG) 2.2, W3C"
    url: https://www.w3.org/TR/WCAG22/
  - title: "Interim Provisions on Regulating Promotional Activities (SAMR Order No. 32) (Chinese Government Gazette)"
    url: https://www.gov.cn/gongbao/content/2020/content_5567756.htm
  - title: "Personal Information Protection Law of the People's Republic of China (Cyberspace Administration of China)"
    url: https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm
related: [corporate-training-live, b2b-webinar-lead-funnel, live-latency-protocols, live-to-vod-workflow]
---

Interaction in an enterprise live stream is often treated as a switch you simply turn on: the chat room is open by default, and a prize draw is dropped in near the end. Then the public feed drowns out the speaker, or the winning names appear in chat while the video is still on the countdown. Start with a different question: what is interaction supposed to accomplish in this event?

> The value of interaction is not how many tools you offer, but how tightly they are bound to the agenda, the delay, permissions, and the replay. Decide the purpose first, pick the tools second, and only then worry about whether the room feels lively.

## 1. Let the scenario decide what interaction must do

The same bundle of chat, polls, and a prize draw should not be copied from one event to the next.

| Scenario | What interaction is for | Capabilities that matter more |
|---|---|---|
| Corporate training | Confirm understanding; keep attendance and quiz records | Check-in, in-session quizzes, Q&A that can be saved |
| B2B webinar | Collect real questions and intent signals | A separate Q&A queue, profile polls, behavioral records |
| Marketing or a launch | Energy and conversion | Published rules, sync with the picture, redemption records |

In training, interaction is part of the teaching rhythm, with questions or short quizzes at intervals; the operational flow is in [corporate training live streams](/en/articles/corporate-training-live/). In a demand-generation webinar, interaction is more of a lead signal; see [the B2B webinar lead funnel](/en/articles/b2b-webinar-lead-funnel/). The rest of this article breaks the capabilities down, rather than retelling those event timelines.

## 2. Chat: a real-time channel you can moderate, aligned with delay

Chat is the easiest feature to turn on and the easiest to lose control of. Agree on at least four things in the design.

**Identity.** For internal training, prefer signed-in identities and show a real name or employee ID, so attendance and follow-up are possible. External events can use nicknames, but keep a stable, hard-to-forge user identifier for muting, analytics, and prize redemption. Do not rely only on a display name that can be changed at any time.

**Moderation.** Keyword filters catch obvious ads and abuse, but not digressions, flooding, or sensitive questions. Plan for a host or teaching assistant to moderate in near real time, and provide mute, delete, and a temporary pause of the public feed. For events with tighter speech requirements, keep an audit log of who sent, hid, or deleted a message, and when.

**Align with playback delay.** This is the point most often missed. If the player is still ten or more seconds behind and chat is pushed in near real time, viewers will see answers and the winner list in the feed before the on-screen question or countdown has started. For interaction-heavy events, either bring playback delay down to a level that matches the interaction (protocol choices are covered in [live latency and protocols](/en/articles/live-latency-protocols/)), or present chat, poll results, and draw announcements on program time rather than on the moment the server received them, so the interaction clock follows the media clock.

For transport, browsers commonly use WebSocket (RFC 6455) as a bidirectional channel, or Server-Sent Events for a one-way push from the server. Either way, handle reconnects, deduplication, and ordering, so a viewer on a weak network does not see a burst of stale messages after coming back.

## 3. Q&A: a workable queue, taken out of the public feed

The public feed is for short reactions, not for questions that deserve a careful answer. A separate queue is what lets a host do the job:

- Keep questions out of chat, so a useful item is not buried by a flood of messages.
- Allow upvotes or merging of similar questions, and pass the frequent ones to the speaker first.
- Support states such as answered, answer later, or answer privately.
- For internal training, an anonymous display option can help people ask awkward questions; the back office should still keep an auditable identity, which limits abuse without putting the asker on the public screen.

Q&A records should be exportable and kept in the replay. How to cut chapters and mark a Q&A segment is covered in [the live-to-VOD workflow](/en/articles/live-to-vod-workflow/). If a webinar ends with a recording and no question list, you have thrown away some of the most valuable audience signal.

## 4. Polls, quizzes, and check-in: lock the rules before you show results

Polls collect attitudes or a profile, quizzes test understanding, and check-in records attendance. Do not hang all three on one button.

Before you start, write down who may take part (must they be playing, and is it once per person), when it closes, and whether results are shown live. Showing a running tally during a poll encourages herding; a pre-training pulse or a question that needs a more independent view is better published after the close. For a quiz, reveal the answer after the speaker has covered the point, and allow the result to be tied to a replay chapter.

Check-in should not only prove that a page was opened. If the goal is to confirm that people are watching, combine it with playback heartbeats or a second confirmation at a key moment. A single tap at the start measures arrivals, not completion.

Interactive controls also need keyboard access, a visible focus, and enough contrast. WCAG 2.2 is explicit about form labels, focus visibility, and target size. Polls and question boxes are ordinary interactive components; they should not work only with a mouse.

## 5. Prize draws: separate internal rewards from public prize promotions

Points or souvenirs in internal training are usually employee incentives; the rules should still be published in advance and the process should be auditable. Once a draw is used to promote a product, attract customers, or gain a competitive advantage, it falls under what China's Interim Provisions on Regulating Promotional Activities call a prize promotion.

Those provisions require the operator, before the promotion, to clearly publish the prize tiers, entry conditions and methods, draw time and method, cash amounts or prize prices, prize names and quantities or winning odds, redemption time, conditions and methods, forfeiture conditions, and the organizer's contact details, and not to change them or add terms that make redemption harder, except where the change helps the consumer. Operators must not invent prizes or deliberately let predetermined people win. The top prize in a chance-based draw may not exceed 50,000 yuan. Operators should also keep files that accurately record the rules, the public notices, and the redemption results, retain them for two years, and make them available for lawful inspection.

In the live product, that means:

- Eligibility must be verifiable, for example "still playing at the moment of the draw," not merely "once registered."
- The result should appear on the delay-aligned picture and in the public feed at the same time, so chat does not spoil it.
- The winner list, redemption evidence, and the rule text should be exportable. They should not live only in that evening's chat.

## 6. Three engineering agreements to make before you go live

**The interaction clock and the media clock.** Every "draw now" or "lock the poll" action needs a defined time base: server time, the speaker's console, or the program time already presented on the viewer's player.

**What interaction belongs in the replay.** Quizzes, selected Q&A, and prize-draw rules belong in the on-demand version. A full chat log is often too noisy; offer highlights or leave it off. Do not inherit the live event's public visibility by default.

**Personal information and retention.** Nicknames, user identifiers, and chat content are personal information under the Personal Information Protection Law when they can identify a particular person. State the purpose, scope, and retention period before you collect them, and delete or anonymize them after the event as agreed. Do not keep them in logs indefinitely.

Interaction is not decoration. Write purpose, delay, moderation, replay, and compliance into the plan, then turn on the matching switches. The room can be lively and still stand up to a later review.
