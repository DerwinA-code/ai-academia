# References

**Status key:**
- **R:** read during the projects;
- **S:** summarised from search results, abstracts or press coverage;
- **B:** background, a well-known paper the work builds on;
- **C:** a claim by the maker, not checked by us.

## Papers

| Source | Topic | Used in | Status |
|---|---|---|---|
| Behrouz, Hashemi, Javanmard, Mirrokni. *Language Models Need Sleep*, arXiv 2606.03979 (2026); Google Research blog, 27 Oct 2026 | Consolidation and dreaming | 05, 06 | R |
| Lindenbauer et al. (JetBrains). *The Complexity Trap*, arXiv 2508.21433 | Masking vs summarising context | 04 | R |
| Xu, Chen, …, Lee, Pfister. *Harness²: Recursive Agent Harnessing for an Open World*, arXiv 2610.14224; github.com/google-research/harness2 (its `core/prompts.py` and `core/library.py` read 13 Nov 2026) | Harness refinement | 03 | R |
| Zhang et al. *Agentic Context Engineering* (ACE), arXiv 2510.04618 | Growing playbooks | 06 | S |
| Ilharco et al. *Editing Models with Task Arithmetic*, arXiv 2212.04089 | Fine-tunes as changes that add and scale | 06 | B |
| Wortsman et al. *Model soups*, arXiv 2203.05482 | Averaging fine-tuned weights | 06 | B |
| Yadav et al. *TIES-Merging: Resolving Interference When Merging Models*, arXiv 2306.01708 | Trim, elect signs, merge | 06 | B |
| Yu et al. *Language Models are Super Mario* (DARE), arXiv 2311.03099 | Drop changes at random and rescale | 06 | B |
| Zheng et al. *Weak-to-Strong Extrapolation Expedites Alignment* (ExPO), arXiv 2404.16792 | Pushing a fine-tune further by arithmetic | 06 | S |
| *Family Matters*, arXiv 2510.00810 | Merging small LLMs: merged models weaker than their parts in one language study | 06 | S |
| *Compress then Merge*, arXiv 2606.03723 | TIES-style merges leave the space the LoRAs span; plain addition preferred | 06 | S |
| *Merge to Mix*; *MergeMix*, arXiv 2601.17858 | Averaged fine-tunes as a cheap stand-in for training on a data mixture | 06 | S |
| *Self-Improving AI Coding Agents Through Accumulated Behavioral Rules*, arXiv 2607.13091 | Rules as files | 06 | S |
| Gutiérrez et al. *HippoRAG*, arXiv 2405.14831; *HippoRAG 2*, arXiv 2502.14802 | PageRank recall | 05 | B |
| Xu et al. *A-MEM*, arXiv 2502.12110 | Linked notes | 05 | B |
| Park et al. *Generative Agents*, arXiv 2304.03442 | Reflections | 05 | B |
| Brin & Page (1998); Haveliwala, *Topic-Sensitive PageRank* (2002) | PageRank | 05 | B |
| Singh et al. *Beyond Human Data* (ReST-EM), arXiv 2312.06585 | Self-practice | 06 | B |
| Leviathan, Kalman, Matias. *Fast Inference from Transformers via Speculative Decoding*, arXiv 2211.17192 | Speculative decoding | 01 | B |
| Gloeckle et al. *Multi-token Prediction*, arXiv 2404.19737; DeepSeek-V3 report, arXiv 2412.19437 | MTP | 01 | B |
| Liu et al. *KIVI*, arXiv 2402.02750 | Low-bit KV cache | 01 | B |
| Dettmers et al. *QLoRA*, arXiv 2305.14314 | Fine-tuning | 06 | B |
| *Wait, We Don't Need to "Wait"!*, arXiv 2506.08343 | NoWait | 06 | S |
| *ThinkBrake*, arXiv 2510.00546 | Loop stopping | 06 | S |
| Fu et al. *Deep Think with Confidence*, arXiv 2508.15260 | Confidence stopping | 10 | B |
| Turner et al. *Activation Engineering* (ActAdd), arXiv 2308.10248 | Steering vectors | 06 | B |
| Mündler et al. *Type-Constrained Code Generation*, arXiv 2504.09246 | Type errors in AI code | 03 | S |
| SWE-bench Multilingual; Multi-SWE-bench, arXiv 2504.02605 | Languages for agents | 03 | S |
| Cassano et al. *MultiPL-E*, arXiv 2208.08227 | Rust benchmark | 03 | B |
| Liu et al. *EvalPlus* (HumanEval+, MBPP+), arXiv 2305.01210; Jain et al. *LiveCodeBench*, arXiv 2403.07974 | Code evals | 02 | B |
| *Online Vector Quantization with Near-optimal Distortion Rate* (TurboQuant), arXiv 2504.19874 | Vector compression | 05 | S |
| CTXAgent 2610.34425; Self-GC 2607.00692; *LLM Agents Are Latent Context Managers* 2606.30005; TokenPilot 2606.17016; SWE-Pruner 2601.16746; *Harness Design for Coding Agents* 2609.20804 | Context-management leads | 04 | S |

