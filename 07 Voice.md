# 07 Voice

Speech in and speech out for personal assistants. Sources: Fractal's academia 3.17; Ruby's `docs\RESEARCH.md`,
`docs\VOICE_SHORTLIST.md` and `Ruby voice\README.md`; the phone-voice training of 9–10 Nov 2026
(`E:\Fractal AI project\runtime\experiments\2026-11-09\ruby_phone_voice\`).

**A limit worth stating:** the AI doing this work cannot hear audio. Every quality claim below is either a measurement
(pitch, melody span, Whisper transcription, timing) or the user's own judgement by ear.

---

## 1. Speech to text

- **whisper.cpp on the CPU:** small.en takes about 3 s per clip in English.
- **For other languages,** large-v3-turbo is needed: Spanish/French word error 0 % vs **58 %** with small.en.
- **Streaming ears and turn-taking** (not yet measured): Silero VAD (start and stop of speech), Smart Turn v3 (has the
  speaker *finished* or only paused?), Moonshine streaming (transcribes while you speak).
- **Put known names back before the model reads the words** (Ruby, 11 Nov 2026; **Built**, phrase-tested, not yet
  measured on real speech). A phone's recogniser splits names it doesn't know ("tail scale", "wire guard"), and a
  small model then answers about tails. The assistant already holds the right spellings (facts about the user, the
  installed apps), so two or three words whose letters spell a known name are joined first. Guards that mattered:
  never change a single word; allow one letter out only for long names; join app names only where an app is meant
  ("take one note" is not OneNote); log every change. Fractal academia 3.32.

**How we know.**
- small.en about 3 s a clip; large-v3-turbo 0 % against 58 % word error for Spanish/French: our measurement, Fractal academia 3.17. Result file not kept.
- Silero VAD, Smart Turn v3, Moonshine streaming: outside source, "Voice models on Hugging Face/PyPI: Kokoro, Silero VAD, Smart Turn v3, Moonshine, Qwen3-TTS, Chatterbox Turbo, Breeze TTS 2, CosyVoice2, OmniVoice, Kyutai TTS, Parakeet" (S). Not measured here.
- Putting known names back: our build, Fractal academia 3.32. Phrase-tested only; not measured on real speech.

**Proof.**
- Code: `Ruby\app\android\page_app.js`
- Results: phrase tests `Fractal\runtime\experiments\tests\ruby_rules_unit.js`
- Check it yourself: `node Fractal\runtime\experiments\tests\ruby_rules_unit.js`
- Not kept: the clips and transcripts behind the 3 s and 58 % figures.

**The idea behind it:** [Speech synthesis and the latency budget](file:///E:/AI%20academia/Study%20hub.html#voice)


## 2. The latency budget

- **Measured:** a non-streaming voice reply took about **27 s to first sound**, 77 % of it the text-to-speech (about 21 s of 27; corrected 24 Nov: was ~90 %).
- Streaming every stage at once (ears, model and voice running together) is what gets a reply under ~0.5 s; run them
  one after another and it's several seconds.
- **"Two speeds" architecture:** a small, fast **interaction model** keeps the conversation going and handles the UI,
  while a big model does reasoning in the background.
  - Thinking Machines' "interaction models" (May 2026, press coverage): full duplex, ~200 ms micro-turns, a claimed
    ~0.4 s response.
  - Kyutai Unmute: streaming STT and TTS around any text LLM; claims under 1 s, third parties report 0.4–0.75 s; needs a
    16 GB CUDA card and Linux.
  - Pipecat and LiveKit Agents run STT, LLM and TTS as concurrent streams with interruption handling.
  - Huw Prosser's JARVIS (his blog, 12 May 2026): 3 offline models trained on synthetic data, namely a small, heavily
    RL'ed interaction model, a slow but smart large model and a fast TTS, all on a MacBook Pro M1 32 GB. It took him
    years.
- **Run time on this PC:** Qwen3-TTS 1.7B through `llama-tts` on the CPU takes ~11 s for 6 s of audio, or ~3 s a
  sentence on the GPU, and ~12–15 s when the 27B fills the GPU. Speaking in pieces (make the next while one plays)
  hides some of it.

**How we know.**
- About 27 s to first sound, 77 % of it the voice (four questions: 17–36 s to first sound, the voice 72–80 % of each): our measurement, `Fractal\runtime\experiments\2026-11-08\ruby_phase0_results.json` (`tts_first_piece_s` against `today_first_sound_s`), script `Fractal\runtime\experiments\2026-11-08\ruby_phase0.py`; also in `Ruby\docs\RESEARCH.md` (open item 1) and `Ruby\docs\VOICE_SHORTLIST.md` ("Phase 0"). Corrected 24 Nov: was ~90 % and "result file not kept".
- Streaming every stage gets under ~0.5 s; Pipecat and LiveKit run stages as concurrent streams; Unmute's claims and third-party 0.4–0.75 s: outside sources, "Kyutai Unmute; Pipecat; LiveKit Agents (turn detection)" (S) and "BentoML, Picovoice and findskill.ai TTS round-ups; channel.tel latency budget" (S).
- Interaction models, ~200 ms micro-turns, ~0.4 s: outside source, "Thinking Machines "interaction models" (press coverage)" (S).
- JARVIS, three offline models on an M1: outside source, "Huw Prosser, "Some thoughts on JARVIS" (huwprosser.com, 12 May 2026), Rose reels" (R).
- Qwen3-TTS 1.7B on the CPU ~11 s for 6 s of audio: our measurement, Fractal academia 3.17. The ~3 s a sentence on the GPU and 12–15 s beside the 27B: source not recorded (not found in any project record). Result files not kept.

**Proof.**
- Not kept: the timing runs behind 11 s, 3 s and 12–15 s (the 27 s is in `ruby_phase0_results.json`); the numbers are from the records named above.

**The idea behind it:** [Speech synthesis and the latency budget](file:///E:/AI%20academia/Study%20hub.html#voice)


## 3. Text-to-speech landscape (claims, Nov 2026)

| Model | Licence | Claimed speed | Note |
|---|---|---|---|
| Qwen3-TTS (0.6B/1.7B; VoiceDesign, CustomVoice, Base) | Apache-2.0 | ~97 ms streaming | Designs a voice from a written description |
| Breeze TTS 2 (3B) | Weights and outputs **non-commercial** | < 40 ms on an H100 | Reported #1 open-weight; Linux, ~7.7–14.4 GB VRAM |
| Chatterbox Turbo (Resemble) | MIT | ~75 ms | Adds an inaudible watermark; pins an old torch |
| Kokoro 82M | Apache-2.0 | ~3.7 s to first audio on CPU (Picovoice test) | Tiny; can sit beside a big model |
| CosyVoice2 0.5B | Apache-2.0 | ~150 ms streaming | Hard to install on Windows |
| OmniVoice (k2-fsa) | Code Apache-2.0, weights **CC-BY-NC** | — | VoiceStudio's default |
| Fish Audio S2, Voxtral 4B | Non-commercial | — | Left out |
| Kyutai TTS / Pocket TTS | CC-BY-4.0 | Pocket ~1.7 s first audio on CPU | Pocket is made for CPUs |

The speed figures use different definitions and hardware. **Measure time to first audio yourself**, with the model
loaded, on your own card, beside whatever else must stay loaded.

**How we know.**
- Every row is a maker's or reviewer's claim, not our measurement: "Voice models on Hugging Face/PyPI: Kokoro, Silero VAD, Smart Turn v3, Moonshine, Qwen3-TTS, Chatterbox Turbo, Breeze TTS 2, CosyVoice2, OmniVoice, Kyutai TTS, Parakeet" (S, speeds C); "BentoML, Picovoice and findskill.ai TTS round-ups; channel.tel latency budget" (S) for Kokoro's 3.7 s; "Kyutai Pocket TTS README; tts-bench (5uck1ess.github.io); Picovoice TTS benchmark" (S) for Pocket.
- OmniVoice as VoiceStudio's default: "VoiceStudio (debpalash/VoiceStudio)" (S).
- Breeze TTS 2's licence, size and VRAM: our reading of its model page, `Ruby\docs\VOICE_SHORTLIST.md` ("checked 8 Nov").
- Fish Audio S2 and Voxtral 4B: source not recorded (not in References.md).

**Proof.**
- Results: `Ruby\docs\VOICE_SHORTLIST.md`, `Ruby\docs\RESEARCH.md` (the shortlist this table was drawn from)

**The idea behind it:** [Speech synthesis and the latency budget](file:///E:/AI%20academia/Study%20hub.html#voice)


## 4. Designing a voice from words (no cloning)

**Measured with Qwen3-TTS VoiceDesign plus a Base model that copies a reference clip:**
- **Design gives character; the reference clip decides delivery.** The everyday voice copies whatever reference it is
  given, *including how it was read*. A neutral 13 s reading gives a flat voice (~6.7 semitones per phrase). A
  **performed** reference (the waking-up lines) lifts the melody to **8.4–10.6 semitones**, which is the target band.
- **Pitch can't be pinned by the reference or by prompts.** The same reference and sentence gave 174–194 Hz across
  three runs, because the model samples its pitch. Prompt experiments carried only 0–70 % of a requested shift.
- **Hold the register after synthesis instead:** measure each utterance's median pitch and shift it onto a target with
  TD-PSOLA, keeping formants. Measured: **173.9–194.3 Hz before, 196.7–198.3 Hz after**, ~0.2 s per sentence, and
  skipped when already within 0.15 semitones.
- **Both are needed:** the reference gives movement and the lock gives register. With both, three designed voices sat
  at 198–200 Hz and 8.4–10.6 semitones.
- **Measure a target from a reference performance as numbers only,** without keeping the audio: one reel's
  "waking up" reply opened ~210 Hz, dipped to ~155 and ended ~200; phrases fell ~8–10 semitones.
- **Built-in OS voices make bad references.** Windows' UK voices aren't natural, and a clone inherited that.
- **Check by transcription:** every tuned clip was transcribed back with Whisper word for word.
- **Speed:** designing on the CPU takes 28–95 s for 5–13 s of audio; cloning a reference with the Base model, 9–19 s.

**How we know.**
- All figures are our measurements (Fractal academia 3.17), written up in `Ruby\Ruby voice\README.md` and `Ruby\docs\VOICE_SHORTLIST.md`:
  - neutral 6.7 semitones against performed 8.4–10.6, and 198–200 Hz with both: `Ruby\Ruby voice\README.md`;
  - 174–194 Hz across three runs, prompts carrying 0–70 %, and the pitch lock 173.9–194.3 Hz before, 196.7–198.3 Hz after, ~0.2 s, 0.15 semitones: `Ruby\docs\VOICE_SHORTLIST.md`;
  - the reel's reply ~210 Hz, ~155, ~200: `Ruby\docs\VOICE_SHORTLIST.md` (numbers only, no audio kept);
  - 28–95 s designing on the CPU: `Ruby\docs\VOICE_SHORTLIST.md`. The 9–19 s for cloning: source not recorded.
- Whisper read-back and the Windows-voice failure: Fractal academia 3.17; result files not kept.

**Proof.**
- Code: `Fractal\fractal\ruby\rubyvoice.py` (`pitch_lock`)
- Results: the three designed voices, `Ruby\Ruby voice\d1`, `Ruby\Ruby voice\d2`, `Ruby\Ruby voice\d3`
- Not kept: per-clip pitch measurements as data files; the figures live in the two documents above.

**The idea behind it:** [Speech synthesis and the latency budget](file:///E:/AI%20academia/Study%20hub.html#voice)


## 5. Licences and consent

- **Never clone a real person's voice without their permission,** including voices from creators' videos. Measuring a
  delivery's pitch and pace as numbers is fine; collecting the audio to copy is not.
- **A voice derived from a non-commercial model's output is non-commercial too.** A blend built from a Breeze demo
  clip is for personal use only; a voice designed from words with Apache-2.0 Qwen3-TTS is safe to use commercially.
- **Read the weights' licence, not just the code's.** Several projects pair Apache-2.0 code with non-commercial
  weights (OmniVoice, Breeze).

**How we know.**
- Never cloning a real voice without permission, and measuring a delivery as numbers only: the project's own rule (decision); date and the user's words not recorded here. Applied in `Ruby\docs\VOICE_SHORTLIST.md` (the reel measured as numbers).
- Licences of OmniVoice and Breeze (non-commercial weights) and Qwen3-TTS (Apache-2.0): outside sources, "Voice models on Hugging Face/PyPI: Kokoro, Silero VAD, Smart Turn v3, Moonshine, Qwen3-TTS, Chatterbox Turbo, Breeze TTS 2, CosyVoice2, OmniVoice, Kyutai TTS, Parakeet" (S) and "VoiceStudio (debpalash/VoiceStudio)" (S); Breeze checked in `Ruby\docs\VOICE_SHORTLIST.md`.
- That a voice derived from non-commercial output stays non-commercial: our reading of those licences; not legal advice, source not recorded beyond them.

**The idea behind it:** none of the listed techniques; read the weights' licence and keep consent before any voice is copied.


## 6. Training a small on-device voice (in progress, 10 Nov 2026)

**Goal:** the phone speaks in the user's chosen designed voice ("d1") with no PC, using a small Piper (VITS) voice
fine-tuned from a stock English voice ("Cori").

**Data pipeline, measured:**
- **2,041 lines** spoken by the designed voice on the PC (the teacher), each held to 200 Hz by the pitch lock.
- **Whisper filter:** 11 clips dropped for wrong words.
- **Speaking-rate filter:** 81 clips dropped as too fast or too slow.
- **Kept: 1,950 clips, 2.48 h.** A spot-check of 25 kept clips found the pitch steady at about 200 Hz; across all kept clips `prep_report.json` gives a median of 180 Hz (10th–90th 164–207 Hz) (corrected 24 Nov: the 200 Hz stood alone).
- An earlier test run of 286 clips dropped 13 (1 wrong words, 12 odd rate).
- This is the voice version of distillation (06, section 4): a big model teaches a small one by example.

**Training, partial results:**
- **1,000 rounds** planned at ~28 s per round, pausing while the GPU is used for games.
- After **49 rounds** the voice already sat about halfway between the stock voice and the teacher, at **195 Hz**, with
  Whisper understanding **97 %** of words.
- The error score on held-out teacher clips kept falling.
- **Release gate:** the full measurement plus the user's blind listening test. The results will be added here.

**How we know.**
- 2,041 lines, 11 dropped for words, 81 for rate, 1,950 kept, 2.48 h: our measurement, in `E:\Fractal AI project\runtime\experiments\2026-11-09\ruby_phone_voice\prep_report.json` (it matches).
- The 25-clip spot-check at ~200 Hz and the 286-clip test run: source not recorded (not found in a kept file). Note `prep_report.json` gives the kept clips' median as 180 Hz (10th–90th 164–207 Hz), not 200 Hz.
- 49 rounds, 195 Hz, 97 % words: measured during training; not in any project record, only in this file's earlier copy. Training logs kept (below).
- Fine-tuning a Piper voice: outside source, "Piper (piper1-gpl) training docs" (R).
- What happened next: Ruby academia 3.4–3.6.

**Proof.**
- Results: `E:\Fractal AI project\runtime\experiments\2026-11-09\ruby_phone_voice\prep_report.json`, training logs `E:\Fractal AI project\runtime\experiments\2026-11-09\ruby_phone_voice\runs\d1lock\train.log` and `runner.log` in the same folder
- Code: `E:\Fractal AI project\runtime\experiments\2026-11-09\ruby_phone_voice\prep.py`, `piper_fit.py`, `train_runner.py` (same folder)
- Not kept: the release-gate listening test (never run here).

**The idea behind it:** [Distillation into a small model](file:///E:/AI%20academia/Study%20hub.html#distill), [Speech synthesis and the latency budget](file:///E:/AI%20academia/Study%20hub.html#voice)


## 7a. Conversation speed: how others solve it, and the mistake made here (22 Nov 2026)

**In short:** working voice systems get fast first sound by streaming. They keep the voice model loaded, feed it one
sentence at a time and play the first chunk while the rest is made. Here the speed problem was instead "solved" twice
by copying an expressive voice into a small Piper student (Fractal academia 3.66, Odysseus academia 3.12). The user
judged Odysseus's copy "very poor". Stop making Piper students of expressive voices.

**Why the copy failed.**
- **The slowness wasn't the voice model.** Chatterbox through the `llama-tts` command line loads the model (~1 s) and
  reads the reference (~1 s) for every line, then makes the whole line before any sound. That's how 9.5 s for a 3.3 s
  line happened, not the model's own speed (Resemble claims ~75 ms first audio on a GPU; one listing says ~470 ms).
- **A small Piper (VITS) voice can't carry drama.** It is non-autoregressive and small, and the literature links
  both to flat prosody (StyleTTS-ZS; arXiv 2603.24116). Odysseus's copy had 1.8 h of lines and Piper's own warning:
  only ~34 vocoder passes where ~150 are wanted. The swells and pauses the user picked X for are exactly what it loses.
- **Nobody listened early.** Epoch 49 was ready at 13:11; the first listen came after about 13 hours of CPU and card
  time. A 10-minute blind check at epoch 49 would have stopped it (the "prove quality first" rule).

**What working systems do** (practitioner reports and vendor claims; measure on this PC before trusting any number):

1. **Stream the model's reply in sentences.** Flush each finished sentence to the voice (Pipecat's
   SentenceAggregator; the Rust `adk-audio` chunker). One report: the model's share of first audio fell from ~1,100 ms
   to ~250 ms.
2. **Keep the voice loaded and warm.** One report: first chunk ~480 ms to ~90 ms after warming the connection.
3. **Use a voice built to stream** (first chunk, not the whole line):

| Voice | Copies a reference | Where | First audio (claimed) | Licence |
|---|---|---|---|---|
| Qwen3-TTS 1.7B | Yes (3 s) | GPU | ~97-150 ms (Alibaba's report) | Apache-2.0 |
| CosyVoice 3 | Yes | GPU | ~150 ms | Apache-2.0 |
| Chatterbox Turbo (350M) | Yes | GPU | ~75 ms (vendor) / ~470 ms (a listing) | MIT |
| Kyutai Pocket TTS (100M) | Yes (gated weights) | **CPU, 2 cores** | ~200 ms (README) | CC-BY-4.0 |
| NeuTTS Air (0.7B, GGUF) | Yes (3 s) | CPU | ~2.4x real time on a Ryzen 9 HX 370 | check before use |
| Kokoro 82M | No | CPU/GPU | ~300 ms GPU, < 1 s M3 CPU | Apache-2.0 |

4. **Skip thinking on conversational turns.** One local assistant reports ~5x faster first text.

**What this means on this PC.** The card holds Fractal's 27B, so a voice runs on the CPU unless the MoE move (Fractal
academia 3.70) frees room.
- **Pocket TTS is the CPU candidate that copies a voice, and it's already on disk.** Measured 21 Nov:
  - reads the text in ~0.1 s;
  - 11-21 ms per audio step;
  - 3.4-4.5x real time;
  - as a loaded server, ~0.2 s to first sound (estimated, not measured end to end).
  - Copying X needs the gated weights: the user's Hugging Face account and Kyutai's terms, the user's decision.
    Unofficial ungated mirrors exist; don't use them.
- **Chatterbox kept loaded and streaming** keeps X exactly. Measure whether its first chunk on the CPU, for a short
  first phrase, fits in ~1-2 s, or whether its ~0.7 GB fits on the card beside the model.

**Measured the same night (Odysseus academia 3.13):** Pocket TTS 3.3.0, kept loaded on the Ryzen 5 7600 and copying
voice X from its reference clip, starts in **0.078-0.101 s**. A 6-12 s line is fully made in 0.7-1.6 s. Whisper
reads all six lines back right. One catch: the default 50-token chunk cut a 23-word line at exactly 12.0 s; 25-token
chunks fix it. **Blind listen: the user picked Chatterbox X over it.** Fast and accurate is not enough when the voice
was chosen for its delivery; the copy must sound like the pick.

**Chatterbox Turbo itself, measured (Odysseus academia 3.14).**

| | CPU (Ryzen 5 7600) | Card (RTX 5070 Ti) |
|---|---|---|
| Speed against real time | 0.67x: slower than it plays, mostly the vocoder; ruled out for conversation | 6-8.6x |
| Short phrase | 3.0 s | 0.47 s |
| 8.7 s line | — | 1.05 s |
| Card memory | — | 2.4 GB at `-c 2048` |

- Reading the reference clip costs 3-4 s per run, so a runner must stay loaded and keep it.
- The card's speed comes only with that kept-loaded runner, and it has to share the card with the chat model.
- **Built (Odysseus academia 3.15):** `llama-tts-serve`, the runner kept loaded, with the speaker encode cached.
  - Whole lines in 0.49-1.01 s; short phrases in 0.19-0.20 s.
  - About 2.5 GB of card memory.
  - It fits beside gpt-oss-20b at 32K if it loads first, because llama-server's `fit` then takes what's left.

**Rule from this:**
- Before training anything for speed, measure where the time goes: loading, prompt, whole-line versus first-chunk.
- Try streaming and keeping the model loaded first.
- If a smaller voice is still needed, blind-check the first saved round before letting the rest run.

Sources: [Cekura open-source TTS 2026](https://www.cekura.ai/blogs/open-source-tts),
[Fora Soft streaming TTS](https://www.forasoft.com/learn/ai-for-video-engineering/articles-ai/streaming-tts-kokoro-elevenlabs-turbo-openai-tts),
[Qwen3-TTS report](https://arxiv.org/pdf/2601.15621), [Resemble Chatterbox Turbo](https://www.resemble.ai/learn/models/chatterbox-turbo),
[Picovoice Chatterbox Turbo benchmark](https://picovoice.ai/docs/benchmark/tts-chatterbox-tts-turbo/),
[Pocket TTS](https://github.com/kyutai-labs/pocket-tts), [Pocket TTS review](https://dev.to/andrew-ooo/pocket-tts-review-kyutais-100m-cpu-voice-cloner-2026-40lb),
[NeuTTS Air](https://github.com/neuphonic/neuTTS), [sentence streaming](https://dev.to/toddsullivan/i-made-my-voice-agent-feel-faster-by-streaming-sentences-not-audio-4jej),
[two seconds of silence](https://dev.to/realmarcuschen/the-caller-heard-silence-for-two-seconds-before-the-agent-spoke-21m1),
[cascaded voice agents (arXiv 2603.05413)](https://arxiv.org/html/2603.05413), [StyleTTS-ZS](https://arxiv.org/html/2409.10058v1).

**How we know.**
- The failed Piper copy, the user's "very poor", the 13 hours before a listen: Odysseus academia 3.12 (with Fractal academia 3.66 for Fractal's own copy). Results `Fractal\runtime\experiments\2026-11-22\odysseus_fast\timing_final.json`.
- 9.5 s for a 3.3 s line through `llama-tts`: Odysseus academia 3.14–3.15.
- Pocket TTS on 21 Nov (0.1 s, 11–21 ms a step, 3.4–4.5x): Fractal academia 3.66; result files not kept beyond two stock clips in `Fractal\runtime\experiments\2026-11-21\voice_pocket`.
- Pocket TTS kept loaded, 0.078–0.101 s, 25-token chunks, the blind pick: Odysseus academia 3.13; `Fractal\runtime\experiments\2026-11-22\odysseus_pocket\timing.json`.
- Chatterbox on CPU and card (0.67x, 6–8.6x, 2.4 GB): Odysseus academia 3.14; logs `Fractal\runtime\experiments\2026-11-22\odysseus_chatter\gpu\c2048.log` and `mem.log` in that folder.
- `llama-tts-serve`, 0.49–1.01 s, 0.19–0.20 s, ~2.5 GB: Odysseus academia 3.15; `Fractal\runtime\experiments\2026-11-22\odysseus_chatter\serve\serve.log`.
- What working systems do, the voice table and the first-audio claims: outside sources "Kyutai Unmute; Pipecat; LiveKit Agents (turn detection)" (S), "Voice models on Hugging Face/PyPI: ..." (S, speeds C), "Kyutai Pocket TTS README; tts-bench (5uck1ess.github.io); Picovoice TTS benchmark" (S), "BentoML, Picovoice and findskill.ai TTS round-ups; channel.tel latency budget" (S). Cekura, Fora Soft, the Qwen3-TTS report, NeuTTS Air, the dev.to posts, StyleTTS-ZS and arXiv 2603.24116 / 2603.05413 are linked in the section's own Sources line but are not in References.md.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-22\odysseus_pocket\timing.json`, `Fractal\runtime\experiments\2026-11-22\odysseus_chatter\serve\serve.log`, `Fractal\runtime\experiments\2026-11-22\odysseus_fast\timing_final.json`
- Code: `Fractal\runtime\llama-src\tools\tts\tts-serve.cpp`
- Not kept: the 21 Nov Pocket timings (only the numbers in Fractal academia 3.66).

**The idea behind it:** [Speech synthesis and the latency budget](file:///E:/AI%20academia/Study%20hub.html#voice), [Distillation into a small model](file:///E:/AI%20academia/Study%20hub.html#distill)


## 7. The test, the same for every voice

1. **Speed:** time to first audio and real-time factor for 6 fixed sentences, loaded, on the target hardware.
2. **Memory:** VRAM and RAM while loaded.
3. **Blind listening:** the same 6 sentences (plain; a number and a name; a long sentence; amused; a touch of sass;
   concerned), unlabelled and shuffled; rank first, reveal names after.
4. **Then the full loop:** end of the user's speech to first sound, against the target (≤ 0.8 s).

**How we know.**
- A method, not a result. The ≤ 0.8 s target: the user's goal in `Ruby\docs\VOICE_SHORTLIST.md` ("first sound ≤ 0.8 s after you stop speaking").
- Used as written in Odysseus academia 3.13–3.14 (six fixed lines, loaded, blind pick).

**The idea behind it:** [Speech synthesis and the latency budget](file:///E:/AI%20academia/Study%20hub.html#voice)

