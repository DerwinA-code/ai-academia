# 01 Local inference on consumer GPUs

Running large language models on one home PC. Main source: Fractal's academia, Parts 1, 3.7–3.12, 3.19, 7
(`E:\Fractal AI project\docs\ACADEMIA.md`).

---

## 1. Speed is bytes per token

**The single most useful formula.** To write one token, the model reads all of its weights once. So:

```
top writing speed (tok/s)  ≈  memory bandwidth where the weights live  ÷  size of the weights
```

| Where the weights are read from | Bandwidth | Top speed for a 13.3 GB model |
|---|---|---|
| RTX 5070 Ti VRAM (GDDR7) | 896 GB/s (spec) | ~67 tok/s; **measured 50.8**, about 76 % of the limit |
| System RAM (dual-channel DDR5) | ~60–90 GB/s | ~5–7 tok/s |
| NVMe drive, simple single-thread read | 1.2 GB/s (measured) | ~0.09 tok/s, ~11 s per token |

It explains, in one line:
- why anything that spills out of VRAM is 3–4× slower;
- why 4-bit weights are fast (fewer bytes per token);
- why speculative decoding helps (several tokens per read of the weights);
- why batching many prompts raises throughput (prompts share one read of the weights);
- why "70B on a 4 GB card" tools are seconds per token (section 7).

**How we know.**
- The formula and the "spills are 3–4× slower" rule: our own measurements, Fractal academia 1.3 (the GPU memory budget) and 3.7 (the spill bug, 50 → 17 tok/s).
- 896 GB/s for the RTX 5070 Ti: outside source, "NVIDIA CUDA 13 release notes (Volta removed); RTX 5070 Ti spec (896 GB/s)" (status R / S).
- Measured 50.8 tok/s for the 13.3 GB model: Fractal academia 3.12; results `Fractal\runtime\experiments\2026-11-07\kv4\results.json`.
- 1.2 GB/s NVMe read: Fractal academia 3.19 (a simple single-thread read, 8 Nov); result file not kept.
- System RAM at ~60–90 GB/s: an estimate; source not recorded.
- The "70B on a 4 GB card" point: section 7 of this file (AirLLM, "lyogavin/airllm (README) and its 2023 blog post").

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-07\kv4\results.json`, server log `Fractal\runtime\experiments\2026-11-07\kv4\server-q4_0-36864.log`
- Code: `Fractal\runtime\experiments\tests\kv4_bench.py`
- Not kept: the 8 Nov drive-read timing.

**The idea behind it:** [Quantisation and the VRAM budget](https://derwina-code.github.io/ai-academia/Study%20hub.html#vram), [The KV cache](https://derwina-code.github.io/ai-academia/Study%20hub.html#kv)


## 2. The VRAM budget

```
weights + KV cache (per token × context) + compute buffer (grows with batch size) + other apps + margin  ≤  VRAM
```

If it doesn't fit, llama.cpp moves layers or buffers to system RAM. It still works, but writing speed drops 3–4×
(seen many times: 50 → 13–17 tok/s).

**Measured lessons:**
- **"Slow" usually means "something spilled".** After games, speed stayed at 17 tok/s. The server log said
  "projected to be short by 857 MiB … loading anyway": the default batch of 512 needed a compute buffer that didn't
  fit beside ~1.8 GB held by Windows, Discord and the browser. **`ubatch-size = 384` restored 44.5 tok/s**, with
  prompt reading just as fast (~1,600 tok/s). Read the server log before blaming the model.
- **The largest context that fits on paper is not the fastest.** Left to llama.cpp's `--fit`, the 27B took 40K context
  and spilled (30 tok/s). Capping the context gave 50 tok/s.
- **Other apps hold VRAM.** A running game or Discord cut speed to 10–28 tok/s. Benchmarks must refuse to run while
  other GPU apps are open.
- **Side features cost context.** Putting the vision projector on the GPU forced the context down to 12K and speed to
  38 tok/s. On the CPU, the main model kept 47–50 tok/s.

**How we know.**
- The budget inequality and the 50 → 13–17 tok/s spills: Fractal academia 1.3.
- The 857 MiB spill after games and `ubatch-size = 384` restoring 44.5 tok/s (prompt reading ~1,600 tok/s): Fractal academia 3.7 (5 Nov); result file not kept.
- `--fit` taking 40K context and spilling (30 tok/s), capped context 50 tok/s: Fractal academia 3.8; result file not kept.
- Other apps cutting speed to 10–28 tok/s: Fractal academia 2.2, rule 1; result file not kept.
- Vision projector on the GPU forcing 12K and 38 tok/s, CPU keeping 47–50: Fractal academia 3.10; result file not kept.

**Proof.**
- Code: `Fractal\fractal\hardware.py`, `Fractal\fractal\gguf.py` (the fit estimate), `Fractal\runtime\models.ini` (the settings as now set)
- Not kept: the 5 Nov hub log with the "short by 857 MiB" line; the 40K and vision-projector speed runs.

**The idea behind it:** [Quantisation and the VRAM budget](https://derwina-code.github.io/ai-academia/Study%20hub.html#vram), [The KV cache](https://derwina-code.github.io/ai-academia/Study%20hub.html#kv)


## 3. Quantisation

- **Weights:** GGUF quantisations let a 27B model (about 54 GB at 16-bit) fit in ~13–15 GB. IQ4_XS is about
  4.25 bits per weight.
- **KV cache:** can also be quantised. `q8_0` is ~8.5 bits per number, `q4_0` ~4.5.
- **Measured, 4-bit KV on Qwen3.8-27B:**

| Cache | Context | Writing speed | Facts recalled at 15K | at 30K | VRAM |
|---|---|---|---|---|---|
| q8_0 | 20,480 | 50.8 | 12/12 | (doesn't fit) | 14.5 GB |
| **q4_0** | **36,864** | **50.8** | 12/12 | **12/12** | 14.6 GB |

  The arithmetic: 20,480 × 8.5 ≈ 36,864 × 4.5, so the 4-bit cache gives ~1.8× the context in the same memory with no
  measured loss in recall. KIVI (arXiv 2402.02750) showed low-bit KV keeps quality; this confirms it for a hybrid
  model. **Adopted.**
- **Duplicate tied weights waste space.** A merged fine-tune saved `lm_head` as a copy of the embeddings, and the
  converter stored both (+175 MB, and embeddings at Q4_0 instead of Q6_K). Dropping the identical copy restored the
  intended layout. Check file sizes after any merge.

**How we know.**
- Bits per weight for IQ4_XS, q8_0 and q4_0: general GGUF background, Fractal academia 1.2; outside source not named in References.
- The 4-bit KV table (context, speed, 12/12 facts at 15K and 30K, VRAM): our own measurement, Fractal academia 3.12; results `Fractal\runtime\experiments\2026-11-07\kv4\results.json`.
- Low-bit KV keeps quality: outside source, "Liu et al. *KIVI*, arXiv 2402.02750".
- Duplicate tied weights (+175 MB, embeddings at Q4_0 instead of Q6_K): Fractal academia 3.24; the same fault found again in Ruby academia 3.9 (`Ruby\docs\research\2026-11-12\ruby_weights`).

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-07\kv4\results.json`, logs `Fractal\runtime\experiments\2026-11-07\kv4\server-q8_0-20480.log` and `server-q4_0-36864.log`
- Code: `Fractal\runtime\experiments\tests\kv4_bench.py`

