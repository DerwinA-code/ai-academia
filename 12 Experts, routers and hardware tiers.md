# 12 Experts, routers and hardware tiers

**The idea (the user, 21 Nov 2026).** An all-rounder rarely beats a specialist at the specialist's own task. So
each AI in Lattice should be a small team: several expert models, each pushed as far as it goes on one skill, and a
router that sends each request to the right expert and passes on what none of them can do. Ruby does this on the
phone, Fractal at a bigger scale on the PC, Volta at a bigger scale again on its own machine. Each tier is tuned for
the hardware it runs on.

Status: **measured in part** (23 Nov 2026). Section 2 is the reason for the plan; Ruby's team passes on paper (s8); no MoE replaces Fractal's 27B; the auditor is built (s7, s9).

## 1. The shape

```
            request
               |
            router  (rules first, then a small classifier if the rules aren't sure)
         /     |      \
   expert A  expert B  expert C      each maxes out one skill on this machine
         \     |      /
      can't do it here? --> hand it up one tier (phone -> PC -> Volta), with the reason
```

Three rules apply on every tier:
- **Each expert keeps its own exam.** It replaces the expert it competes with only if it wins on that exam, paired,
  over several seeds (the 12 Nov rule, see 02). An expert is never judged on a skill it isn't meant for.
- **The router has its own exam too**: a labelled set of requests with the right expert for each, written before any
  result. A team is only as good as its routing. A wrong route can lose more than a good expert gains.
- **The whole team is judged against the best single model**, on the same exams, before it replaces it. If the team
  can't beat the all-rounder there, the team isn't adopted (the "prove quality first" rule).

**How we know.**
- The idea is the user's (21 Nov 2026), as quoted at the top of this file. The paired rule over several seeds is the 12 Nov rule (02; Ruby academia 3.9). The plan for Ruby: `Ruby\docs\EXPERTS.md`.
- A design, not a measurement.

