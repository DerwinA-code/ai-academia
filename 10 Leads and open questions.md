# 10 Leads and open questions

Ideas worth testing, none measured yet. Each says what to measure before adopting it. Sources: Fractal's academia
Part 7 and chapters 3.19–3.25; `potential ideas.md`; Ruby's research; GrindPilot's review.

| Lead | Why it might help | How to measure |
|---|---|---|
| **Parallel slots for overnight batches** (llama.cpp `-np`) | Prompts share each read of the weights (01, section 1) | Total tokens per hour vs one slot, at equal quality |
| **DeepConf-style early stopping** (arXiv 2508.15260) | Stops low-confidence thinking loops | Loop cases and benchmark scores, tokens used |
| **Contrastive harness refinement during sleep** (Harness², 03) | Edits the harness from evidence, not opinion | First: is the local model a good editor of its own harness? Test designed 13 Nov (Fractal academia 3.21): failed tasks with proven tests the editor never sees; a plain second try as control; count failures turned into passes, agreement of its blind pick with the tests, and passes broken. Measured 14 Nov: per-task edits fixed 8 of 13 failures (placebo 0) and the blind pick was right 12 of 13, but the playbook written from them broke 6 of 122 held-out problems. Next: the per-task loop as a second attempt on hard tasks; lessons filed by kind of task. Built and queued the same evening, with a placebo sentence as the control (greedy answers repeat, so a second try teaches nothing) and a held-out half for the playbook it writes. Then contrast wins, and the secret exam must not drop |
| **"Interview the teacher" step** for playbooks | The process part of a playbook (03, section 3) | Repeated-job success and steps, before and after |
| **Toolbox checks re-run nightly** | Catches tools broken by updates | Broken tools caught before use |
| **Notes from a talk or podcast** (a reel claiming Claude "watches YouTube and learns any skill", champmack, 5 Nov 2026) | A talk's lessons kept as notes, with local Whisper and the 27B. The reel oversells it: the model reads a transcript, and notes load only when they match the task | The user judges notes from one talk they choose, blind. Start with audio files they have: taking YouTube's audio needs a downloader (approval) and is against YouTube's terms |
| **Long jobs picked up after a restart, with real history** (03, section 13) | Measured only on a four-file job | Cut-off jobs of an hour or more that finish right by themselves, and no unsafe step repeated |
| **Rust tools for the model work** (Fractal academia 3.40, steps 6 and 7): speech-to-text, ONNX voices, GGUF conversion, then LoRA training | The owner's decision to move Lattice to Rust | Matching outputs first (the same GGUF bytes, the same transcripts), then the same scores; training last, against unsloth on Ruby's 1.7B |
| **Fractal changing its own Rust code** | It writes Rust less well than Python (85 to 90 % against 96.8 %, Fractal academia 3.22) | A fixed set of small change requests on Volta's Rust node, success with the compiler check on |
| **Jobs on Volta put down and picked up the same way** (03, section 13) | Only the conversation needs to cross the line between machines | Jobs cut off when either machine stops that finish by themselves, once Volta exists |
| **Compiler/type check for TypeScript, Go, C#** | Rust's compiler fixed 8 of 23 failures and broke none | Same paired test per language; Python's mypy found nothing, so measure each |
| **Embedding recall beside graph recall** | Finds notes that use different words | The recall exam now exists (05, section 8). The number to beat: questions in different words find their note 26 times in 52 at best, at about 515 tokens a question. Word-based fixes are exhausted (11 Nov): the target is the 18 questions that share no word with their note, without losing 52 of 52 on same-word questions |
| **A recall exam** | Nothing about memory can be judged without one | **Built 11 Nov** (05, section 8; Fractal academia 3.30). Still to measure: the model's answers on the packets, then whether the "pointer" candidate replaces the walk |
| **turbovec** at millions of vectors | ~8× smaller indexes, fast CPU search (claim) | Recall on your own data, only at that scale |
| **Router/triage tier** (small model first, big model only when needed) | Most steps are easy | Accuracy and cost on a mixed task set vs a single model |
| **Prefetch and overlap slow lookups** (the "engram" idea) | Hide retrieval time behind compute | Wall-clock on retrieval-heavy tasks |
| **Code-graph memory with EXTRACTED/INFERRED edges** | "What calls X?" becomes a query | Impact-analysis accuracy on a real codebase |
| **Incremental graph updates** | Seconds instead of a full rebuild | Update time on a 1-file change |
| **Layer-streamed LoRA training** | A big model fine-tuned on a small card, slowly | Only once a fine-tune has a clear target to measure |
| **Writing coarse to fine: Next-Concept Modeling** (01, section 10) | 10 to 31× faster than diffusion models; 86 % of hard Sudoku against 1 % for a next-token model of the same size | ~~Reproduce hard Sudoku from the released files~~ done 17 Nov: 86.25 % here against 86.1 %, 67 ms a board; XSum ROUGE-L 27.93 against about 28.0; ~~port the generator to Rust~~ done 17 Nov: identical output, twice as fast; 18 Nov: the job chosen (Ruby's journal summaries), the encoder ported (the same codes as PyTorch) and a Rust trainer built; next: practice pairs from the 27B, the fine-tune, and a blind test against the 1.7B |
| **An offline translator on the phone** (Tencent Hy-MT2: 440 MB, 33 languages, said to beat Microsoft's translation API; from a news reel, 14 Nov 2026, not read at the source) | Ruby could translate with no network | First the model card and its license; then a test on the phone against the 1.7B brain's own translations |
| **A plain-English map of a code project** (Floorplan, 14 Nov 2026) | Fractal's code graph exists; naming its parts and answering "what happens when..." on it would let Fractal explain a project as it changes it | One project mapped by hand as the reference; Fractal's map judged by the user |
| **A light headless browser for the web tool** (Obscura adopted 14 Nov as a fallback; Lightpanda not tried; 03, section 4) | Pages built by JavaScript come back nearly empty today | A fixed page list through today's fetch and through it: real text recovered, time, memory, tokens. Needs WSL or Docker and a download (the user's decision) |
| **Fine-tuning the 27B on this PC by layer streaming** (06, section 7; Exact Layer Streaming, 2026) | The base stays in RAM, one layer at a time on the card | First: the streamed result bit for bit equal to a normal run on a small model; then the PC's memory with the 27B; then the secret exam before and after |
| **Fine-tuning the 27B on verified lessons** (QLoRA, V100s) | The sleep paper's weight consolidation | Secret exam before and after; nothing else may drop |
| **A very large model from the SSD as a slow second opinion** (InferSSD, 01 section 7) | A 763B model at about 2.5 tok/s on a 16 GB card might solve what the 27B can't, overnight | First: does it score higher than the 27B on the hard part of our evals at all? Then time per answer, bytes read per day, and whether old cards are supported. Needs about 520 GB of disk and a download the user approves |
| **Bytes read per token and expert-cache hits, logged on our own work** (from the Kimi K3 write-up, 01 section 7) | A cache of experts helps only when the model uses its experts unevenly; the maker's hit rate may not be ours | On Volta: Strata's own log lines for cache hits and reads, on Fractal's real prompts, with memory capped and the drive held fixed |
| **The line between two AIs' machines, on real hardware** | Built and tested with both ends on one PC only (11) | Time to notice the other machine is off, file speed, pairing over the home network and over Tailscale |
| **Training jobs without a "run this" job** (recipes chosen by name on the big machine) | Keeps what a stolen token can do to a fixed list (11, section 3) | Can a phone brain be trained with only data crossing the line? |
| **Hard questions handed to a bigger model on a second machine** | A 125B model on 2× V100 (claim: 50–74 tok/s) beside the 27B | Accuracy and waiting time on a mixed set, handed over by rule vs by the model's own choice |
| **MTP 2+ ahead with spare VRAM** | ~1.8× reasoning speed seen at 24K | Same speed sweep at full context on a bigger card |
| **Streaming voice loop** (VAD + turn detection + streaming ears + resident TTS) | Under ~0.8 s to first sound | End of speech to first sound |
| **A small interaction model** that talks while a big one thinks | Rose/JARVIS, Thinking Machines | Response time and delegation accuracy |
| **Digest on the GPU after play** | OCR of recordings takes ~22 min per hour of play | Time one recording both ways |
| **Confidence-based clicking** | Fewer wrong presses | Tunable only against labelled frames (the exam) |
| **Forgetting per item: 3× the item's usual gap** (the 14-day floor is built) | Monthly items survive too | Dry-run lists reviewed by the user |
| **Start-of-session "due now" line and an end-of-session memory tally** | The user sees what memory did | User feedback |
| **A phone brain trained on conversations, not single questions** | The talk exam (02, section 5): 79.4 %, 8 unwanted actions, and worse than the stock model after a correction | **Measured 13 Nov** (06, section 9): 943 against 901 of 1,020 answers, unwanted actions 7 against 32. A blind judge called single questions a draw (12 to 11, 30 ties). Still to do: a blind judge of whole conversations, and the phone itself |
| **Every sampled exam judged by paired answers** (02, section 10) | A 3-seed total moved 2.5 points with no real change | For each exam that samples: rebuild or re-round the current model, count the answers that change; that is its noise floor |
| **A TIES merge when two fine-tunes each do one thing well** (06, section 9) | It landed between its parents on a 1.7B; not confirmed as better than either | Ten seeds on answers the merge was not chosen on; try the kept share at 10 % and 50 % |
| **Reading GitHub repos as a tree, not as web pages** | Fractal's research guessed doc paths on GitHub and got 404s; DeepWiki returned 429 (Fractal academia, research trail of 7 Nov) | **Built 10 Nov** as Fractal's `read_repo` (Fractal academia 3.26); still to measure: research tasks about a repo, right facts found and pages fetched, with vs without it |
| **A handful of keyless data services as checked tools** (weather, public holidays, exchange rates, definitions; 03, section 11) | A few hundred bytes of JSON instead of a search and a page, for a model with little context to spare | About 30 everyday questions with known answers: right answers, seconds and tokens, the tool vs web search; and a list of what leaves the PC on each call **Measured 12 Nov** (03, section 11; Fractal academia 3.37): 29 of 30 right against 28 with web search alone, at about a third of the time and tokens. **Fixed and switched on the same day:** verdict-first date answers (13 of 13 holiday questions in a third run), no dictionary tool, and a failure message that sends the model to web search. Still to do: a nightly re-check of each service, and a try in real chats with thinking on |
| **Traits earned from counts** for the station's AIs (from Pino, 03 section 12) | "Ruby usually touches base around six" is true, cheap and gives character; lines are added during Sleep from the activity log, never deleted, authored lines locked | Each earned line checked against the log it came from; the user says whether the station feels more alive or just busier |
| **A small "held" memory beside the Mind** (from Pino, 03 section 12) | A few dozen notes that earned their place by strength, recalls and recency, always in the prompt; entry means beating the weakest | The recall exam (05, section 8) with and without the held set, and the tokens it costs per question |
| **On-policy distillation for Ruby, sequence-level** (06, section 10; the 27B and the 1.7B have different tokenizers, so no per-token form) | The student learns from its own answers, the best picked by the teacher and code checks; measured elsewhere to repair forgetting | Against one more supervised round on the same budget: the phone exam (3 seeds, paired answers), the forgetting panel, unwanted actions |
| **RL with checkable rewards on Ruby's checkable skills** (GRPO / Dr.GRPO, LoRA, a KL penalty) | Action gate, tool JSON and parsing have exact checkers | Held-out phone exam, answer length, a blind read of 20 answers for reward hacking. Needs WSL2 for fast sampling |
| **GEPA-style reflective rewriting as the habit workshop's proposer** | Writes from whole traces and the grader's feedback | Changes adopted per proposer (today's vs GEPA-style) under the same sign test, and the frozen held-out set |
| **A bank of graded successes as examples** | Claimed +16 points on ALFWorld | Paired temperature-0 trials with and without; prune examples whose removal costs nothing |
| **Sleep-time notes on active projects** | Less thinking at answer time | Next-day tokens and accuracy on real questions, nights with notes against nights without; the recall exam before and after |
| **Cross-model disagreement as a confidence signal** (Odysseus scoring Fractal's answers, or the reverse) | Catches confident mistakes one model can't see in itself | AUROC of the score against exam correctness on 100+ graded items, against Fractal's self-consistency |
| **Impossible "canary" tasks in the code exams** | Any pass is a cheat | Canary passes stay at 0. Adding items to an exam is the user's decision |
| **Rotating exam items with a frozen anchor set** | Shows memorisation as a widening old-vs-new gap | The gap per month; the anchor score week to week |
| **MTP 1 to 4 ahead on a current llama.cpp build** (01, section 12) | Others on 16 GB found 3–4 best (+11–19 %); ours found 2-ahead slower at 36K on the 28 Oct build | tok/s, acceptance and VRAM at 24K and 36K, the same 10 prompts, on a fresh build |
| **Kyutai Pocket TTS with Fractal's voice** | Claimed about 200 ms to first audio on CPU, voice cloned from one clip | Time to first audio over 20 lines, warm and cold; a blind listen against Chatterbox and the fast Piper voice. Needs a download |
| **Streaming speech-to-text for Hey Fractal** (Nemotron Speech Streaming 0.6B, Kyutai STT 1B) | Words arrive while speaking instead of after the silence | End of speech to final text, and word errors, against whisper.cpp on 20 recorded commands. Needs a download |
| **Thinking only when the task is hard** | 2026 papers favour deciding to think over a fixed budget | The exam kit at budgets off, 0, 1,024 and 4,096: score, thinking tokens, time |

## Questions still open

1. Why does MTP 2-ahead slow down at long context on a nearly full card? The explanation (memory pressure) is reasoned,
   not proven.
2. Can a 27B be a useful editor of its own harness, or does refinement need a stronger editor?
3. Does Kyutai's streaming voice stack run on a Turing card without bf16?
4. How natural can a small on-device voice get when trained from a designed teacher voice? It is measured partway
   (07, section 6); the blind listening test is pending.
5. Why did a LoRA on proven practice answers fail to help a 4B model, when distillation from a teacher helped a 1.7B
   a lot? A guess: practice data teaches the model what it can already do, while teacher data adds behaviour it
   lacked. Untested.
6. Which web search should a local AI rely on when a free endpoint starts answering with bot checks (03, section
   14)? A search API with a key, a locally run search program, or several sources in turn: untested.
7. What is a fast mixture-of-experts reasoning model (gpt-oss-20b) actually better at than a dense 27B on one 16 GB
   card? Lattice's paired comparison (GSM8K, MATH-500, ARC, instruction following, recall, long-output speed) is
   queued; Odysseus academia 3.5.

**Added 23 Nov 2026 (night research pass; 01 s13, 06 s14, 12 s9):**

| Lead | Why it might help | How to measure |
|---|---|---|
| **Hand-tuned expert offload for MoE** (`-fit off --n-cpu-moe N`, `-t 6`) | Others report 91.5 tok/s where our fit gave 76 for a 35B-A3B on a 5070 Ti | Sweep N over 16-24 with llama-bench; also log the context fit picked. Needs a router restart, so coordinate with Studio's owner |
| **Gemma 4 26B-A4B QAT, fully on the card** (14.2 GB) | Reported 112 tok/s on a 5070 Ti; ours scored 19/26 at 90 | The hard exam, paired with the 17 GB file and the 27B; its top-1 agreement is only 85.6 %, so the score decides (a download) |
| **Facts in the prompt instead of in the weights** (Ruby 8d) | Fine-tuning is a poor way to add facts (Gekhman 2024) | Recall with the card in the prompt of routed questions, against team 8a's 160; the talk exam unchanged; first token under 3 s |
| **Self-reworded training data (SDFT)** for Ruby | Kept other skills intact in Yang et al. 2024 | A knowledge fine-tune on answers the 1.7B rewrote itself, 1 epoch, LR at most 1e-4; recall at least 147 and talk not worse, paired |
| **A hash chain and an off-machine checkpoint for the activity log** | The auditor's ledger shares the disk with the logs (12 s9) | Four tampering drills (edit a middle line, cut the last lines, delete a file, rewrite and re-fingerprint everything); all must alert, the last only through the phone's copy |
| **Per-AI baselines in the auditor** | Bursts and first-seen tools stand out | Replaying a week gives fewer than 3 "review" items a day, and injected bursts fire |
| **Thinking on, at equal time per task** | Does thinking change dense against MoE on our exam? | 120 s per task, the maker's samplers, 3 seeds, the 27B with MTP against Gemma 4 26B-A4B |

**How we know.**
- Q1 (MTP 2-ahead slower at long context): Fractal academia 3.11; the memory-pressure reason is reasoned, not measured.
- Q2 (a 27B editing its own harness): Fractal academia 3.21.
- Q3 (Kyutai on a card without bf16): Volta academia 3.3 and 3.7 (no bf16 on Volta).
- Q4 (small on-device voice): 07 section 6; Ruby academia 3.4–3.6.
- Q5 (LoRA failed, distillation helped): Fractal academia 3.3 and 3.24; the guess is untested.
- Q6 (web search behind bot checks): 03 section 14.
- Q7 (gpt-oss-20b against the 27B): Odysseus academia 3.5; partly answered since in Fractal academia 3.78 and 3.81.
- 23 Nov leads table: our 76 tok/s fit and Gemma's 19/26 at 90 tok/s, Fractal academia 3.78, `Fractal\exam-kit\results\general-hard\m3-trial-gemma4-moe.jsonl`; others' 91.5 and 112 tok/s, "hackmd.io/@thc1006 (Qwen3.8-27B MTP on a 3090); dev.to/rosgluk (MTP on 16 GB); qiita.com/rS_alonewolf (Gemma 4 QAT on a 5070 Ti)" (S) and "Doctor-Shotgun, *llama.cpp MoE offload guide*, huggingface.co/blog/Doctor-Shotgun/llamacpp-moe-offload-guide" (S); 85.6 % top-1 agreement, "Model cards: Qwen3.6-35B-A3B, Qwen3.8-27B, Gemma 4 26B-A4B and 31B; Unsloth Gemma 4 QAT page" (C); facts in the prompt, "Gekhman et al. *Does fine-tuning LLMs on new knowledge encourage hallucinations?*, arXiv 2405.05904" (S) and team 8a's 160, Ruby academia 3.20; SDFT, "Yang et al. *Self-Distillation Fine-Tuning* (SDFT), arXiv 2402.13669" (S); hash chain, "Schneier and Kelsey 1998; Crosby and Wallach, USENIX Security 2009" (B); per-AI baselines and thinking at equal time: source not recorded (proposals).
- Two leads have moved on since: the facts card passed (Ruby academia 3.20) and an off-machine fingerprint copy was built (12 section 9).

**Proof.**
- Results: `Fractal\exam-kit\results\general-hard\m3-trial-gemma4-moe.jsonl`, `Ruby\docs\research\2026-11-23\ruby_team_8\result_8a.json`

**The idea behind it:** [Speculative decoding](file:///E:/AI%20academia/Study%20hub.html#spec), [Mixture of experts and routers](file:///E:/AI%20academia/Study%20hub.html#moe), [Append-only logs and an auditor](file:///E:/AI%20academia/Study%20hub.html#audit)

