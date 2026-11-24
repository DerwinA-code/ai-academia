# 08 Vision, OCR and media

Seeing screens and documents, and making pictures and video, on one consumer card. Sources: Fractal's academia 3.10,
3.15, 3.17; GrindPilot's learning, live testing and review.

---

## 1. Give vision models the OCR text too

- **Vision models misread exact characters:** paths, error codes, numbers.
- **The OS's own OCR is fast and free.** Windows' `Windows.Media.Ocr` and `Windows.Data.Pdf` (through PowerShell WinRT)
  need no download: ~0.5 s per screenshot, ~0.8 s per PDF page. Upscale small images (to 2,400 px wide, at most 3×) and
  cache the results.
- **Attached pictures reach the model as the picture plus its OCR text.**
- **Limits:** handwriting and complex layouts need a dedicated document-OCR model.
- **For comparison:** a full-screen RapidOCR pass took 5–8 s per picture in GrindPilot, and 0.68 s on a small
  simulated 960×540 frame.
- **Fast but not accurate enough to replace a real OCR model; good enough to confirm** (GrindPilot, 11 Nov 2026;
  **Measured**, 120 rendered game screens, 18 fonts, fixed seed). Called in-process through the `winrt` bindings,
  Windows OCR took **0.042 s** a frame against 0.65 s for RapidOCR, but read **72.5 %** of titles against
  **96.7 %**. It misses low-contrast text outright, and enlarging doesn't help. A Windows-first reader with
  RapidOCR as fallback got 91.7 %: still worse.
  - **What works is a reader that may only confirm.** Windows checks whether a known screen's title words are
    there. A "no" goes to RapidOCR, as does any more specific screen and every full-screen read (claims, the
    spending guard). Screen accuracy stayed **96.9 %** with 0 unknown screens misnamed, and time per look fell
    0.52 → 0.29 s. A confirmed look took **0.015 s, ~35× faster**.
  - **General rule:** a fast, weaker checker is safe where it can only say "yes, the expected thing is here" and
    the strong one keeps every "no".
  - **Trap:** `winrt` ships an older `msvcp140.dll`. Loaded before onnxruntime, it breaks RapidOCR for the whole
    process. Load onnxruntime first.
  - Project record: GrindPilot documentary chapter 16.

**How we know.**
- Windows OCR ~0.5 s a screenshot, ~0.8 s a PDF page, upscaling and caching, pictures sent with their OCR text: our build and measurement, Fractal academia 3.15. Result file not kept. API facts: outside source, "Microsoft Docs: `Windows.Media.Ocr`, `Windows.Data.Pdf`, DPAPI" (R).
- Vision models misreading exact characters: source not recorded beyond Fractal academia 3.15's reason for building OCR.
- RapidOCR 0.68 s on a 960×540 frame: GrindPilot, `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\11 The exam.md`. The 5–8 s full-screen figure: source not found in the GrindPilot documents.
- Windows OCR 0.042 s against 0.65 s, 72.5 % against 96.7 %, the confirm-only reader (96.9 %, 0.52 → 0.29 s, 0.015 s) and the `msvcp140.dll` trap: GrindPilot chapter 16, `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\16 A fast second reader - Windows OCR.md`; summarised in `E:\AI academia\GrindPilot - an evidence-driven agent that learns to play games from the screen.md`; outside listing "GrindPilot documentary (8 Nov 2026) and Fractal's review of it" (R).

**Proof.**
- Code: `Fractal\fractal\ocr.py`
- Results: `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\16 A fast second reader - Windows OCR.md` (the 120-screen tables)

**The idea behind it:** none of the listed techniques; a fast, weaker checker may only confirm, and the strong reader keeps every "no".


## 2. Vision projector placement

On a full 16 GB card, the vision projector on the GPU forced the main model's context down to 12K and speed to
38 tok/s. **On the CPU, the main model kept 47–50 tok/s.** Adopted: CPU vision.

**How we know.**
- GPU projector forced 12K and 38 tok/s; CPU kept 47–50 tok/s; CPU adopted: our measurement, Fractal academia 3.10 (its table). Result file not kept.