## Software, docs and model cards

| Source | Topic | Status |
|---|---|---|
| Unsloth docs, *Dynamic 2.0 GGUFs* | Per-layer quantization with a chat-tuned calibration set; judged by KL divergence (maker's numbers) | C |
| *Laguna-S-2.1 β imatrix calibration study* (Hugging Face) | What the calibration text does to an importance matrix; helps most at low bit widths (their claim) | S |
| llama.cpp, `llama-imatrix` and `llama-quantize --imatrix`, as run on 12 Nov 2026 | Importance-matrix quantization; with a matrix, the Q4_0 file came out with its first three `ffn_down` tensors (of 28) as Q4_1 | R |
| llama.cpp b11946: router mode, `--spec-type draft-mtp / ngram-mod` (PRs #22673, #23269) | Inference | R |
| hydro-project/infinity on GitHub (Apache 2.0; not run here) | Agent runtime | C |
| Qwen model cards (Qwen3.8-27B, Qwen3.5-4B, Qwen3-TTS) | Sampling, thinking, voice | R |
| NVIDIA CUDA 13 release notes (Volta removed); RTX 5070 Ti spec (896 GB/s) | Hardware | R / S |
| Microsoft Docs: `Windows.Media.Ocr`, `Windows.Data.Pdf`, DPAPI | OCR, secrets | R |
| RFC 5545 (iCalendar), RFC 3501 (IMAP) | Calendars, mail | B |
| lyogavin/airllm (README) and its 2023 blog post | Layer streaming | R |
| Anthropic, *Agent Skills* (Oct 2025) | Skills | B |
| Anthropic, context editing and compaction guidance; Manus, *Context Engineering for AI Agents* | Context | S |
| turbovec (github.com/RyanCodrai/turbovec, PyPI) | Vector search | R, benchmarks C |
| Understand-Anything (Egonex-AI); Graphify (Graphify-Labs) | Code graphs | S |
| Strata (Niko1221/Strata); Qwen3.8-Flash-Next model card | MoE on consumer hardware | S, C |
| WiCi Infer product page; "Running 800B-Parameter LLMs on Consumer Hardware with InferSSD" (WiCi Research, 29 Oct 2026); wici-ai/inferssd | 800B-class MoE models with experts streamed from the SSD; the five mechanisms; drive wear from heavy reading | R, C |
| kimi-k3-in-c (FareedKhan-dev/kimi-k3-in-c), README; found through an Instagram reel by princegupta.ai | A 2.78T-parameter MoE streamed from disk in 8 GB of RAM; careful measuring of memory limits, storage and caches | R, C |
| Kyutai Unmute; Pipecat; LiveKit Agents (turn detection) | Streaming voice | S |
| Voice models on Hugging Face/PyPI: Kokoro, Silero VAD, Smart Turn v3, Moonshine, Qwen3-TTS, Chatterbox Turbo, Breeze TTS 2, CosyVoice2, OmniVoice, Kyutai TTS, Parakeet | Voice | S, speeds C |
| VoiceStudio (debpalash/VoiceStudio) | Voice tooling | S |
| BentoML, Picovoice and findskill.ai TTS round-ups; channel.tel latency budget | Voice speed | S |
| Piper (piper1-gpl) training docs | Phone voice training | R |

## Blogs, posts and reels

| Source | Topic | Status |
|---|---|---|
| Data Meerkat, *I built my "AI Brain" in Obsidian. Then I had to tear it down* | Graph memory | R |
| A Reddit post on a ~15-year personal Obsidian vault (pasted by the user) | Folding, merging, use counts | R |
| Huw Prosser, "Some thoughts on JARVIS" (huwprosser.com, 12 May 2026), Rose reels | Two-speed assistants | R |
| tonythetechie (Kara) reels and comments | AI interfaces | R |
| Thinking Machines "interaction models" (press coverage) | Full-duplex assistants | S |
| cooper.simson, "I don't think you should build AI agents anymore" (reel) | Playbooks, not agents | R |
| rick_morty.tech, reel on Rust for AI-written code | Languages | R |
| charlieautomates, "BASE" second brain (reel) | Memory products | R |
| marc.kaz, reel on turbovec | Vector search | R |
| lukebuildsai, "Azaris" (reel) | Agent platforms | R |
| GrindPilot documentary (8 Nov 2026) and Fractal's review of it | Game agents, exams, brains | R |
| ariacodez, reel "change one word in a GitHub URL" (19 Sep 2026): gitdiagram, gitingest, github.dev, DeepWiki, GitMCP | Agents reading code repos | C |
| 3eyes.iii, reel on Pino (29 Oct 2026); pinos.world pages "How Pino works", "Pino's brain", "Pino's memories" and developer docs with their live data; three.js forum post (23 Aug 2026); github.com/pino-the-bird | A long-running AI character: needs, small memory, add-only character sheet | R |
| 3eyes_iii, article on X "Pino - An Autonomous AI bird living in a small town on the internet" (could not be opened; search summary only) | Model tiers, fallbacks, memory files | S |
| algorithmswithpeter, reel "Stop paying for APIs" (18 Oct 2026); the list it matches, public-apis/public-apis on GitHub, README counted 12 Nov 2026 (2,378 services, 52 categories, 29 MCP servers) | Free data services as tools for an assistant | R |
| itisjiwan, reel on Infinity (26 Oct 2026); AWS Open Source blog, *Introducing Infinity: a runtime for extreme agent concurrency* (23 Oct 2026); The Agent Report, *AWS Infinity Fits 75,000 Idle Agents in 8 GB — Until You Count the Turns*; PBX Science and datastudios.org write-ups | Agents put down at tool calls and picked up again | S |
| Dr. Alvaro Cintas, weekly AI news reel (Instagram, Nov 2026): Hy-MT2, Qwen-Image-2.1-Turbo, REA, Alook, PhotoCraft, MiMo-V2.6-Pro; caption read 14 Nov 2026 | News; one lead | 10 | S |
| NVIDIA: the 580 driver branch is the last for Maxwell, Pascal and Volta (2025 notice; NVIDIA developer forum, Jan 2026: V100 ignored by 590) | Volta's set-up | 11 | S |
| Kumbong, Khare, Mlauzi, Woen, Ding, Buchanan, Arora, Mirhoseini, Ré. *Next-Concept Modeling: Fast, Parallel Coarse-to-Fine Text Generation.* arXiv 2610.14162 (Oct 2026); Hazy Research blog, 12 Oct 2026; code github.com/HazyResearch/ncm (MIT). Abstract, blog and README read 16 Nov 2026 | Coarse-to-fine generation | 01 | S |
| Floorplan, github.com/haydenschmitty/floorplan (README, plugin manifest and package.json read 14 Nov 2026; MIT, v0.8.0); named by a comment under the gittested reel | Codebase maps | 10 | S |
| Obscura, github.com/h4ckf0r0day/obscura (README read 14 Nov 2026; Apache-2.0); named by the top comment under the prompts_backlog reel, not by the reel | Headless browser for agents, in Rust | 03 | S |
| Lightpanda, github.com/lightpanda-io/browser (README read 14 Nov 2026; AGPL-3.0); reel by prompts_backlog (5 Nov 2026), which doesn't name it | Headless browser for agents | 03 | S |
| Makazhan, A. *Exact Layer Streaming: LoRA Fine-Tuning of an 8B Model on a 4 GB Laptop GPU*, v3, Zenodo 2026, doi 10.5281/zenodo.21918325; the Soup README, github.com/MakazhanAlpamys/Soup (v0.77.2, read 14 Nov 2026); reel by martintrainhard (1 Sep 2026) | Layer streaming for training | 06 | S |
| champmack, reel "Claude can now watch YouTube videos for you and learn any skill" (5 Nov 2026), caption only; the skill it offers was not seen | Learning from videos | C |

## Self-improvement research pass (21 Nov 2026; for 06 section 10)

| Source | Topic | File | Status |
|---|---|---|---|
| Agrawal et al., *GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning*, arXiv 2507.19457; github.com/gepa-ai/gepa | Prompt optimisation | 06 | S |
| Sarukkai et al., *Self-Generated In-Context Examples Improve LLM Agents*, arXiv 2505.00234 | Experience reuse | 06 | S |
| Ouyang et al., *ReasoningBank*, arXiv 2509.25140; Google Research blog | Lessons from failures | 06 | S |
| *Training-Free GRPO*, arXiv 2510.08191 | Lessons from group comparison | 06 | S |
| Wang et al., *Agent Workflow Memory*, arXiv 2409.07429; Suzgun et al., *Dynamic Cheatsheet*, arXiv 2504.07952 | Experience reuse | 06 | C |
| Lin et al., *Sleep-time Compute*, arXiv 2504.13171 | Idle-time thinking | 06 | C |
| Robeyns et al., SICA, arXiv 2504.15228; Zhang et al., *Darwin Gödel Machine*, arXiv 2505.22954 | Self-modifying agents | 06 | S |
| Li et al., S*, arXiv 2502.14382; Brown et al., *Large Language Monkeys*, arXiv 2407.21787 | Best-of-n with checkers | 06 | C |
| Thinking Machines, *On-Policy Distillation* (blog, 2025) | Distillation | 06 | R |
| *Reinforcement Learning for Reasoning in Small LLMs*, arXiv 2503.16219; Yue et al., arXiv 2504.13837; *Spurious Rewards* and its contamination critique, arXiv 2507.10532 | RL on small models | 06 | S |
| Shenfeld et al., *RL's Razor*, arXiv 2509.04259 | Forgetting | 06 | S |
| Qian et al., *ToolRL*, arXiv 2504.13958 | Tool-use RL | 06 | S |
| Ethayarajh et al., KTO, arXiv 2402.01306 | Preference training | 06 | C |
| Panickssery et al., *LLM Evaluators Recognize and Favor Their Own Generations*, arXiv 2404.13076 | Self-preference | 06 | S |
| Hamidieh et al., arXiv 2604.17112; Gorbett and Jana, arXiv 2603.25450 | Cross-model disagreement | 06 | S |
| Zhong et al., *ImpossibleBench*, arXiv 2510.20270; EvilGenie critique, arXiv 2511.21654 | Reward hacking | 06 | S |
| METR, *Recent frontier models are reward hacking* (5 Jun 2025) | Reward hacking | 06 | S |
| Anthropic, *Natural emergent misalignment from reward hacking*, arXiv 2511.18397 | Reward hacking | 06 | S |
| Subramaniam et al., *Multiagent Finetuning*, arXiv 2501.05707 | AIs training each other | 06 | S |
| vLLM forum, *Support for V100 (sm_70) on vLLM 0.20* | Volta's set-up | 06 | S |

## Hardware outlook (21 Nov 2026; for 01 section 11)

| Source | Topic | File | Status |
|---|---|---|---|
| Tom's Hardware, *JEDEC publishes first LPDDR6 standard* (Jul 2025); SamMobile on the Galaxy S27 Ultra's LPDDR6 (28 Mar 2026) | LPDDR6 | 01 | S |
| Guru3D and PC Games Hardware on DDR6 timing (2026) | DDR6 | 01 | S |
| TechPowerUp, *AMD confirms AM5 compatibility with Olympic Ridge* (26 Aug 2026); Tom's Hardware on AM5 support through 2029, and on Nova Lake's schedule | Platforms | 01 | S |
| Tom's Hardware and PC Gamer on DDR5 prices (Nov 2026) | Memory prices | 01 | S |
| Tom's Hardware on AMD Ryzen AI Halo and on DGX Spark's price rise; ServeTheHome on GB10 prices (Oct 2026); llama.cpp discussion 16578 and NVIDIA forum on Spark vs Strix Halo | Unified-memory boxes | 01 | S |
| hardware-corner.net M5 Max benchmarks (2026); Tom's Hardware on Medusa Halo and Gorgon Halo | Apple and AMD APUs | 01 | S |
| TechPowerUp on RTX 50 Super (17 Jul 2026) and RTX 60 timing (21 Sep 2026); TweakTown on RTX PRO 6000 pricing (Aug 2026); llama.cpp discussion 19890 and runaihome.com on the R9700 | GPUs | 01 | S |
| runaihome.com on used RTX 4090s; openclawdc.com on used V100 32 GB (Nov 2026) | Used cards | 01 | S |
| Tom's Hardware on PCIe 6 SSDs; llama.cpp discussion 23324; LMSYS blog, SGLang SSD expert pack (29 Aug 2026) | Disks and streaming | 01 | S |
| NVIDIA developer blog on architecture support; LocalAI issue 9948 | Volta's software | 01, 11 | S |
| sudoingX, qwen38-mtp tables (GitHub, Aug 2026); NVIDIA forum, *Qwen3.8-27B at 256K on a 24 GB Blackwell* (18 Aug 2026); dev.to, *Three months of speed-up experiments on a 3090 Ti* (18 May 2026) | MTP depth | 01 | S |
| llama.cpp `docs/speculative.md`; runaihome.com DFlash2 guide (7 Sep 2026); huggingface.co/z-lab/Qwen3.8-27B-DFlash2 | New drafters | 01 | S |
| insiderllm.com, FP4 inference guide (30 Sep 2026); atomic.chat, EXL3 vs GGUF (Sep 2026) | NVFP4, ExLlamaV3 | 01 | S |
| github.com/TheTom/turboquant_plus; llama.cpp PR 21089 | KV cache rotation | 01 | S |
| ai-digest and insiderllm.com on Qwen3.6-35B-A3B; Google blog on Gemma 4 | Models | 01 | S |
| Kyutai Pocket TTS README; tts-bench (5uck1ess.github.io); Picovoice TTS benchmark | Fast TTS | 01, 07 | S |
| nvidia/nemotron-speech-streaming-en-0.6b model card; arXiv 2604.14493; kyutai.org/stt; arXiv 2602.12241 (Moonshine v2) | Streaming STT | 01, 07 | S |
| antoinezambelli/forge issue 54 (reasoning budget hangs); AdaptThink and Mid-Think (2026) | Thinking budgets | 01 | S |
| Fan et al., *Language Models Can Rewrite Their Own Weights*, arXiv 2611.21885 (v2, 18 Nov 2026); Better Stack short youtube.com/shorts/VyzoltTI_NA | Self-editing weights | 06 | R |
| Nous Research, *Hermes Agent* README and docs (github.com/NousResearch/hermes-agent, hermes-agent.nousresearch.com/docs); saulius.io audit (Apr 2026); arXiv 2608.12851 (*Practice Makes Unsafe: Skill Misevolution*, v2 Oct 2026) | Self-improving agent: memory, skills, curator | 06 | R/S |

## Research pass of 23 Nov 2026 (for 06 section 13)

| Source | Topic | Used in | Status |
|---|---|---|---|
| Mittal, *Did You Forget What I Asked? Prospective Memory Failures in LLMs*, arXiv 2603.23530; Laban et al., arXiv 2505.06120; arXiv 2605.12922 | Rules fading, trailing reminders | 06 | R / S |
| Zhu, Lim, Kan, *When Models Edit Too Much*, arXiv 2609.04061; CROCODIL arXiv 2609.03894 | Doing more than asked; RL vs SFT | 06 | R / S |
| CURE arXiv 2506.03136; Sol-Ver arXiv 2502.14948; arXiv 2411.05010; arXiv 2506.18315; arXiv 2509.20837 | Self-tests, small RL for code | 06 | S |
| MemoryAgentBench arXiv 2507.05257; ConvoMem arXiv 2511.10523; Penfield Labs LoCoMo audit (substack) | Memory benchmarks | 05, 06 | R / S |
| *Learning by Doing* (Zep Agent Skills) arXiv 2611.01386; MemoryGraft arXiv 2512.16962; EvoBreak arXiv 2608.01759; arXiv 2608.08303, 2608.05563 | Skill curation, memory poisoning | 06 | R / S |
| Bowyer et al. arXiv 2503.01747; Miller arXiv 2411.00640; arXiv 2512.21326 | Error bars on small evals | 02, 06 | R / S |
| sudoingX/qwen38-mtp (GitHub); dev.to rosgluk Qwen 27B MTP on 16 GB; llama.cpp PR 22673; Unsloth GGUF benchmarks | MTP, KV quantisation, quants | 01, 06 | R / S |

## Research pass, 23 Nov 2026 (night): MoE, LoRA teams and forgetting, agent auditing

| Source | Topic | Used in | Status |
|---|---|---|---|
| Jelassi et al. *Mixture of Parrots: Experts improve memorization more than reasoning*, arXiv 2410.19034 (ICLR 2025) | MoE and reasoning | 01 | S |
| Abnar et al. *Parameters vs FLOPs: scaling laws for optimal sparsity in MoE*, arXiv 2501.12370 | Sparsity and reasoning | 01 | S |
| Nakamura et al., arXiv 2508.18672 (ICLR 2026) | Over-sparse MoE: memorisation vs reasoning | 01 | S |
| llama.cpp PR #29887 (`--moe-cache-mib`), PR #22673 (MTP), PR #23398 (Gemma 4 MTP); server and fit-params READMEs | Offload, caching, drafting | 01 | S |
| Doctor-Shotgun, *llama.cpp MoE offload guide*, huggingface.co/blog/Doctor-Shotgun/llamacpp-moe-offload-guide | `-ot`, `--n-cpu-moe` | 01 | S |
| Model cards: Qwen3.6-35B-A3B, Qwen3.8-27B, Gemma 4 26B-A4B and 31B; Unsloth Gemma 4 QAT page | Makers' scores | 01 | C |
| hackmd.io/@thc1006 (Qwen3.8-27B MTP on a 3090); dev.to/rosgluk (MTP on 16 GB); qiita.com/rS_alonewolf (Gemma 4 QAT on a 5070 Ti) | Measured speeds | 01 | S |
| Gekhman et al. *Does fine-tuning LLMs on new knowledge encourage hallucinations?*, arXiv 2405.05904 | Facts in fine-tuning | 06 | S |
| Biderman et al. *LoRA Learns Less and Forgets Less*, arXiv 2405.09673; Thinking Machines, *LoRA Without Regret* (2025) | LoRA capacity and forgetting | 06 | S |
| Dong et al. *How abilities in LLMs are affected by SFT data composition*, arXiv 2310.05492 | Data mixing | 06 | S |
| Yang et al. *Self-Distillation Fine-Tuning* (SDFT), arXiv 2402.13669 | Keeping skills while fine-tuning | 06 | S |
| Gudibande et al. *The False Promise of Imitating Proprietary LLMs*, arXiv 2305.15717; Chen et al., arXiv 2410.15226 | One teacher, data diversity | 06 | S |
| Dou et al. *LoRAMoE*, arXiv 2312.09979; Ostapenko et al. *Arrow*, arXiv 2405.11157; Huang et al. *LoraHub*, arXiv 2307.13269; Kong et al. *LoRA-Switch*, arXiv 2405.17741 | Teams of add-ons | 06, 12 | S |
| Apple, *Introducing Apple's On-Device and Server Foundation Models* (2024) | Swapped task adapters on device | 06 | C |
| Greenblatt et al. *AI Control*, arXiv 2312.06942; Bhatt et al. *Ctrl-Z*, arXiv 2504.10374; SHADE-Arena, arXiv 2506.15740 | Monitoring agents | 12 | S |
| OpenAI, *How we monitor internal coding agents* (Mar 2026); Anthropic, *Claude Code auto mode* (engineering post) | Monitors in production | 12 | C |
| Terekhov et al., arXiv 2510.09462; Nasr, Carlini et al. *The Attacker Moves Second*, arXiv 2510.09023; Remedios et al., arXiv 2609.19587 | Injection against monitors | 12 | S |
| Hines et al. *Spotlighting*, arXiv 2403.14720; Debenedetti et al. *CaMeL*, arXiv 2503.18813 | Designs that resist injection | 12 | S |
| Schneier and Kelsey 1998; Crosby and Wallach, USENIX Security 2009 | Tamper-evident logs | 12 | B |
| CVE-2025-53773 (embracethered.com); Nx "s1ngularity" (wiz.io); Replit incident (oecd.ai); OWASP Top 10 for Agentic Applications (Dec 2025) | Incidents and guidance | 12 | S |
| Vectra, *2023 State of Threat Detection*; Prometheus Alertmanager docs; Google SRE book, ch. 6 | Alert fatigue | 12 | S |