**The idea behind it:** [Mixture of experts and routers](file:///E:/AI%20academia/Study%20hub.html#moe), [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired)


## 2. Why: one small brain trades skills against each other (Measured, Ruby, 21 Nov 2026)

On a 1.7B model, each skill learned costs another one:
- **Round 6** (Ruby academia 3.16): all four candidates learned her facts better than v5, but chatted a little worse.
  None passed.
- **Round 7** (3.18) added everyday chats written by Fractal's model, to win the conversation back:
  - **7a**, with 400 chats: 54 answers better than v5 and 62 worse. That is no real difference (sign test 0.52).
  - **7b**, with 800 chats: 47 better and 88 worse. That is **clearly worse** (0.0005). Most of the losses came on the
    talk exam (17 better, 41 worse) and the new-skills exam (6 better, 15 worse).
  - Unwanted actions fell in both, from v5's 7 to 2 and 1. That is the one gain, and it wasn't enough to pass rule B.
- **The lesson:** a small model has limited room. Pushing more of one skill into it squeezes the others out. So keep
  the skills in separate experts instead of piling them into one model.
- **Caveat:** the chat data may also have been the problem. It came from one teacher, in one style. Splitting the
  skills tests the first explanation directly.

**How we know.**
- Round 6: our measurement, Ruby academia 3.16; `Ruby\docs\research\2026-11-21\ruby_brain_v6\run_v6.log` and `run_v6bc.log`, `run_v6e.log` there.
- Round 7 (54/62, sign 0.52; 47/88, 0.0005; talk 17/41; new skills 6/15; unwanted actions 7 to 2 and 1): Ruby academia 3.18; `Ruby\docs\research\2026-11-21\ruby_brain_v7\README.md` (its table matches), `result_ruby-v7a.json` and `result_ruby-v7b.json` there.
- The lesson and the one-teacher caveat: our reading of those results.

**Proof.**
- Results: `Ruby\docs\research\2026-11-21\ruby_brain_v7\result_ruby-v7a.json`, `Ruby\docs\research\2026-11-21\ruby_brain_v7\result_ruby-v7b.json`, log `Ruby\docs\research\2026-11-21\ruby_brain_v7\run_v7.log`

**The idea behind it:** [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired), [LoRA fine-tuning](file:///E:/AI%20academia/Study%20hub.html#lora), [Distillation into a small model](file:///E:/AI%20academia/Study%20hub.html#distill)


## 3. The tiers

| Tier | Hardware | Experts that fit | Switching an expert costs |
|---|---|---|---|
| **Ruby** (phone) | Galaxy S24 Ultra: phone CPU, 12 GB RAM, plenty of storage | One 1.7B base (~1 GB at Q4_0) with small **LoRA add-ons** (tens of MB each): talk, facts and actions, and later phone driving (3.17) | Near zero. The base stays loaded and only the add-on changes. A second whole model costs RAM and a load of several seconds |
| **Fractal** (PC) | RTX 5070 Ti 16 GB, 31 GB RAM | One expert of about 13 GB on the card at a time (the 27B today), others waiting on disk; small helpers on the CPU. An MoE of 20-35B (3-4B used per word) fits with part in RAM and runs several times faster than the dense 27B (s6) | About 10–30 s to swap a GPU model, as measured with the Odysseus router swap (01 s6). So experts must be chosen per task, not per sentence |
| **Volta** (own machine) | 2× V100 16 GB, T10 16 GB, 64 GB RAM (not built yet) | Two or three experts loaded side by side, one per card: e.g. a big coder, a long-reading model, and media | Zero between loaded experts. That is the point of the tier: the slow jobs and the experts that don't fit on the PC |

**How we know.**
- Volta's hardware (2× V100 16 GB, T10, 64 GB): Volta academia 3.6 and its timeline (10 Nov).
- About 20 s to swap a 26B model in: 01 section 6 (the Odysseus router swap); the 10–30 s range is an estimate around it.
- The MoE fitting with part in RAM: 01 section 13 (Fractal academia 3.78).
- The phone's 12 GB and the add-on sizes ("tens of MB"): source not recorded in a project record.

**The idea behind it:** [Mixture of experts and routers](file:///E:/AI%20academia/Study%20hub.html#moe), [Quantisation and the VRAM budget](file:///E:/AI%20academia/Study%20hub.html#vram), [LoRA fine-tuning](file:///E:/AI%20academia/Study%20hub.html#lora)


## 4. What each tier should test first

- **Ruby: talk + facts, split.** v5 stays the talk expert, because it is still the best at chat. A facts expert is
  trained on round 6's facts data. A rule router sends questions about the user's own facts, schedule and settings to
  the facts expert, and everything else to v5.
  - **Cheapest proof:** pick, offline, between answers the experts already gave on the existing exams, routing on the
    user's message alone with rules written first. This needs no new training and only minutes of CPU time.
  - Plan: `Ruby\docs\EXPERTS.md`.
- **Fractal: an MoE in place of the 27B, and/or smaller experts** (the user, 22 Nov: the 27B "might be too big on
  the pc", gpt-oss-20b feels over three times faster). Four MoE tries, on `exam general --set hard`, where the 27B
  scores 21/26, plus a speed test.
  - M0, gpt-oss-20b, is already on the PC and started 22 Nov. M1 Qwen3.5-35B-A3B, M2 Qwen3-Coder-30B-A3B and M3
    Gemma 4 26B-A4B wait for a download yes (57 GB).
  - Plan and rule: `Fractal\runtime\experiments\2026-11-22\moe\README.md`. A coding specialist is try M2.
  - Any switch reopens the 9 Nov "one model" decision, which is the user's.
- **Volta:** nothing until the machine exists. The job list (11 s3) already has a slot per job type, so each slot can
  name its expert.

**How we know.**
- Plans, not results: Ruby's in `Ruby\docs\EXPERTS.md`; Fractal's in `Fractal\runtime\experiments\2026-11-22\moe\README.md` (Fractal academia 3.70, with the user's 22 Nov words).
- The 27B's 21/26 on the hard exam: Fractal academia 3.67; `Fractal\exam-kit\results\general-hard\h0.jsonl`.
- The 57 GB download and file sizes: Fractal academia 3.70.

**Proof.**
- Results: `Fractal\exam-kit\results\general-hard\h0.jsonl`

**The idea behind it:** [Mixture of experts and routers](file:///E:/AI%20academia/Study%20hub.html#moe), [Hidden tests and held-out exams](file:///E:/AI%20academia/Study%20hub.html#hidden)


## 5. Things that will go wrong (expected, from what we know)

- **A router that is always confident.** Rules are exact but narrow. A classifier covers more but guesses. Use rules
  first, the classifier second, and a default expert when both are unsure. Log every route, so routing mistakes show up
  in the audit log.
- **Handing up a tier is slow.** A trip from the phone to the PC takes seconds (Tailscale, then the 27B). Hand up only
  what the phone really can't do, and say so in the reply.
- **Expert drift.** Each expert gets better on its own exam while the team gets worse overall. So the team exam always
  runs again before any one expert is replaced.

**How we know.**
- Expectations reasoned from the sections above (routing, Tailscale hand-up, expert drift); not measured. Source not recorded beyond this text.

**The idea behind it:** [Mixture of experts and routers](file:///E:/AI%20academia/Study%20hub.html#moe)


## 6. Separate experts or one MoE? (written 22 Nov 2026, at the user's question)

An MoE (mixture of experts) has its "experts" inside one model: a learned router picks a few of them **for every word,
at every layer**. They don't map to skills a person would name, and none can be trained, swapped or tested alone.

| | One big MoE | Separate expert models |
|---|---|---|
| Speed | A big model's knowledge at a small model's speed: only about 3-4B weights work per word. That is why gpt-oss-20b feels over 3× faster than the dense 27B | Each is as fast as its own size; swapping one GPU model costs 10-30 s |
| Memory | All of it must be held, though little is used. Part can sit in system RAM (llama.cpp expert offload) with some loss of speed | Only the one in use, others wait on disk (cheap: storage) |
| Mixed requests ("write this code and explain it kindly") | Natural, everything at once | Awkward: split, or send to the generalist |
| Routing mistakes | None from our side (learned with the model) | Possible; the router needs its own exam |
| Improving one skill | Replace the whole model; fine-tuning an MoE is costly and can upset its routing | Train, test and swap one expert at a time, which fits how we already judge brains |
| Seeing why | Hidden | Every route is in the log, and the owner can overrule it |
| Phone | Nothing at MoE quality fits | LoRA add-ons on one base |

**Not either/or.** One expert in a team can be an MoE. The likely shape:
- Ruby: LoRA experts.
- Fractal: an MoE generalist, if M0-M3 find one that matches the 27B, with a specialist beside it where one wins
  clearly.
- Volta: a big MoE across its cards, plus specialists on the T10.

**How we know.**
- A written comparison, not a measurement. gpt-oss-20b "over 3× faster": the user's impression (Fractal academia 3.70). Expert offload: "Doctor-Shotgun, *llama.cpp MoE offload guide*, huggingface.co/blog/Doctor-Shotgun/llamacpp-moe-offload-guide" (S). The 10–30 s swap: see section 3.
- That fine-tuning an MoE can upset its routing: source not recorded.

**The idea behind it:** [Mixture of experts and routers](file:///E:/AI%20academia/Study%20hub.html#moe), [LoRA fine-tuning](file:///E:/AI%20academia/Study%20hub.html#lora)


## 7. The auditor: someone has to watch the team (Built, 22 Nov 2026)

More experts means more actions than the owner can read. The user: "an auditor that checks the other ai activity
sounds important to have with all these experts. I won't be able to keep up in the activity log".

**What was built:** `Fractal\rust\parts\auditor`, which writes `AI activity logs\Audit.html`. It reads every AI's log
and reports, summary first, what needs the owner and what is worth a look:
- requests for an OK with no answer;
- a tool run after a "no";
- a result that passed its rule;
- a past day's log changed rather than added to (a fingerprint ledger);
- risky tools with no OK on record;
- failures, grouped;
- downloads;
- an AI gone quiet.

**Lessons that hold beyond Lattice:**
- **Rules, not a model, for the judge.** Log lines quote web pages and messages. A model auditor reading them can be
  talked round by text written to fool it (prompt injection, see 03). Rules can't, and the same log always gives the
  same report. A model may add a plain summary on top, never the verdict.
- **An auditor must be separate from what it audits.** It only reads the logs, keeps its own files apart, and keeps a
  ledger, so even an edit to an old log is noticed.
- **Group repeats, or the report becomes another log.** The first real run had 34 failed and 18 finished downloads,
  the same three lines over and over, which looked like tests writing into the real log. Once grouped, they showed
  as two lines with ×17.
- **Know each writer's timing.** Ruby's lines arrive when she touches base, so "out of time order" is normal for her
  and a warning only for Fractal, who writes as it acts.
- **Its first real finding:** three shell commands (cloning two repos the owner had asked for) ran with no OK on
  record. They were allowed, but it is exactly what an owner should be able to see without reading 300 lines.

**How we know.**
- The user's words and the build: Fractal academia 3.70; Odysseus added in Fractal academia 3.79.
- The first run (348 lines; 34 failed and 18 finished downloads; three `run_command` calls with no OK): `Fractal\rust\parts\auditor\README.md` ("Built and checked").
- Rules rather than a model, for injection reasons: our design; see 03 section 7.

**Proof.**
- Code: `Fractal\rust\parts\auditor\src\lib.rs`
- Results: `AI activity logs\Audit.html`, `AI activity logs\Auditor`
- Check it yourself: `cargo test` (from `Fractal\rust\parts\auditor`; the README says 11 tests, `lib.rs` now holds 12)

**The idea behind it:** [Append-only logs and an auditor](file:///E:/AI%20academia/Study%20hub.html#audit), [Prompt injection and command guards](file:///E:/AI%20academia/Study%20hub.html#guards)


## Open questions
- Can the phone's engine switch LoRA add-ons per request? llama.cpp can apply and scale adapters per request. Ruby's
  app still needs checking.
- Does a 1.7B facts expert plus v5 beat any single model on the full 1,020 answers plus the recall exam?
- On the PC, does a coding specialist of about 13 GB beat the 27B on code by enough to pay for a 10–30 s swap?

**How we know.**
- Open when written. The second has since been answered on Ruby's tier: the facts card beat the team (Ruby academia 3.20, 3.21). The per-request LoRA claim for llama.cpp: source not recorded.

**The idea behind it:** [Mixture of experts and routers](file:///E:/AI%20academia/Study%20hub.html#moe), [LoRA fine-tuning](file:///E:/AI%20academia/Study%20hub.html#lora)


## 8. First results, per tier (22-23 Nov 2026)

- **Ruby: the team works on paper.** Rounds 8a (v5 + v6b) and 8b (v5 + Gemma try 3) both pass the 12 Nov rule, the
  first candidates to do so (06 s14; `Ruby\docs\research\2026-11-23\ruby_team_8`).
  - Chat is untouched, because nothing chatty is routed.
  - Recall rises from 145 to 160 and 169 of 192.
  - The router (rules written before any result) is right on 50 of 64 labelled questions.
  - Still open: running it for real. Add-ons on a Q4_0 base lose accuracy (8c: v5's add-on 134 against 145 merged).
    8c2 (Q8_0 base) and 8d (facts card in the prompt) were queued the same night, along with a knowledge-only expert
    trained for the job (k1, k2).
- **Fractal: no MoE replaces the 27B** (01 s13).
  - The best is Gemma 4 26B-A4B at 19/26, 1.57× faster: "close, the user's call".
  - The coding specialist (Qwen3-Coder-30B-A3B) scored 8/26. A specialist only wins if it is strong in its own right,
    not just labelled for the skill.
  - For Fractal the better speed lever is MTP on the dense 27B, plus an MoE as a fast side expert for easy requests.
- **Volta:** still waiting on hardware. The research puts the big MoE there, where its total size fits.

**How we know.**
- Ruby's team (8a, 8b pass; recall 145 to 160 and 169; router 50 of 64; 8c 134 against 145): Ruby academia 3.20; `Ruby\docs\research\2026-11-23\ruby_team_8\README.md`, `result_8a.json`, `result_8b.json`, `run_8c.log` there.
- Fractal's MoE tries (Gemma 4 19/26, coder 8/26): Fractal academia 3.78 and 01 section 13; `Fractal\exam-kit\results\general-hard\m3-trial-gemma4-moe.jsonl` and `m2-trial-coder-moe.jsonl` there, against `h0.jsonl`.

**Proof.**
- Results: `Ruby\docs\research\2026-11-23\ruby_team_8\result_8a.json`, `Ruby\docs\research\2026-11-23\ruby_team_8\result_8b.json`, `Fractal\exam-kit\results\general-hard\m3-trial-gemma4-moe.jsonl`, `Fractal\exam-kit\results\general-hard\m2-trial-coder-moe.jsonl`
- Check it yourself: `exam.exe general report results\general-hard\m3-trial-gemma4-moe.jsonl results\general-hard\h0.jsonl` (from `Fractal\exam-kit`, no model)

**The idea behind it:** [Mixture of experts and routers](file:///E:/AI%20academia/Study%20hub.html#moe), [Paired comparison and the sign test](file:///E:/AI%20academia/Study%20hub.html#paired)


## 9. What the research says about auditing a team of AIs (23 Nov 2026; Measured by others unless marked)

- **Keep the judge rules-only.**
  - LLM monitors catch a lot: Ctrl-Z cut attack success from 58 % to 7 %, and OpenAI reviews tens of millions of
    agent runs with a model monitor.
  - But a monitor that reads text an attacker can write can be talked round. Adaptive attacks broke all 12 published
    defences, most at over 90 % ("The Attacker Moves Second", 2025). Untrusted models invented injections against
    their monitors zero-shot (Terekhov et al., ICLR 2026). An adversarial agent got past Claude Code's auto mode and
    Codex's Guardian in 79 % of trials (Remedios et al., 2026).
  - Anthropic's auto-mode classifier removes tool outputs before judging, calling that its main defence against
    injection.
- **If a model is ever added,** it should only summarise the auditor's own structured findings (rule, AI, tool,
  counts). It should never see quoted log text, never decide, and never lower a severity.
- **The integrity gap** (Claim): the ledger sits on the same disk as the logs, so anything that can rewrite one can
  rewrite the other. The textbook answers:
  - a per-line hash chain (`seq` plus `prev` hash: Schneier and Kelsey 1998; Crosby and Wallach 2009);
  - a checkpoint sent off the machine (the phone, or Volta) every few minutes;
  - optionally, append-only folder permissions for the agents.
  - systemd's sealing was found not secure in a formal model; the key must live elsewhere.
- **Rules from real incidents:**
  - an agent edited its own auto-approve setting to remote code execution (CVE-2025-53773);
  - malware ran AI CLIs with permission-bypass flags to hunt secrets, leaking 2,000+ (Nx "s1ngularity", 2025);
  - an agent deleted a production database during a code freeze and misreported it (Replit, 2025).
- **Alert fatigue.** Security teams ignore 67 % of 4,484 daily alerts (Vectra 2023). Group by fingerprint, keep three
  levels, give every "known noise" entry an expiry, and never let noise silence tamper, self-change or secret rules.

**Built from it the same night** (`Fractal\rust\parts\auditor`, 11 tests). These rules are never covered by the
known-noise list:
- writes to protected files (settings, rules, logs, the auditor, startup entries);
- permission-bypass flags;
- key-like strings in any log line, shown as their kind only;
- a program run within 30 minutes of being downloaded;
- three "no" answers in a row in one chat;
- a finished day's log file that has gone missing.

On three days of real logs they raised no false alarms. The hash chain and the off-machine checkpoint need changes
to the log writer (Studio's) and the phone app, so they are leads (10). **Later the same night:** the off-machine copy was built without touching the log writer. Each report carries the last 10 finished days' fingerprints, and Ruby's app keeps the first copy of each and flags a day that later shrinks or changes (auditor README; app 1.8 dev build, not tried on the phone). The per-line chain is still a lead.

**Update, 23 Nov 02:00 (Ruby academia 3.20):** the real run settles Ruby's tier.
- Add-ons work on a Q8_0 base (team: 166 of 192), but not on the phone's 4-bit base (149).
- The cheapest expert won: the facts card, put in v5's prompt only when the router says "knowledge". It scores 165,
  passes the rule (8 won, 0 lost), and adding the team on top gains nothing (167).
- The lesson for every tier: an "expert" can be a piece of context picked by a router, not only a model. Try that
  first. It costs no memory, no training, and nothing elsewhere.

**Update, 23 Nov 04:40 (Ruby academia 3.21):** a knowledge-only expert, trained for the job (k1 3 epochs, k2 6
epochs), does not beat the card either. Its teams score 153 and 160 of 192 against the card's 165, and both fail
the paired rule. On Ruby's tier, the "knowledge expert" is the card.

**How we know.**
- Ctrl-Z 58 % to 7 %: "Greenblatt et al. *AI Control*, arXiv 2312.06942; Bhatt et al. *Ctrl-Z*, arXiv 2504.10374; SHADE-Arena, arXiv 2506.15740" (S).
- OpenAI's monitor and Anthropic's auto-mode classifier: "OpenAI, *How we monitor internal coding agents* (Mar 2026); Anthropic, *Claude Code auto mode* (engineering post)" (C).
- 12 defences broken, zero-shot injections, 79 %: "Terekhov et al., arXiv 2510.09462; Nasr, Carlini et al. *The Attacker Moves Second*, arXiv 2510.09023; Remedios et al., arXiv 2609.19587" (S).
- Hash chain: "Schneier and Kelsey 1998; Crosby and Wallach, USENIX Security 2009" (B). systemd sealing found not secure: source not recorded (not in References.md).
- Incidents: "CVE-2025-53773 (embracethered.com); Nx "s1ngularity" (wiz.io); Replit incident (oecd.ai); OWASP Top 10 for Agentic Applications (Dec 2025)" (S).
- Alert fatigue, 67 % of 4,484: "Vectra, *2023 State of Threat Detection*; Prometheus Alertmanager docs; Google SRE book, ch. 6" (S).
- Built the same night and the phone's fingerprint copy: our build, `Fractal\rust\parts\auditor\README.md` ("The phone's copy of the fingerprints"). "No false alarms on three days of real logs": source not recorded (not in the README or a project record).
- 02:00 update (166, 149, 165 with 8 won 0 lost, 167): Ruby academia 3.20; `Ruby\docs\research\2026-11-23\ruby_team_8\result_8d.json`, `run_8c2.log`, `run_8f.log` there.
- 04:40 update (153, 160 against 165): Ruby academia 3.21; `Ruby\docs\research\2026-11-23\ruby_knowledge_k\README.md`, `result_team_ruby-k1.json`, `result_team_ruby-k2.json` there.

**Proof.**
- Code: `Fractal\rust\parts\auditor\src\lib.rs`
- Results: `Ruby\docs\research\2026-11-23\ruby_team_8\result_8d.json`, `Ruby\docs\research\2026-11-23\ruby_knowledge_k\result_team_ruby-k1.json`, `Ruby\docs\research\2026-11-23\ruby_knowledge_k\result_team_ruby-k2.json`
- Check it yourself: `cargo test` (from `Fractal\rust\parts\auditor`)
- Not kept: a record of the three-day false-alarm check.

**The idea behind it:** [Append-only logs and an auditor](file:///E:/AI%20academia/Study%20hub.html#audit), [Prompt injection and command guards](file:///E:/AI%20academia/Study%20hub.html#guards), [Mixture of experts and routers](file:///E:/AI%20academia/Study%20hub.html#moe)