**Proof.**
- Not kept: the speed runs; the numbers are from Fractal academia 3.10.

**The idea behind it:** [Quantisation and the VRAM budget](file:///E:/AI%20academia/Study%20hub.html#vram)


## 3. Reading game and app screens (GrindPilot)

- **Recognise a screen by its title:** OCR boxes in the top 17 % of the screen, 3–30 real letters, not numbers, timers,
  IDs or levels, not in the currency corner; biggest first, at most 2.
- **Screens without a title** (an open world) are recognised by stable HUD pixels instead (a template match at 0.72).
- **Moving UI defeats position memory.** A scrolling carousel produced "DO", "DOL", "DOU" at new spots each time. Skip
  non-word fragments under 4 letters and try each label at most twice per screen.
- **OCR reads the background art too** ("CoflerMadte" from a "Coffee Mate" sign). Rank candidates by "is this the UI's
  own vocabulary?".
- **Tutorial overlays:** "tap the highlighted button" means finding the brightest compact non-text spot on a dimmed
  screen, nearest the hint.
- **Red "new" dots:** a small filled red blob whose surrounding ring isn't red, so artwork doesn't count.
- **Skip near-duplicate frames before OCR** using cheap 160×90 signatures.
- **Encrypted game files give little:** mining them found API names, random bytes and licence text. Filter hard and
  report honestly.

**How we know.**
- All points are GrindPilot's findings on real games, from its record `E:\AI academia\GrindPilot - an evidence-driven agent that learns to play games from the screen.md` (sections 4.1, 6.5, 8.3, 8.4, Appendix A) and its documents in `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\`:
  - top 17 %, 3–30 letters, template match at 0.72: `04 Learning and goals.md`;
  - "DO", "DOL", "DOU" and "CoflerMadte": record section 8.3;
  - tutorial overlays (brightest spot): `06 Live testing and lessons.md`;
  - red dots: record section 8.4; 160×90 signatures: record Appendix A; encrypted files: record section 6.5.
- Outside listing: "GrindPilot documentary (8 Nov 2026) and Fractal's review of it" (R).

**Proof.**
- Results: `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\06 Live testing and lessons.md`, `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\FIELD REPORT.md`

**The idea behind it:** none of the listed techniques; recognise screens from evidence on the screen and distrust anything the UI did not write.


## 4. Pictures and video on the same card (measured)

| Job | Model | Time |
|---|---|---|
| Picture, 1024×1024 | Z-Image-Turbo (stable-diffusion.cpp) | ~30 s |
| Video, 3 s at 832×480 | Wan 2.2 TI2V 5B | ~200 s |

**Sharing the card:** unload the language models while media runs, then reload them.

**How we know.**
- Z-Image-Turbo ~30 s a picture, Wan 2.2 ~200 s for 3 s, unload and reload around media: our measurement, Fractal academia 3.17. Result files not kept (the models were deleted 9 Nov; see 6.1 for the 21 Nov re-run).

**Proof.**
- Not kept: the 9 Nov picture and video runs.

**The idea behind it:** [Quantisation and the VRAM budget](file:///E:/AI%20academia/Study%20hub.html#vram)


## 5. Privacy

- **Screen reading asks first:** the screen can show private things.
- **Test only on synthetic images,** never the user's documents (a personal PDF was once used by mistake).

**How we know.**
- Rules (decisions). The slip they came from, a personal PDF used as an OCR test: Fractal academia, Part 6 "Bugs and lessons" (the privacy-slip row). The file itself is not named or kept here.

**The idea behind it:** none of the listed techniques; test only on synthetic inputs and ask before reading the screen.


## 6. Specialist models, 21 Nov 2026 survey (not yet measured)

The user's rule: look at specialist AI for very different roles, but **keep only one that beats what we have now**,
measured on our own tests on this PC (RTX 5070 Ti 16 GB, 31 GB RAM, Ryzen 5 7600). Websites such as CanIRun.ai only
say what fits; they don't say what is better. Scores below are what blogs and model makers report, not our own.

| Role | What we have now (the bar) | Candidates that fit 16 GB | Test that decides |
|---|---|---|---|
| Pictures | nothing (Z-Image-Turbo was ~30 s a picture, deleted 9 Nov) | FLUX.2 klein 4B (Apache, also edits pictures, ~8–13 GB); Z-Image-Turbo again (6B, Apache, ~14.6 GB peak); HiDream-O1-Image (MIT, ~10 GB, top open model on one arena list) | 20 fixed prompts, blind side by side, the user picks; seconds per picture |
| Video | nothing (Wan 2.2 TI2V 5B was ~200 s for 3 s) | Wan 2.2 (Apache); LTX-2.3 FP8 (sound and picture together, community licence); HunyuanVideo 1.5 (~14 GB with offload) | the same 5 prompts, blind; minutes per clip |
| Speech to text | Whisper large-v3-turbo | Qwen3-ASR-1.7B (~5.4% WER reported); Cohere Transcribe 2B (Apache, ~5.4–5.8%); IBM Granite Speech 5.0 2B; Nemotron 3.5 Transcribe (30B-A4B, too big beside Fractal) | word error rate on synthetic lines with known text, plus time to text |
| Reading documents (OCR) | Qwen3.8-27B's own vision | GLM-OCR 0.9B (MIT); PaddleOCR-VL-1.6; LightOnOCR-2 (Apache) | synthetic pages and screens with known text: accuracy and seconds |
| Music | nothing | ACE-Step 1.5 (under 4 GB); YuE2 (~3B, GGUF, C++, under 8 GB); Stable Audio 3 (2B) | the user judges by ear |

**Sharing the card:** every one of these takes turns with Fractal (unload, run, reload), and Fractal and games keep
priority (`exam free`). A role-specialist only stays if it wins its test; otherwise it is deleted again, as on 9 Nov.

Sources: theaibench.ai/use-cases/image, vdf.ai (local image and video guides), atomic.chat local image generators,
thundercompute (image and video), insiderllm local video guide, Open ASR Leaderboard (huggingface), apidog STT
roundup, roboflow best open-source OCR, AMD ACE-Step 1.5 blog, alphasignal YuE2, canirun.ai (via tech2geek).

### 6.1 Measured, 21 Nov 2026 evening (runtime/experiments/2026-11-21/specialists)

**Speech to text.** 60 lines Ruby says (unseen by any training), spoken by three Pocket TTS stock voices, 207 s of
audio, scored as word errors after one spelling for numbers and times (`sttbench wer`). Then the same clips with steady
room noise at 5 dB. All on the CPU, where Fractal listens today. Challengers ran in transcribe.cpp v0.4.2 (one
runtime, GGUF Q8_0); today's models also in whisper.cpp as used.

| Model | Clean errors /714 | Noisy errors /714 | CPU time, 207 s of audio |
|---|---|---|---|
| Whisper small.en (today, English) | 20 | 79 | 170 s wall in whisper.cpp (90 s compute in transcribe.cpp) |
| Whisper large-v3-turbo (today, other languages) | 18 | – | 558 s wall in whisper.cpp |
| **Cohere Transcribe 2B** | 24 | **34** | 44 s |
| Parakeet TDT 0.6B v3 | 19 | 62 | **14 s** |
| Qwen3-ASR 1.7B | **17** | 69 | 83 s |
| Qwen3-ASR 0.6B | 33 | 64 | 40 s |
| Nemotron 3.5 streaming 0.6B | 41 | – | 19 s |
| Granite Speech 4.1 2B | 163 (9 clips empty) | – | 75 s |

Clean speech is a tie (17–24 errors; differences of a few words are noise on 714). **In noise Cohere makes less than
half Whisper's errors (34 vs 79)** and is about four times faster; Parakeet is the speed pick (12× faster, 62 errors).
Caveat: synthetic voices, not the user's; a check on real recordings needs the user's yes.

Note (24 Nov): the kept `Fractal\runtime\experiments\2026-11-21\specialists\stt\results.jsonl` scores 715 words and gives different counts for several rows (noisy Cohere 32, noisy whisper.cpp small.en 77; clean Cohere 32, Parakeet 22, Qwen3-ASR 1.7B 16 and 0.6B 28, Granite 165; noisy Qwen3-ASR 0.6B 62). The scoring behind this table was not kept. The finding is the same in both: in noise Cohere makes less than half Whisper small.en's errors.

**Reading pages (OCR).** 10 invented pages (notice, book page, code, receipt, table, game screen, small print, low
contrast, recipe, build log), and the same pages shrunk to half, tilted 2.5° and saved as low-quality JPEG. Character
errors out of 1,923.

| Model | Clean | Hard | Time / 10 pages |
|---|---|---|---|
| Fractal (Qwen3.8-27B vision, GPU) | **0** | 131 | 47–68 s |
| GLM-OCR 0.9B (CPU) | 7 | **121** | 97–116 s |
| LightOnOCR-2 1B (CPU, HTML tables flattened) | 1 | 152 | 46–117 s |
| PaddleOCR-VL 1.6 | did not run in this llama.cpp build (exits silently) | | |

No specialist beats Fractal: a tie on the hard set, worse on clean pages. GLM-OCR's only gain is that it reads on the
CPU while the card is busy. **Not adopted.**

**Pictures.** 12 prompts, seed 42, 1024×1024, sd.cpp master-532d2c1, Fractal's model unloaded meanwhile.
Z-Image-Turbo Q8: ~16 s a picture (was ~30 s in the older build). FLUX.2 klein 4B Q8: ~9 s, misspelled
"LATTTICE". HiDream-O1 dev fp8: ~12 s but pictures came out as speckled noise, a settings or format problem, not a
verdict. The user's blind pick between Z-Image and klein decides. FLUX.3 Image Klein (Oct 2026) is gated behind Black
Forest Labs' terms, left for the user to accept.

**How we know.**
- The survey table's candidates and scores: outside sources named in the section's own Sources line (theaibench.ai, vdf.ai, atomic.chat, thundercompute, insiderllm, Open ASR Leaderboard, apidog, roboflow, AMD ACE-Step blog, alphasignal, canirun.ai); these are not in References.md, except the speech models under "Voice models on Hugging Face/PyPI: ..." (S). Status S/C: not checked by us.
- The rule "keep only one that beats what we have": the user's, Fractal academia 3.69.
- 6.1, speech to text (60 lines, 714 words, clean and 5 dB noise, errors and times): our measurement, Fractal academia 3.69; `Fractal\runtime\experiments\2026-11-21\specialists\stt\results.jsonl` and the per-model `err_*.txt` files there.
- 6.1, OCR (10 pages, 1,923 characters, clean and hard): Fractal academia 3.69; `Fractal\runtime\experiments\2026-11-21\specialists\ocr\results.jsonl`.
- 6.1, pictures (~16 s, ~9 s, ~12 s, the noise from HiDream): Fractal academia 3.69; `Fractal\runtime\experiments\2026-11-21\specialists\image\times.txt` and `log_zimage.txt`, `log_klein4b.txt`, `log_hidream.txt` there.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-21\specialists\stt\results.jsonl`, `Fractal\runtime\experiments\2026-11-21\specialists\ocr\results.jsonl`, `Fractal\runtime\experiments\2026-11-21\specialists\image\times.txt`
- Code: `Fractal\runtime\experiments\2026-11-21\specialists\sttbench\src\main.rs`, `Fractal\runtime\experiments\2026-11-21\specialists\ocr\score.sh`
- Check it yourself: `sttbench\target\release\sttbench.exe wer stt\truth.tsv stt\hyp_cohere.tsv` (from `Fractal\runtime\experiments\2026-11-21\specialists`, no model)
- Not kept: real recordings of the user (never made; needs the user's yes).

**The idea behind it:** [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden), [Quantisation and the VRAM budget](file:///E:/AI%20academia/Study%20hub.html#vram)