**The idea behind it:** [Quantisation and the VRAM budget](https://derwina-code.github.io/ai-academia/Study%20hub.html#vram), [The KV cache](https://derwina-code.github.io/ai-academia/Study%20hub.html#kv)


## 4. The KV cache and hybrid models

```
KV bytes per token = 2 (K and V) × attention layers × KV heads × head size × bytes per number
```

Hybrid models (Qwen3.8: about 1 layer in 4 uses full attention; the rest keep a fixed-size state) pay KV cost only on
their attention layers, so long context is far cheaper than in a plain transformer of the same size.

**Qwen3.8-Flash-Next 125B MoE (claim, from its model card and the Strata project):**
- 48 layers: 36 Gated DeltaNet (linear recurrence) and 12 sparse-attention layers.
- Only ~9–10B parameters are active per token, so the cost per token is near a 10B dense model.
- A 51B n-gram embedding table ("engram") lives in **system RAM, not the GPU**. The rows it needs are prefetched while
  the GPU computes.
- **The general idea:** put big, lookup-heavy, rarely-touched parts in cheap RAM and overlap their fetch with GPU work.

**What it takes to run, via Strata (claims, gathered 10 Nov 2026):**
- Strata is its own C++/CUDA engine. It is MIT-licensed and reuses parts of llama.cpp/ggml.
- The experts sit in system RAM. The lookup table is about 29 GB and lives on the SSD; a few rows are read per token.
- RAM it allocates per quant:

  | Quant | RAM | RAM + VRAM | tok/s at 4K / 32K input |
  |---|---|---|---|
  | Q2_0 | 34 GB | 37.6 GB | 93.0 / 81.8 |
  | IQ2_XS | 35.5 GB | 39.2 GB | 78.6 / 76.3 |
  | IQ3_XXS | 43 GB | 47.0 GB | 61.6 / 58.5 |
  | IQ3_S | 50 GB | 54.8 GB | 53.3 / 48.3 |

  - Allocations are from Strata's recommended configurations; speeds are on an RTX 5070 12 GB with 64 GB DDR5.
  - Strata adds about 10 GB of headroom for the OS.
  - IQ3_S is about 84 GB on disk, plus about 7 GB for the speculation head.
- **Strata's own pick for 32 GB RAM with a 12–16 GB card is not Flash-Next at all.** It recommends its smaller Coder
  (Qwen3.6-35B-A3B). Flash-Next starts at 48 GB of RAM (Q2_0), and IQ3_S needs 64 GB.
- **Quality:**
  - Only IQ3_S has been scored: 91 (Tier A) in one reviewer's coding test. It fixed all 14 planted defects.
  - No scores were found for the 2-bit quants.
- **One user's agent task on an RTX 5070 Ti 16 GB with 128 GB of RAM (a single run):**
  - Flash-Next IQ3_S: 43 min at 50–90 tok/s.
  - Qwen3.8-27B in llama.cpp: 6.5 min at 70–130 tok/s.
  - Flash-Next in llama.cpp (UD-Q4_K_XL): 2 h 41 min at 10–25 tok/s.
- Sources disagree on active parameters: about 6B or about 3B per token.
- **For a 16 GB card with 31 GB of RAM: it does not fit.** 64 GB of RAM is the upgrade that unlocks IQ3_S.
- **On old datacentre cards (Strata issue #2825, a user report):**
  - Hardware: 2× V100-SXM2-16GB, 2× Xeon E5-2640 v4, 64 GB RAM, Linux, driver 550, CUDA 12.6.
  - IQ3_S at 65K context with MTP: 50–74 tok/s decode, and a 10K-token prompt in about 3 s.
  - Layer split puts ~15 GB on each card. About 47 GiB of experts stay in RAM, with a 94–98% expert-cache hit rate.
  - Strata's support for V100 and other compute-7.0 cards:
    - V100s need its CUDA 12 engine (needs driver 575.51 or newer).
    - BF16 work runs on the FP16 tensor cores.
    - The maintainers test only a P100, so the V100 path is checked by the community.
    - A V100 port with benchmarks also exists: `jmnargi/Strata-V100`.
- **Three 16 GB cards are not one 48 GB card (claims, gathered 11 Nov 2026 from Strata's documents and issues).**
  - In a layer split every card keeps its own copy of the dense weights, its own context and its own prompt
    buffers. One report on 16 GB cards (IQ3_S, 131K context): the cards held 8.4 GiB of experts on one card, 12.0 on
    two and 10.8 on four, for 92, 97 and 111 tok/s.
  - Strata's own wording: "a split can add capacity without adding speed", and an extra slow card "can make a good
    pair slower" (one of its tests: 84 → 68 tok/s with a third, slower card).
  - **RAM is the limit, not graphics memory.** A size fits when RAM holds its experts plus about 10 GB. On 64 GB
    that caps the model at IQ3_S (50 GB of experts). The 4-bit files need about 88 GB; with less, experts are read
    from the SSD and speed falls to 14 to 20 tok/s (measured by Strata on a 16 GB card with 62 GB of RAM).
  - **Quality against the 8-bit reference (same top token):** Q2_0 80.6 %, IQ3_XXS 84.5 %, IQ3_S 87.7 %, UD-IQ4_XS
    88.9 %, UD-Q4_K_XL 93.1 %, UD-Q6_K_XL 94.6 %.
  - On Windows a multi-card run pins only 8 GiB of the experts and streams the rest; Linux pins all of it.
  - What this means for a mixed set of cards: give the two fast cards the big model and the third card a second,
    independent model that fits it whole. Write-up: `E:\Project Lattice\Volta\docs\MODELS.md`.
- **Status: Lead.** It is unmeasured on Fractal's evals.

**How we know.**
- The KV-bytes formula and Qwen3.8's hybrid layout: Fractal academia 1.1 and 3.8 (the memory checker reads the attention layers from the GGUF header).
- Everything about Qwen3.8-Flash-Next and Strata (layers, active parameters, engram table, RAM per quant, speeds, the single agent-task run, the quality percentages, Strata issue #2825 on V100s, multi-card splits): outside sources, "Strata (Niko1221/Strata); Qwen3.8-Flash-Next model card" (status S, C). Nothing here was run by us; Fractal academia 3.26 records the 10 Nov check of Strata's pages.
- The mixed-card conclusion: our own reading, written up in `Volta\docs\MODELS.md` and Volta academia 3.3 and 3.6.

**Proof.**
- Code: `Fractal\fractal\gguf.py` (reads layers, KV heads, head size, attention layers)
- Not kept: copies of the Strata pages and issues read on 10–11 Nov.

**The idea behind it:** [The KV cache](https://derwina-code.github.io/ai-academia/Study%20hub.html#kv), [Mixture of experts and routers](https://derwina-code.github.io/ai-academia/Study%20hub.html#moe), [Quantisation and the VRAM budget](https://derwina-code.github.io/ai-academia/Study%20hub.html#vram)


## 5. Speculative decoding

**The idea.** A forward pass costs about the same whether it checks 1 token or a few. So a cheap drafter guesses the
next k tokens and the big model checks them in one pass. The output is identical to what the big model would write;
only speed changes. If each guess is accepted with probability α:

```
E[tokens per pass] = (1 − α^(k+1)) / (1 − α)        α = 0.97: k = 1 → 1.97,  k = 2 → 2.91
```

**Two drafters, measured on Qwen3.8-27B (llama.cpp `--spec-type`):**
- **n-gram** copies upcoming text from earlier in the context. It is free, and enormous for rewrites: code-rewrite
  speed 44 → **181–249 tok/s**. It does nothing for fresh reasoning or prose.
- **MTP** (multi-token prediction) uses an extra layer trained with the model (the 27B file has one:
  `nextn_predict_layers = 1`). Reasoning 50.7 → **75.4 tok/s** at 1-ahead with full 36K context.

| Setting (through the real server) | Reasoning | Prose | Code rewrite | VRAM |
|---|---|---|---|---|
| q4 KV, 36K, n-gram only | 50.7 | 50.6 | 184 | 14.6 GB |
| q4 KV, 36K, MTP 2-ahead | 50.7 | 36.2 | 178 | 15.2 GB |
| **q4 KV, 36K, MTP 1-ahead + n-gram (adopted)** | **75.4** | **56.3** | **249** | 15.3 GB |
| q4 KV, 24K, MTP 2-ahead | 93.4 | 56.9 | 289 | 15.2 GB |

Acceptance for the adopted setting: reasoning 0.97, prose 0.87, code 0.85.

**Finding: deeper drafting can be slower on a full card.** 2-ahead was accepted 83–96 % of the time, yet ran
slower at 32–36K than at 24K, and slower than no drafting at all for prose. Theory says 2-ahead should give more tokens
per pass, so the cost of each pass must have grown. The pattern (speed falls as context grows, at almost the same
VRAM, with only ~0.6 GB spare) points to memory pressure. That is a reasoned explanation, not a proven one.
**On a full card, prefer 1-ahead; re-test deeper drafting when there is spare VRAM.**

**Real-task effect:** a task that reads 11 files and reports a fact from each went from 210 s to **28–32 s**
(11/11 and 10/11 correct, no checkpoints), partly from parallel file reads.

**How we know.**
- The idea and the E[tokens per pass] formula: outside source, "Leviathan, Kalman, Matias. *Fast Inference from Transformers via Speculative Decoding*, arXiv 2211.17192"; MTP from "Gloeckle et al. *Multi-token Prediction*, arXiv 2404.19737; DeepSeek-V3 report, arXiv 2412.19437".
- The drafter table, acceptance rates and the deeper-is-slower finding: our own measurement, Fractal academia 3.11; results `Fractal\runtime\experiments\2026-11-07\spec\results.json` and `Fractal\runtime\experiments\2026-11-07\mtp\results.json`.
- llama.cpp's `--spec-type` options: "llama.cpp b11946: router mode, `--spec-type draft-mtp / ngram-mod` (PRs #22673, #23269)".
- The 11-file task, 210 s → 28–32 s: Fractal academia 3.11 (live result); result file not kept.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-07\spec\results.json` (server logs `server-0.log` to `server-4.log` beside it), `Fractal\runtime\experiments\2026-11-07\mtp\results.json`
- Code: `Fractal\runtime\experiments\tests\spec_bench.py`, `Fractal\runtime\experiments\tests\mtp_sweep.py`; the adopted setting in `Fractal\config\agents.toml`
- Not kept: the transcripts of the live 11-file runs.

**The idea behind it:** [Speculative decoding](https://derwina-code.github.io/ai-academia/Study%20hub.html#spec)


## 6. Several models on one card: router mode

- llama.cpp (b11946) has a **router mode**: one server with an ini preset of models. `--models-max` caps how many stay
  loaded, `--models-memory-margin` keeps free memory, and requests pick a model by name; the least recently used is
  unloaded. No custom process manager is needed.
- **Swap cost:** about 20 s to swap a 26B model in.
- **CPU models get evicted too.** A small helper model on the CPU had to move to its own server on another port, because
  the router evicted it with the GPU models.
- **Read-only-looking endpoints can have side effects.** `/props?model=X` makes the router *load* X. A status poll every
  30 s silently reloaded a model in the middle of games and benchmarks.
- **Re-query after a swap.** One swap fell back to an 8,192-token context and the task lost its state.
- **The router refuses rather than waits while a model is loading** (Lattice, 20 Nov 2026). The hub loads the 27B by
  itself on start-up; a request for a second model during that load got "model limit reached, try again later", and
  a caller that didn't retry never got its model. Make room first (unload the other model), then ask again on a timer
  (every 4 s, up to 3 minutes, in Ruby's gateway).

**Two AIs taking turns on one 16 GB card (Measured, 20-21 Nov 2026).** Fractal's Qwen3.8-27B (UD-IQ4_XS, ~14 GB) and
Odysseus's gpt-oss-20b (MXFP4, 12.11 GB file, ~11.9 GB at 32K) can't both sit on the card, so the router swaps them:

| | Qwen3.8-27B (dense) | gpt-oss-20b (mixture of experts, ~3.6B active of 21B) |
|---|---|---|
| Load | ~20 s | 20 s |
| Writing speed | ~50 tok/s | **164-187 tok/s** |
| A short blind question, both asked in turn (swaps included) | 30 s | 20 s |

- The first phone answer from gpt-oss-20b, including the load and the swap, took 50.4 s.
- **Estimate a mixture-of-experts model's speed from its active parameters,** not its file size. Lattice's Cookbook
  first estimated gpt-oss-20b at 41 tok/s from the 12 GB it reads; counting only the experts used per word gave about
  127, nearer the 164-187 measured. Bytes per token still rule, but only the bytes a token actually touches.
- **Speed and knowledge trade off in the same way.** The few billion parameters that make it fast also hold less of
  the world (03, section 14).
- Records: Fractal academia 3.57, 3.63; Odysseus academia 3.2.

**How we know.**
- Router mode, `--models-max`, `--models-memory-margin`: outside source, "llama.cpp b11946: router mode, `--spec-type draft-mtp / ngram-mod` (PRs #22673, #23269)"; built on in Fractal academia 3.7.
- ~20 s swap, the CPU helper evicted, `/props?model=X` reloading, the 8,192-token fall-back: Fractal academia 3.7 and 3.10 (5–6 Nov); result files not kept.
- The router refusing during a load ("model limit reached"), retry every 4 s for 3 minutes: Ruby academia 3.13.
- The two-AI table (loads, 164–187 tok/s, 30 s vs 20 s, 50.4 s first phone answer): Fractal academia 3.57 and Odysseus academia 3.2; result file not kept. The Cookbook estimate 41 → 127: Fractal academia 3.63.
- "Speed and knowledge trade off": section 14 of `03 Agents, tools and harnesses.md` (Fractal academia 3.60).

**Proof.**
- Code: `Fractal\fractal\hub\hub.py` (old router set-up), `Fractal\runtime\models.ini`, `Fractal\config\agents.toml`, `Fractal\rust\src\gateway\odysseus.rs`
- Results: `Fractal\exam-kit\results\bench\speed-odysseus.summary.json` (a later speed bench of gpt-oss-20b, 22 Nov)
- Not kept: the 20 Nov load and speed timings.

**The idea behind it:** [Quantisation and the VRAM budget](https://derwina-code.github.io/ai-academia/Study%20hub.html#vram), [Mixture of experts and routers](https://derwina-code.github.io/ai-academia/Study%20hub.html#moe)


## 7. Bigger-than-VRAM models: AirLLM vs memory-mapping

**AirLLM** (official `lyogavin/airllm`) runs a 70B model on a 4 GB card by loading **one layer at a time** from disk.
Writing a token still needs every layer, so the whole model is read from disk for every token. The project publishes
memory figures but no tokens-per-second figures.

Estimated for a 27B on this PC (from section 1):

| Setup | Read per token | Time per token | 400-token answer |
|---|---|---|---|
| llama.cpp, all in VRAM (measured) | 13.3 GB from VRAM | 0.02 s | ~8 s |
| AirLLM 4-bit, cached in RAM | ~14 GB over PCIe | ~0.6–1.4 s | ~4–9 min |
| AirLLM 4-bit, from NVMe | ~14 GB at 1.2 GB/s | ~12 s | ~78 min |

**Verdict: not adopted.** llama.cpp already handles bigger-than-VRAM models better:
- it memory-maps the GGUF, so the OS keeps what fits in RAM;
- `--n-cpu-moe` keeps MoE experts in RAM and shared layers on the GPU, and each token touches only its experts.

**Lessons worth keeping from it:**
- **Batching spreads the weight-read cost.** Many independent prompts (overnight practice, grading, dreaming) can
  share one pass with llama.cpp parallel slots (`-np`), at the cost of KV per slot. This is a lead, not yet measured.
- **Layer-streamed LoRA training** might let a big model fine-tune slowly on a small card. Unverified.

**A 2.78-trillion-parameter model on 8 GB of RAM (claim, read 11 Nov 2026: `FareedKhan-dev/kimi-k3-in-c`).**
A 176 KB C program runs Kimi K3 on a CPU with no graphics card by deciding where each byte lives. Its numbers are
the author's, from one 124-core server with a fast NVMe drive and the memory capped; nothing was run by us.

| Step | Memory needed | Why |
|---|---:|---|
| Every weight at 16 bits | 5,560 GB | The size the parameter count implies |
| The checkpoint as shipped | 1,560 GB | The maker already stores the experts at about half a byte per weight |
| Experts left on the drive | 113.5 GB | 16 of 896 experts fire per layer, so about 104B of 2.78T weights (3.7 %) are used per token |
| The always-on part streamed too | 8.24 GB | The 109 GB that every token needs is read from the drive a layer at a time |

- **The price is the rule of section 1 again.** At 8 GB every token reads about 135 GB from the drive (109 GB of
  always-on weights and 26 GB of experts): 26.5 s per token on that server. With all of it in memory, 5.6 s per token.
- **On hardware like ours it is not usable.** Our NVMe drive measured 1.2 GB/s, so the same reads would take roughly
  100 s per token: about ten hours for a 400-token answer. It also needs 1.7 TB of disk, and the author ran no
  quality test. This is a proof that size alone doesn't stop a model running, not a model to work with.
- **An expert cache can do nothing at all.** The cache was grown 48 times (28 to 1,344 experts) and the bytes read
  per token did not change by a decimal. This model is trained to use its experts evenly, so there is no hot set to
  keep. Strata reports 94 to 98 % hits on Flash-Next, whose use is uneven. **Whether a cache of experts helps is a
  property of the model, so measure bytes read per token, never the cache's size.**
- **Give memory to what is read every time, first.** A gigabyte spent holding the always-on weights removed about
  1.17 GB of reads per token; a gigabyte of expert cache removed nothing until about 36 GB.
- **The dense part doesn't quantise like the experts.** The author measured 4-bit error at 18 times the 8-bit error
  on the attention weights and left them at 16 bits; the experts ship at 4 bits from the maker. This matches how
  the 4-bit-and-up files of Flash-Next keep the dense weights at 8 bits and vary only the experts (section 4).
- **The same answer at every memory size** (byte for byte, 8 GB to 224 GB) is treated as a rule the engine must
  keep, which is why it uses no maths library: each one adds up in its own order.
- Measuring lessons from it are in `02 Measuring AI systems.md`, section 2.

**800B-class models with the experts on the SSD (claim, read 11 Nov 2026: WiCi Infer and its engine
`wici-ai/inferssd`, Apache-2.0, built on llama.cpp).** A free desktop app (Windows, macOS; a command line on Linux)
that serves the model through an OpenAI-compatible API. The numbers are the maker's, from its own page and article;
nothing was installed or run by us.

- **The method, five steps:**
  1. **Index the experts:** record where each expert's bytes sit in the GGUF files, so one expert can be read
     without its neighbours.
  2. **Share reads while reading a prompt:** tokens that pick the same expert are grouped, so one read serves all of
     them. In one of their experiments a bigger group cut the bytes read for a prompt from 465 GB to 315 GB.
  3. **A bounded cache** of reused experts in RAM, and in graphics memory on Linux.
  4. **Read misses directly, in the order the maths needs them,** bypassing the system's file cache; the first two
     matrices of an expert are read first so computing overlaps with reading the third.
  5. **Pick the processor per expert:** one already on the card runs there, one in RAM runs on the CPU, so weights
     aren't moved for every token.
- Attention, the shared layers and the conversation's KV cache stay in RAM or graphics memory. Only fixed weights
  are on the SSD, so inference reads the drive and doesn't write to it.
- **Reported writing speed, tokens per second** (decode, tokens 129 to 256 of a 256-token reply, 4K prompt):

  | Machine | DeepSeek V4.1 Flash, 763B | Muse Spark Open, 816B |
  |---|---:|---:|
  | RTX 5060 Ti 16 GB, 8 GB RAM | 2.55 | 0.22 |
  | RTX 5090 32 GB, 32 GB RAM | 7.27 | 1.52 |
  | MacBook Pro M5 Max, 48 GB | 2.70 | 0.94 |
  | DGX Spark, 128 GB | 7.26 | 2.14 |

  - Prompts are read at 52 to 165 tokens a second on the same machines.
  - The advertised "17x" is 2.14 against llama.cpp's 0.12 on the DGX Spark with Muse. It is a ratio to a slow
    baseline; the absolute speeds are the table above.
- **What it costs:** about 520 GB of free SSD for either model (the DeepSeek GGUF is about 473 GiB, an optional pack
  about 269 GiB more).
- **Their own limits:** the comparisons are whole setups with different formats and settings, so no single trick
  can be credited; the Linux numbers are reported by testers; the converted files are not claimed to answer as well
  as the published models.
- **Drive wear:** reading doesn't use up a drive the way writing does, but heavy reading makes a drive rewrite data
  internally. They estimate about 85 TB of reads a day for four hours of continuous use and call their lifespan sums
  assumptions to test on the actual drive.

**Three places to keep the experts, compared (all claims by their makers):**

| Engine | Experts live | Model | Memory it needs | Reported writing speed |
|---|---|---|---|---|
| Strata (section 4) | In RAM, the most-used on the card | 125B | 64 GB RAM for the best size | 50 to 74 tok/s on 2× V100 |
| InferSSD | On the SSD, with a cache in RAM | 763B to 816B | 8 to 32 GB RAM, a 16 to 32 GB card | 0.2 to 7 tok/s |
| kimi-k3-in-c | On the SSD, and the always-on part too | 2.78T | 8 GB | 0.04 to 0.2 tok/s |

**The pattern:** each step that moves weights further from the processor buys a bigger model and costs ten to a
hundred times the speed. That follows the bandwidths of section 1: on this PC graphics memory reads at 896 GB/s, RAM at
about 75 GB/s and the NVMe drive at 1.2 GB/s (a fast drive reaches 7 to 14). For work that needs answers in seconds,
the model whose experts fit in RAM wins; the SSD engines suit a slow second opinion on a hard question.

**How we know.**
- AirLLM's method and figures: outside source, "lyogavin/airllm (README) and its 2023 blog post" (status R).
- The estimate table for a 27B on this PC: our own arithmetic from section 1, Fractal academia 3.19; only the first row is measured (Fractal academia 3.12).
- `--n-cpu-moe` and memory-mapping: llama.cpp behaviour; source not recorded beyond Fractal academia 3.19.
- The kimi-k3-in-c table and lessons (5,560 GB to 8.24 GB, 26.5 s per token, the cache that did nothing, 18× error on attention weights): outside source, "kimi-k3-in-c (FareedKhan-dev/kimi-k3-in-c), README; found through an Instagram reel by princegupta.ai" (status R, C). The ~100 s per token here is our arithmetic from the 1.2 GB/s read (Fractal academia 3.19).
- The InferSSD five steps, speed table, 520 GB and drive-wear sums: outside source, "WiCi Infer product page; "Running 800B-Parameter LLMs on Consumer Hardware with InferSSD" (WiCi Research, 29 Oct 2026); wici-ai/inferssd" (status R, C).
- The three-engine comparison: drawn from the three sources above; RAM "about 75 GB/s" is an estimate, source not recorded.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-07\kv4\results.json` (the one measured row)
- Not kept: the 8 Nov drive-read timing.

**The idea behind it:** [Quantisation and the VRAM budget](https://derwina-code.github.io/ai-academia/Study%20hub.html#vram), [Mixture of experts and routers](https://derwina-code.github.io/ai-academia/Study%20hub.html#moe)


## 8. Hardware notes for older datacenter cards

- **CUDA 13 dropped Volta** (V100 = compute 7.0). Use llama.cpp's **CUDA 12** build with an R580-branch driver, or it
  fails with "no kernel image is available". Turing (T10 / T4 = 7.5) works with either.
- Volta has **no bf16 or FP8**: use fp16 and GGUF quantisations, and test FlashAttention on and off.
- Mixed cards: give the big cards the big models and the small card the small ones (helper, OCR, voice).
- After moving hardware, rerun memory checks, speed benches and evals before trusting anything.
- A memory checker that reads the GGUF header (layers, KV heads, head size, attention layers) can compute
  *weights + KV × context + buffer + margin* before loading, and pick GPU, split or CPU.

**How we know.**
- CUDA 13 dropping Volta, "no kernel image", R580 driver: outside sources, "NVIDIA CUDA 13 release notes (Volta removed); RTX 5070 Ti spec (896 GB/s)" and "NVIDIA: the 580 driver branch is the last for Maxwell, Pascal and Volta (2025 notice; NVIDIA developer forum, Jan 2026: V100 ignored by 590)"; recorded in Fractal academia 3.8 and Volta academia 3.6 and 3.8.
- No bf16 or FP8 on Volta: source not recorded (general hardware knowledge).
- The memory checker that reads the GGUF header: our own build, Fractal academia 3.8.
- "Rerun checks after moving hardware" and the mixed-card rule: our own advice (Volta academia 3.3, `Volta\docs\MODELS.md`), not a measurement.

**Proof.**
- Code: `Fractal\fractal\hardware.py`, `Fractal\fractal\gguf.py`
- Not kept: nothing measured on a V100 yet (Volta is not built).

**The idea behind it:** [Quantisation and the VRAM budget](https://derwina-code.github.io/ai-academia/Study%20hub.html#vram)


## 9. Writing speed is not everything

- **Prompt reading** (prefill) runs at ~1,600 tok/s on the same card and setup, about 30× writing speed.
- **CPU small models** are fine for routing: a 4B helper classifies a request as JSON in about 1 s.
- **Phone CPU:** a 1.7B at Q4_0 (1.05 GB) runs at ~48–49 tok/s on this PC's CPU in llama-bench. A LoRA merge doesn't
  change speed or size.

**How we know.**
- Prompt reading ~1,600 tok/s: Fractal academia 3.7 (the spill-bug fix); result file not kept.
- The 4B helper classifying in about 1 s: Fractal academia 3.9; code `Fractal\fractal\hub\dispatch.py`.
- The 1.7B at Q4_0 (1.05 GB), 48–49 tok/s on the CPU in llama-bench, LoRA merge changing nothing: Fractal academia 3.24; result file not kept.

**Proof.**
- Code: `Fractal\fractal\hub\dispatch.py`, `Fractal\runtime\experiments\tests\route_bench.py`
- Results: `Fractal\runtime\experiments\2026-11-09\ruby_brain\results` (the phone-brain runs; the llama-bench output itself is not kept)

**The idea behind it:** [Mixture of experts and routers](https://derwina-code.github.io/ai-academia/Study%20hub.html#moe), [Quantisation and the VRAM budget](https://derwina-code.github.io/ai-academia/Study%20hub.html#vram)


## 10. Generating text coarse to fine: Next-Concept Modeling (Read, 16 Nov 2026)

**The source.** Kumbong, Khare, … Arora, Mirhoseini, Ré (Stanford Hazy Research), *Next-Concept Modeling: Fast,
Parallel Coarse-to-Fine Text Generation*, arXiv 2610.14162, 9 Oct 2026; the blog post, and the code and weights
(github.com/HazyResearch/ncm, MIT). Read: the abstract, the blog, the README, the list of released weights.

**The idea.** A language model usually writes one token after another. NCM writes in a few passes instead:
1. A **tokenizer** (a multiscale residual VQ-VAE) turns a text into a stack of levels of discrete codes: the first
   level is a few codes for the broad shape, each later level is longer and adds detail.
2. A **transformer** writes one level at a time, every code of that level **at once**, each level conditioned on
   the earlier ones. The tokenizer's decoder turns the finished stack back into words.

So a whole answer appears as a rough sketch first and gains its wording over about 10 passes, rather than word by
word. In their German-to-English example the second of 11 levels is a word salad with the right subject, and the
last is the translation.

**What they measured** (all against **diffusion** language models, the other way of writing in parallel, not against
ordinary next-token models; one H100):

| Test | Result |
|---|---|
| Speed | **10 to 31 times faster** than the strongest diffusion model at similar quality (LM1B 21×, OpenWebText 10×, XSum summaries 31×) |
| Training | 4 to 5 times fewer training tokens than those diffusion models |
| Hard Sudoku (30 clues) | **86.1 %** of boards fully solved, against 81.3 % for the best diffusion model and **1.0 %** for a next-token model of the same size: it revises the whole board on every pass |
| Size | 100M to about 725M parameters (the largest released file is 2.9 GB); nothing near a chat model |

**What it is not, yet.**
- **Not a chat model.** The released models each do one thing: LM1B and TinyStories text, XSum summaries, German to
  English, Sudoku. None follows instructions, holds a conversation or calls tools. The OpenWebText weights aren't up.
- **Not better than ordinary models at writing.** At the same size, next-token models still write better text; the
  speed claims are against diffusion models.
- **Not usable here as it stands.** The code is Python and PyTorch, and nothing about it runs in llama.cpp.

**What it means for Lattice.** It replaces neither Fractal's 27B nor Ruby's 1.7B. Two things in it are worth
watching: (1) for **constraint problems** (Sudoku-like: schedules, layouts, puzzles in games), revising the whole
answer at every pass beats writing left to right by a wide margin at small sizes; (2) for **short fixed jobs on a
phone** (one kind of summary, one translation pair), a model that writes everything in about 10 passes could be much
faster than token by token. Both are research, not product, until someone trains one at a useful size.

**A project of its own?** It fits a small research project: reproduce one released result (hard Sudoku: the files are
small), port the generator to Rust on candle (the library Ruby's trainer already uses), then train a tiny NCM on one
narrow Lattice job and judge it against the 1.7B. Each step is measured before the next. It became the NCM lab
(`E:\Project Lattice\NCM lab`).

**Reproduced here (17 Nov 2026; Measured).** The released hard-Sudoku model, run with the authors' own code and
settings on the gaming PC's RTX 5070 Ti, solved **86.25 %** of 2,000 hard boards (paper: 86.1 %). It is 40M
parameters in all; **67 ms per board** one at a time, 5 ms per board in batches of 128. The files matched Hugging
Face's hashes. The XSum summarizer, on all 11,334 test articles: **ROUGE-L 27.93** (paper: about 28.0), about
58 ms an article in batches of 32. Both released results hold on a consumer card. NCM lab academia 1.7 and 1.8.

**Ported to Rust (17 Nov 2026; Measured).** The generator and the tokenizer's decode side, on candle (about 1,500
lines): the same answers as PyTorch in full 32-bit maths on all 2,000 Sudoku boards, the same XSum ROUGE scores,
and **23 ms an XSum summary against PyTorch's 58 ms**, because the fixed prefix is computed once instead of at
every level (the authors' eager path recomputes it). Two lessons for any port: PyTorch's default TF32 convolutions
on recent cards flip about 0.5 % of near-tie outputs, so parity is checked against PyTorch with TF32 off; and candle
0.11.1's CPU `conv_transpose1d` is wrong for batches with inputs longer than one position. NCM lab academia 1.9.

**How we know.**
- The method, the speed, training and Sudoku numbers, model sizes and limits: outside source, "Kumbong, Khare, Mlauzi, Woen, Ding, Buchanan, Arora, Mirhoseini, Ré. *Next-Concept Modeling: Fast, Parallel Coarse-to-Fine Text Generation.* arXiv 2610.14162 (Oct 2026); Hazy Research blog, 12 Oct 2026; code github.com/HazyResearch/ncm (MIT). Abstract, blog and README read 16 Nov 2026" (status S).
- Sudoku 86.25 % of 2,000, 67 ms and 5 ms per board, hashes matched: our own measurement, NCM lab academia 1.7; results `NCM lab\eval\sudoku-hard\shard0.pkl`.
- XSum ROUGE-L 27.93 on 11,334 articles, 58 ms: NCM lab academia 1.8; results `NCM lab\eval\xsum\scores.txt`.
- The Rust port (same answers in fp32, 23 ms vs 58 ms, the TF32 and candle `conv_transpose1d` lessons): NCM lab academia 1.9; results `NCM lab\eval\rust\sudoku-hard.jsonl`, `NCM lab\eval\rust\xsum.jsonl`, reference `NCM lab\eval\fp32`.

**Proof.**
- Results: `NCM lab\eval\sudoku-hard\shard0.pkl`, `NCM lab\eval\xsum\scores.txt`, `NCM lab\eval\rust\xsum.jsonl`, `NCM lab\eval\rust-scored\xsum.pkl`
- Code: `NCM lab\rust`, `NCM lab\run_xsum.sh`

**The idea behind it:** [Rewriting with parity tests](https://derwina-code.github.io/ai-academia/Study%20hub.html#parity); otherwise none of the listed techniques: writing every position of a level at once, coarse to fine, instead of token by token.


## Small models deciding with a grammar (GrindPilot, 11 Nov 2026; Measured)

A 1.7B model (Qwen3-1.7B Q4_0) chose one tool call per game state, on CPU only (4 threads), with a JSON-schema grammar:
- **A fixed prompt prefix reused from the KV cache** cut each new state to 30–60 new tokens (0.3–0.6 s). The answer
  itself is most of the time.
- **Key order matters.** Many JSON libraries sort keys, so "reason" came before "tool", and the model wrote a long
  reason first. With the tool first and a 60-character cap on the reason, the median fell from 3.3 s to 2.4 s.
- **One shape per tool, not one shared shape.** With optional arguments the model skipped them (3 of 8 answers
  invalid). Each tool's own required arguments gave 8 of 8 valid.
- **llama.cpp's `sample()` already accepts the token.** Accepting it again pushed the grammar twice and crashed it.
- Speed is fine for idle and menu games; quality at 1.7B isn't trustworthy alone. Keep a hard veto and reflexes.

Record: GrindPilot documentary chapter 18.

**How we know.**
- Every claim (prefix reuse at 30–60 new tokens, key order 3.3 s → 2.4 s, one shape per tool 8 of 8, the double grammar accept): GrindPilot's own measurement, recorded in `D:\Games\HoYoPlay\games\Grind Pilot\grind pilot documentary\18 The Rust rebuild - phase 1, the model core and the Deck.md` ("GrindPilot documentary (8 Nov 2026) and Fractal's review of it").

**Proof.**
- Code: `D:\Games\HoYoPlay\games\Grind Pilot\grindpilot-rs`
- Not kept here: the timing runs themselves (only chapter 18's numbers).

**The idea behind it:** [The KV cache](https://derwina-code.github.io/ai-academia/Study%20hub.html#kv), [The agent tool loop](https://derwina-code.github.io/ai-academia/Study%20hub.html#loop)



## 11. The hardware outlook, 21 Nov 2026 (read, not measured: every price and speed is the source's)

The owner asked whether DDR6 and new hardware change Lattice's plans. One reading pass of announcements, roadmaps and
benchmark threads (sources in References, status S). The rule of thumb stands: tokens a second are about memory
bandwidth divided by the bytes read per token. On the 5070 Ti (896 GB/s) the 27B at 13.3 GB has a ceiling near
67 tok/s; anything that spills into system RAM (about 96 GB/s here) runs about nine times slower for those bytes.

- **Desktop DDR6 is years away.** LPDDR6 was published in July 2025 and is only reaching flagship phones. Desktop DDR6
  (8,800–17,600 MT/s, mostly on CAMM2) is put at 2027 at the earliest, and consumer boards at 2028 or later. AMD says AM5
  gets new chips until at least 2029 (Zen 6 stays on AM5 and DDR5), and Intel's Nova Lake (early 2027) is DDR5 only.
  Even dual-channel DDR6 would only double CPU-offload speed. **Plan nothing around it.**
- **Memory is expensive now.** 32 GB DDR5 kits cost about $360–555 (November 2026; about $90–120 in 2025), and makers
  expect it to stay tight into 2027–28. Buy RAM only if it is really needed: 31 GB is enough while the model lives on
  the card.
- **The cheapest real upgrades:**
  - **A 24 GB RTX 5070 Ti Super:** reportedly finished but held back by GDDR7 prices (rumour, no date). It would carry
    the 27B at 6 to 8 bits, or with long context, at the same speed, or a dense model of about 35B at 4 bits.
  - **A second 16–24 GB card** (a used 3090 is about $1,260–1,500) for about 40 GB of VRAM: a 70B at 3–4 bits at
    about 15–20 tok/s.
  - **Zen 6 as a drop-in processor** (about 2027): it helps when experts are held in RAM, and barely changes speed on the
    card.
- **Big-memory boxes buy capacity, not speed.** Strix Halo (256 GB/s, 128 GB, about $4,000), DGX Spark (273 GB/s, now
  $4,699 and up) and Apple M5 Max (614 GB/s) run gpt-oss-120b at about 45–65 tok/s but a dense 70B at only 4–20, and the
  27B slower than the 5070 Ti does. They are worth it only for the 100B+ mixture-of-experts class; LPDDR6 "Medusa Halo"
  (about 460–690 GB/s, 2027–28, rumour) is the one to watch.
- **Big cards got dearer:** RTX PRO 6000 96 GB is listed at $16,000 (August 2026). Radeon AI PRO R9700 32 GB (about
  640 GB/s, about $1,400) is a cheaper 32 GB card with good Vulkan numbers on 30B mixture-of-experts models.
- **Disks and links:** consumer PCIe 6 SSDs are put at about 2030 and CXL memory at workstation level only. Streaming
  experts from an SSD (a llama.cpp proposal, SGLang's "expert pack") gives about 3–5 tok/s on very large models:
  background work, not chat.
- **For Volta (2× V100 32 GB):** used V100 32 GB prices rose about 45 % in three months ($625 at the end of July, $910 at
  the start of November). Driver 580 is the last branch for Volta, CUDA 13 dropped it from offline builds, PyTorch
  2.15 dropped its wheels and vLLM no longer supports it. So: buy the cards soon if Volta goes ahead, freeze driver 580
  with CUDA 12.9, and compile llama.cpp for it. 2× V100 should carry a 70B at 4 bits at roughly 12–18 tok/s (an
  estimate). DDR6 doesn't matter to it.

**What matters in the next twelve months, in order:**
1. Memory prices, not DDR6.
2. Volta's cards and frozen software.
3. A 24 GB card, or a second card.
4. Zen 6.
5. LPDDR6 boxes for 100B+ models.
6. DDR6, AM6, PCIe 6 and CXL: about 2028–30.

**How we know.**
- The rule of thumb and the 67 tok/s ceiling: section 1 (Fractal academia 1.3, 3.12). RAM "about 96 GB/s here": source not recorded (section 1 gives 60–90).
- LPDDR6 and DDR6 timing: "Tom's Hardware, *JEDEC publishes first LPDDR6 standard* (Jul 2025); SamMobile on the Galaxy S27 Ultra's LPDDR6 (28 Mar 2026)" and "Guru3D and PC Games Hardware on DDR6 timing (2026)".
- AM5, Zen 6, Nova Lake: "TechPowerUp, *AMD confirms AM5 compatibility with Olympic Ridge* (26 Aug 2026); Tom's Hardware on AM5 support through 2029, and on Nova Lake's schedule".
- Memory prices: "Tom's Hardware and PC Gamer on DDR5 prices (Nov 2026)".
- Big-memory boxes: "Tom's Hardware on AMD Ryzen AI Halo and on DGX Spark's price rise; ServeTheHome on GB10 prices (Oct 2026); llama.cpp discussion 16578 and NVIDIA forum on Spark vs Strix Halo" and "hardware-corner.net M5 Max benchmarks (2026); Tom's Hardware on Medusa Halo and Gorgon Halo".
- Cards: "TechPowerUp on RTX 50 Super (17 Jul 2026) and RTX 60 timing (21 Sep 2026); TweakTown on RTX PRO 6000 pricing (Aug 2026); llama.cpp discussion 19890 and runaihome.com on the R9700" and "runaihome.com on used RTX 4090s; openclawdc.com on used V100 32 GB (Nov 2026)".
- Disks and SSD streaming: "Tom's Hardware on PCIe 6 SSDs; llama.cpp discussion 23324; LMSYS blog, SGLang SSD expert pack (29 Aug 2026)".
- Volta's software: "NVIDIA developer blog on architecture support; LocalAI issue 9948" and "vLLM forum, *Support for V100 (sm_70) on vLLM 0.20*". The 12–18 tok/s for a 70B on 2× V100 is our estimate.
- The ordered list: our own judgement from the above.

**The idea behind it:** [Quantisation and the VRAM budget](https://derwina-code.github.io/ai-academia/Study%20hub.html#vram), [Mixture of experts and routers](https://derwina-code.github.io/ai-academia/Study%20hub.html#moe)


## 12. New ways to run models locally, mid-2026 to 21 Nov 2026 (read, not measured here)

One reading pass of engine changelogs, model releases and benchmark threads (sources in References, status S; many are
single forum posts or blogs). The question: what would make this PC (5070 Ti 16 GB, Windows) faster or better now.

- **Deeper MTP drafting is worth a fresh sweep.** Community tables for Qwen3.8-27B on 16 GB cards with a q4_0 cache at
  32K found the best `--spec-draft-n-max` at 3–4 (+11 to +19 % over 2-ahead), on newer llama.cpp builds than ours
  (28 Oct). Our own sweep (section 4 above) found 2-ahead slower at 32–36K on a full card. So the lead is to re-sweep
  on a current build, 1 to 4 ahead, at 24K and 36K, before believing either.
- **New drafters** (`draft-dflash2`, `draft-eagle3` and more in llama.cpp; a DFlash2 drafter for this exact model,
  1.14 GB) claim up to 3.4x on datacenter cards. On a consumer card in vLLM it only matched the built-in MTP head, and
  on 16 GB its own memory would squeeze the context. Low priority.
- **NVFP4 on Blackwell** speeds up prompt reading (+68 % on a 5090) but not writing, and a good-quality file is about
  16 GB. Not for this card. ExLlamaV3 reads prompts faster but writes 15–21 % slower than llama.cpp. Not worth a switch.
- **KV cache:** Hadamard rotation is merged into llama.cpp and is said to bring a q4_0 cache close to 4-bit
  "TurboQuant" quality. Lead: check that our build has it, then measure q4_0 against an f16 cache (KL divergence, the
  recall exam) and try a longer context. The 3-bit cache types are still CPU-only, in a fork.
- **Models:** nothing clearly beats a dense 27B at 4 bits for coding on 16 GB. Qwen3.6-35B-A3B with experts in RAM
  (`--n-cpu-moe ~20`) reportedly runs at about 79 tok/s on a 5070 Ti in 12.7 GB of VRAM, about the 27B's speed. The
  case for it would be quality or room for context, and one guide says its coding drops at 3 bits. Gemma 4 26B-A4B is
  already queued for a comparison.
- **Thinking budgets:** llama.cpp's `--reasoning-budget` is now a real cap, but some builds hang with Qwen, and Qwen
  misses a requested budget by 28–69 %. 2026 papers (AdaptThink, Mid-Think) agree that deciding by difficulty whether
  to think at all beats a fixed cap. A lead beside DeepConf.
- **Voice at conversation speed** (the owner's requirement: first sound under about 3 s):
  - **Kyutai's Pocket TTS** (about 100M parameters, two CPU cores, clones a voice from one clip, streams). It claims about
    200 ms to first audio; a third-party Mac test measured 44 ms, against 6.45 s for Chatterbox Turbo. It has Windows
    binaries and a Rust port. The strongest candidate to test against the fast Piper voice being trained.
  - **NeuTTS Air:** 358 ms to first audio, but only 2.2x real time.
  - **Kokoro and Piper:** fast, but no cloning (Piper by training only).
  - **Streaming speech-to-text:**
    - NVIDIA Nemotron Speech Streaming 0.6B: 80 ms chunks, 0.56 s delay on CPU in int4.
    - Kyutai STT 1B: 0.5 s delay, with a semantic end-of-speech detector in its Rust server.
    - Moonshine v2.
    - Any of these could replace whisper's wait-for-silence in Hey Fractal.

**Worth trying here, in order:**
1. An MTP depth re-sweep (no download).
2. Pocket TTS with Fractal's voice (a download).
3. A thinking-budget test on the exam kit.
4. A KV cache quality check.
5. Streaming speech-to-text (a download).
6. Qwen3.6-35B-A3B or Gemma 4 26B-A4B against the 27B, blind (a download).
7. DFlash2, last.

**How we know.**
- MTP depth tables: "sudoingX, qwen38-mtp tables (GitHub, Aug 2026); NVIDIA forum, *Qwen3.8-27B at 256K on a 24 GB Blackwell* (18 Aug 2026); dev.to, *Three months of speed-up experiments on a 3090 Ti* (18 May 2026)". Our own sweep it is set against is Fractal academia 3.11 (this file's section 5, though the text says "section 4"); results `Fractal\runtime\experiments\2026-11-07\mtp\results.json`.
- New drafters: "llama.cpp `docs/speculative.md`; runaihome.com DFlash2 guide (7 Sep 2026); huggingface.co/z-lab/Qwen3.8-27B-DFlash2".
- NVFP4 and ExLlamaV3: "insiderllm.com, FP4 inference guide (30 Sep 2026); atomic.chat, EXL3 vs GGUF (Sep 2026)".
- KV rotation: "github.com/TheTom/turboquant_plus; llama.cpp PR 21089".
- Models: "ai-digest and insiderllm.com on Qwen3.6-35B-A3B; Google blog on Gemma 4".
- Thinking budgets: "antoinezambelli/forge issue 54 (reasoning budget hangs); AdaptThink and Mid-Think (2026)"; DeepConf is "Fu et al. *Deep Think with Confidence*, arXiv 2508.15260".
- Voice: "Kyutai Pocket TTS README; tts-bench (5uck1ess.github.io); Picovoice TTS benchmark" and "nvidia/nemotron-speech-streaming-en-0.6b model card; arXiv 2604.14493; kyutai.org/stt; arXiv 2602.12241 (Moonshine v2)". NeuTTS Air's figures: source not recorded in References.
- The ordered list: our own judgement.

**Proof.**
- Results: `Fractal\runtime\experiments\2026-11-07\mtp\results.json` (our own 7 Nov sweep)

**The idea behind it:** [Speculative decoding](https://derwina-code.github.io/ai-academia/Study%20hub.html#spec), [The KV cache](https://derwina-code.github.io/ai-academia/Study%20hub.html#kv), [Speech synthesis and the latency budget](https://derwina-code.github.io/ai-academia/Study%20hub.html#voice)


## 13. MoE models against the dense 27B on 16 GB, measured (22 Nov 2026) and why (research, 23 Nov)

**In short:** none of four MoE models matched the dense Qwen3.8-27B on the hard general exam. The best came close:
Gemma 4 26B-A4B scored 19/26 against the 27B's 21/26, at 1.57× the speed. The MoE speed edge on this PC is real but
small, except for the weakest model. The research says this is the expected pattern, not a setup mistake.

**Measured** (Fractal academia 3.70; `Fractal\runtime\experiments\2026-11-22\moe\README.md`). Setup: the hard general
exam (26 tasks with hidden tests, greedy, no thinking), and `exam bench speed` (8 long answers). Unsloth UD-Q4_K_XL
files, with llama.cpp's automatic `fit` placing what doesn't fit on the card in RAM.

| Model | Weights used per word / total | File | Score (27B: 21) | Paired with the 27B | Tokens/s (27B: 57.7) |
|---|---|---|---|---|---|
| gpt-oss-20b | 3.6B / 21B | 12.1 GB | 5 of 20 | broke 12, fixed 0 | 175.5 |
| Qwen3.5-35B-A3B | 3B / 35B | 22.2 GB | 18 | broke 4, fixed 1 | 76.1 |
| Qwen3-Coder-30B-A3B | 3B / 30B | 17.7 GB | 8 | broke 14, fixed 1 | 90.3 |
| Gemma 4 26B-A4B | 3.8B / 25B | 17.0 GB | 19 | broke 4, fixed 2 (p 0.69) | 90.5 |

**Why** (research pass of 23 Nov 2026; every number is the source's):
- **Controlled studies** say total parameters buy memorisation, while reasoning tracks the weights used per word:
  - Jelassi et al., *Mixture of Parrots*, ICLR 2025;
  - Abnar et al., arXiv 2501.12370: at equal perplexity, sparser models reason worse;
  - Nakamura et al., arXiv 2508.18672: neither RL post-training nor more thinking time fixes over-sparse models.
- **Makers' own tables**, same family:
  - Gemma 4 26B-A4B against the 31B dense: BigBench Extra Hard 64.8 vs 74.4, Codeforces 1718 vs 2150;
  - Qwen3.5-35B-A3B against the 27B dense: SWE-bench Pro 44.6 vs 51.2.
  - The gaps are widest on the hardest multi-step sets, which is what this exam tests.
- **Our two outliers have known causes:**
  - gpt-oss-20b is a reasoning-only model (its effort setting has no "off"), so testing it without thinking puts it
    outside how it was trained;
  - Qwen3-Coder-30B-A3B is two generations older than the others.
- **Thinking doesn't flip it.** The Artificial Analysis index gap between Qwen3.6-27B and Qwen3.6-35B-A3B is the same
  with reasoning on (37 vs 32) and off (30 vs 24). These numbers came from search snippets, not the page itself.

**Speed: our fit numbers are probably not the best this card can do** (Measured by others, unverified here):
- **Qwen3.6-35B-A3B on a 5070 Ti** with `-fit off --n-cpu-moe 20`: 91.5 tok/s in 12.7 GB, against our 76 with fit.
  - Fit shrinks the context first, then moves expert tensors out, so check the context it chose.
  - Start points: `-t 6` (physical cores), `-ub 512`, a q8_0 KV cache.
  - Sweep N over 16-24 with `llama-bench`.
  - `--moe-cache-mib` (PR #29887, Oct 2026) keeps hot experts on the card. It helps big offloads; at our size it
    gives 1-5 %.
- **Gemma 4 26B-A4B QAT** (14.2 GB) fits wholly on the card: 111.9 tok/s reported on a 5070 Ti. But Unsloth's own
  table gives it only 85.6 % top-1 agreement with the full model, so it needs our exam before anyone trusts it.
- **MTP drafting** (PR #22673) gives dense models +40-60 % (Qwen3.8-27B on a 3090: 41.6 → 66.4 tok/s at n-max 2).
  For MoE it gives about 0-29 %, because checking the draft loads more experts, and it costs context on 16 GB. MTP
  takes back most of the MoE speed edge.

**The general lesson.** On a 16 GB card a dense model of about 27B at 4 bits is still the coding and careful-work
choice. A 3-4B-active MoE is a fast side model: Odysseus's role, or a "quick answers" expert in a team (12). The
"MoE for speed" case is weakest exactly where an agent's hardest work happens.

**How we know.**
- The table (scores, paired broke/fixed, tokens a second): our own measurement, Fractal academia 3.70, with the 27B's 21/26 from Fractal academia 3.67; set-up in `Fractal\runtime\experiments\2026-11-22\moe\README.md`, answers in `Fractal\exam-kit\results\general-hard\m0-gptoss.jsonl`, `m1-trial-qwen35-moe.jsonl`, `m2-trial-coder-moe.jsonl`, `m3-trial-gemma4-moe.jsonl` against `h0.jsonl`, speeds in `Fractal\exam-kit\results\bench\speed-local.summary.json` and the `speed-trial-*-moe.summary.json` files.
- Controlled studies: "Jelassi et al. *Mixture of Parrots: Experts improve memorization more than reasoning*, arXiv 2410.19034 (ICLR 2025)", "Abnar et al. *Parameters vs FLOPs: scaling laws for optimal sparsity in MoE*, arXiv 2501.12370", "Nakamura et al., arXiv 2508.18672 (ICLR 2026)".
- Makers' tables: "Model cards: Qwen3.6-35B-A3B, Qwen3.8-27B, Gemma 4 26B-A4B and 31B; Unsloth Gemma 4 QAT page" (status C).
- The Artificial Analysis gap: search snippets only; source not recorded in References.
- Offload speeds and flags: "Doctor-Shotgun, *llama.cpp MoE offload guide*, huggingface.co/blog/Doctor-Shotgun/llamacpp-moe-offload-guide", "llama.cpp PR #29887 (`--moe-cache-mib`), PR #22673 (MTP), PR #23398 (Gemma 4 MTP); server and fit-params READMEs" and "hackmd.io/@thc1006 (Qwen3.8-27B MTP on a 3090); dev.to/rosgluk (MTP on 16 GB); qiita.com/rS_alonewolf (Gemma 4 QAT on a 5070 Ti)".

**Proof.**
- Results: `Fractal\exam-kit\results\general-hard\m3-trial-gemma4-moe.jsonl`, `Fractal\exam-kit\results\general-hard\h0.jsonl`, `Fractal\exam-kit\results\bench\speed-trial-gemma4-moe.summary.json`, logs `Fractal\runtime\experiments\2026-11-22\moe\trials_m123.log`
- Code: `Fractal\exam-kit\src\general.rs`, `Fractal\exam-kit\src\pair.rs`, `Fractal\exam-kit\src\speed.rs`
- Check it yourself: `exam.exe general report results\general-hard\m3-trial-gemma4-moe.jsonl results\general-hard\h0.jsonl` (from `Fractal\exam-kit`)

**The idea behind it:** [Mixture of experts and routers](https://derwina-code.github.io/ai-academia/Study%20hub.html#moe), [Paired comparison and the sign test](https://derwina-code.github.io/ai-academia/Study%20hub.html#paired), [Hidden tests and held-out exams](https://derwina-code.github.io/ai-academia/Study%20hub.html#hidden)

