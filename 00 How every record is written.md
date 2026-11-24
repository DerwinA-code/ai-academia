# 00 How every record is written: proof of work

The user (24 Nov 2026): the academia "is lacking proof of work. It's great we listed what we did but I don't see how we
did it or the academia of those techniques." From now on every section of every academia (Fractal, Ruby, Odysseus,
Volta, the NCM lab, and this folder) carries three things besides what was done and what it showed.

## 1. How we did it

The steps, in order, as someone repeating the work would need them: what was built or changed, what was run, on what
data, with which settings, and how the result was judged. Numbered, short, plain words. Name the settings that matter
(model, quantisation, temperature, seeds, number of runs, the exam set) and the bar that was set **before** the run.

## 2. Proof

What anyone can open or re-run to see that it happened. Only things that really exist on disk are listed; every path is
checked before it is written, and the docs page marks each path it finds with whether it still exists.

```
**Proof.**
- Ran: `exam.exe general run s4c-cases --set hard --lessons L4-cases.txt` (from `Fractal\exam-kit`)
- Results: `Fractal\exam-kit\results\general-hard\s4c-cases.jsonl` (26 answers), log `Fractal\runtime\experiments\2026-11-23\chain6.log`
- Code: `Fractal\rust\parts\studio\src\startup.rs` (`watch_window`), tests `cargo test -p studio` (20 pass)
- Check it yourself: `exam.exe general report results\general-hard\s4c-cases.jsonl results\general-hard\v2.jsonl`
- Not kept: the 9 Nov transcripts (deleted in the 12 Nov clean-up); the numbers above are from the run's log.
```

Rules:
- **Paths are written from Project Lattice's folder** (`Fractal\...`, `Ruby\...`, `Volta\...`), or in full for other
  drives (`E:\AI academia\...`, `D:\...`).
- **Never invent.** A number in the section must come from a file listed here, or the section says where it came from.
- **Say what was not kept.** A missing log is written down as missing; it is not hidden.
- **No secrets and no private content.** Keys, passwords, the signing key and the contents of the user's journal,
  voice recordings and mail are never quoted; a path to them is enough.
- **"Check it yourself"** is a command that reproduces or re-grades the result without a model where one exists
  (`exam grade`, `exam pair`, `cargo test`, `lattice.exe ...`), so a check costs seconds, not GPU hours.

## 3. The idea behind it

A link to the technique's own write-up in [13 Techniques, explained](13%20Techniques%2C%20explained.md) and its
interactive lesson in **Study hub.html**: what the technique is, why it works, the maths where there is any, where
it came from (paper, repo), and every section that used it. The project record says what *we* did; the technique
write-up says what the technique *is*.

```
**The idea behind it:** [Paired comparison and the sign test](13 Techniques, explained.md#paired-comparison-and-the-sign-test) (Study hub: *Is it real or luck?*)
```

## Where the three go

At the end of each section, after its result and status, in this order: **How we did it**, **Proof**, **The idea
behind it**. A section that only records a decision (no build, no measurement) gives the decision's source (the user's
words, the date) as its proof and needs no "How we did it".
