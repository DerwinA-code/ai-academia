# 11 Several AIs on several machines

How to let one personal AI hand work to another machine without opening a hole, and how to build and test that
before the second machine exists. Sources: Volta's record (`E:\Project Lattice\Volta\docs\ACADEMIA.md`), Fractal's
academia 3.33 and 3.27, Ruby's gateway (`E:\Project Lattice\Ruby\gateway.py`), and `Fractal\docs\LATTICE.md`.

**Conditions for every number here.** 11 Nov 2026. Both ends ran on one PC (RTX 5070 Ti, Windows 11, Python 3.13):
the second machine's program ran as its own process with its own data folder, over the real encrypted line.
Nothing has been measured between two real machines yet.

---

## 1. One door, and one direction

- **Built.** The big machine (Volta) runs one small server. The everyday machine (Fractal) calls it; the big machine
  never calls anyone. Results are fetched, not pushed.
- **Why it generalises.** Only one machine opens a port, there is one direction to secure, and the machine with
  the most power is the one that can't start anything by itself.
- **A phone fits the same shape.** The phone already calls the PC and never the other way round. The chain is
  phone → PC → big machine, and each link is the same kind.

**How we know.**
- Our build: Volta academia 3.1 and Fractal academia 3.33; the rules in `Volta\docs\PROTOCOL.md`. A design decision, so there is no measurement; the phone's shape is Ruby's gateway (Fractal academia 3.45).

**Proof.**
- Code: `Volta\rust\src\node.rs`, Fractal's side `Fractal\fractal\volta.py`

**The idea behind it:** none of the listed techniques; only one machine listens, and the strongest one never calls out.


## 2. Reuse a security design that already passed its tests

- **Built.** The line to the big machine copies the phone's gateway rule for rule: the machine's own certificate,
  its fingerprint pinned at pairing and checked on every connection before the token is sent, a 6-digit code
  shown on that machine's own screen (5 minutes, 5 tries, one use), private networks and Tailscale only, lock-out
  after 10 failures, tokens stored only as hashes.
- **Lesson.** The second link in a system should be the first link again. The rules were already argued through
  for the phone, and their tests could be written from the first set.
- **A fingerprint shown on both screens is still needed** when the code is typed, because a machine in the middle
  could pass the code along. Both sides print the same four short groups.

**How we know.**
- Our build: Volta academia 3.1 (the rules copied from Ruby's gateway, `Ruby\gateway.py`), protocol in `Volta\docs\PROTOCOL.md`. Checked by the link tests (70 checks, Volta academia 3.1).

**Proof.**
- Code: `Volta\rust\src\security.rs`
- Results: `Volta\tests\test_link_with_fractal.py` (the 70 link checks)

**The idea behind it:** none of the listed techniques; the second link reuses the first link's pinned certificate, one-use code and lock-out.


## 3. A fixed list of jobs instead of a remote shell

- **Built.** The big machine accepts a short list of job kinds (report the hardware, run the checklist, answer a
  question with its own model, wait). There is **no kind that runs a command**, and files sent to it are kept and
  never run. A new kind is a new function added on that machine on purpose.
- **Why.** The damage a stolen token can do is the list. With a "run this" job the list is everything.
- **Be honest about what isn't built.** Planned kinds are named in the list with "ready: false" and refused as
  "planned", so the caller's picture of the machine is true.
- **Lead:** training jobs need to run code. The open question is how to keep the list fixed when the work is a
  script: recipes that live on the big machine and are chosen by name, with only data sent over the line.

**How we know.**
- Our build: Volta academia 3.1; the job kinds and "planned" refusals in `Volta\docs\PROTOCOL.md`. The training lead: Volta academia 3.7 (training stays on the gaming PC).

**Proof.**
- Code: `Volta\rust\src\jobs.rs`

**The idea behind it:** [Prompt injection and command guards](file:///E:/AI%20academia/Study%20hub.html#guards)


## 4. The other machine being off is normal

- **Measured.** With the big machine's program stopped, the caller knew in **2.0 s** (five runs, 2.01 to 2.04 s; a
  refused connection on the same Windows PC). Over a real network with the machine powered off, the caller's own
  time limit (2.5 to 4 s here) is expected to decide instead. Not yet measured.
- **Built.** Every call fails fast with a plain reason, and the view that shows the machine reads the last known
  state and refreshes it in the background. The view never waits on the network.
- **Lesson.** Decide what "off" looks like before anything depends on the machine: a time limit on every call, a
  last-seen time in the display, and no work that silently queues for a machine that may be off for days.
- **A job cut off by a restart is marked, not rerun.** A half-finished training run should be someone's decision.

**How we know.**
- 2.0 s (2.01 to 2.04 s over five runs) on one PC: our measurement, Volta academia 3.1 (its "Checked" table). Result file not kept beyond the record. The 2.5 to 4 s over a real network is expected, not measured.
- Fail fast, last-known state, a cut-off job marked not rerun: our build, Volta academia 3.1.

**Proof.**
- Results: `Volta\tests\test_link_with_fractal.py` (the check that times it)
- Not kept: the five timing runs as a file.

**The idea behind it:** [Processes, handles and clean shutdown](file:///E:/AI%20academia/Study%20hub.html#handles)


## 5. One audit log for machines that can't always reach each other

- **Built.** Each machine writes its own lines as things happen. The everyday machine copies the big machine's new
  lines into the one folder the user audits. Every line has its own id, so asking twice never files a line twice,
  and each line keeps the time it happened where it happened.
- **What is deliberately not logged on the big machine:** what a question to its model said. Only its size and
  speed. The words are already in the log of the machine that asked.
- **Lesson.** Pull, with ids and a position, survives the other machine being off; push would need a queue and a
  retry rule on the machine you trust least to be up.

**How we know.**
- Our build: Volta academia 3.1 (Volta's lines pulled into the audited folder) and Fractal academia 3.27 (the activity log). A design, not a measurement.
- Note: Fractal academia 3.33 names `AI activity logs\Volta`, but that folder does not exist today (only Fractal and Ruby); Volta has not run as a real machine.

**Proof.**
- Code: `Volta\rust\src\activity.rs`, `Fractal\fractal\volta.py`

**The idea behind it:** [Append-only logs and an auditor](file:///E:/AI%20academia/Study%20hub.html#audit)


## 6. Build and test the contract before the hardware exists

- **Measured.** The whole line was built with no second machine: 59 checks of the big machine's own program, 70 of
  the line end to end, 15 of how it is shown. Three real bugs were found (section 7), none of them about graphics cards.
- **What made it a real test:** the other end ran as a separate program with its own data folder and its own
  settings, and the two ends shared no code, only a written page of rules.
- **What it can't show:** anything about the real cards, a real network, a firewall, or speed. Those stay listed as
  not measured.
- **Rehearse the move.** The folder was packed, unzipped somewhere else, tested from there, and the first-day
  guide's commands were run from the unzipped copy. A setup guide nobody has followed is a guess.

**How we know.**
- 59 checks of Volta's own program, 70 of the line end to end, 15 of the view, and the packed-copy rehearsal: our measurement, Volta academia 3.1 and Fractal academia 3.33.

**Proof.**
- Results: `Volta\tests\test_link_with_fractal.py` (70), `Volta\tests\test_station_forge.js` (15), `Retired Python\Volta\tests\test_volta.py` (the 59, now retired)
- Code: the pack used for the rehearsal, `Retired Python\Volta\pack.py` and `Retired Python\Volta\dist\Volta-0.1.zip`; the guide `Volta\docs\SETUP.md`
- Check it yourself: `node Volta\tests\test_station_forge.js`
- Not kept: the test runs' output as files.

**The idea behind it:** none of the listed techniques; test the contract against a separate stand-in process before the hardware exists.


## 7. Three bugs worth knowing in advance

| Bug | Cause | General lesson |
|---|---|---|
| A refusal arrived as "connection dropped" | The server said no and closed without reading what the caller had already sent. Windows then resets the connection, and the reply is lost | Read the request before refusing it |
| Saving a file stopped a worker thread for good, about once in ten runs | On Windows a file can't be replaced while another thread has it open for reading | One lock for every read and write of the same files; retry a refused save; make the long-lived thread unable to die. A test that passes once says nothing about a race: run it several times |
| Two jobs sent back to back ran in either order | They were sorted by a time rounded to 10 ms | Keep arrival order with a counter or a nanosecond time, never a rounded clock |

A fourth, about testing: the big machine's default address for its own model (port 8080) was a real model server on
the test PC. Tests must point defaults that are "this machine" at a closed port or a stand-in.

**How we know.**
- All three bugs and the port-8080 trap: our findings, Volta academia 3.1 and the record's bugs-and-lessons table (rounded 10 ms clock, a test reaching a real model on port 8080).

**Proof.**
- Code: `Volta\rust\src\jobs.rs` (arrival order), `Volta\rust\src\node.rs`
- Not kept: the failing runs.

**The idea behind it:** [Processes, handles and clean shutdown](file:///E:/AI%20academia/Study%20hub.html#handles), [Repeats and the noise floor](file:///E:/AI%20academia/Study%20hub.html#repeats)


## 8. Looking without acting

- **Built.** Pairing codes carry a role. A controller may give jobs; a watcher may only see status and which jobs
  ran, never their arguments or results. The caller can't ask for more than the code allows.
- **Use.** A phone, a status screen or a second user can be given the watcher role.
- **Lead:** whether a phone pairing directly as a watcher is worth it, against showing the same numbers through
  the PC. Measure by what still works when the PC is off.

---

**How we know.**
- Our build: Volta academia 3.1 (point 9, two roles: controller and watcher); covered by the link tests ("the watcher's limits"). The phone-as-watcher lead is unmeasured.

**Proof.**
- Code: `Volta\rust\src\security.rs`
- Results: `Volta\tests\test_link_with_fractal.py`

**The idea behind it:** none of the listed techniques; a pairing code carries a role, and a watcher can see status but not arguments or results.


## 9. Moving a service to another language behind the same test (Built, 12 Nov 2026)

Volta's node was rewritten from Python into Rust after its owner decided the project moves to Rust (Volta academia
3.4; Fractal academia 3.40).
- **Keep the data files and the protocol identical.** Then the old and new versions can take turns on one folder,
  and the existing end-to-end test judges the new one unchanged. Here one environment variable pointed the 70-check
  link test at the new program, and it passed on its first run.
- **The checks a compiler and a linter make are cheap and early.** The one real fault, a lock taken twice by one
  thread (allowed in Python, a hang in Rust), was found while writing, before any test ran.
- **Measure both side by side on the same machine.** Memory went from 34 MB to 9 MB and listing jobs from 15 ms to
  2.4 ms. Sending a large file barely changed, because the disk and the encryption set that pace.
- **Copy the dependencies in (`cargo vendor`),** so the other machine builds without the internet.

**How we know.**
- 70/70 link checks on the first run, 47/47 own checks, 34 MB to 9 MB, 15.3 ms to 2.4 ms, the lock taken twice, `cargo vendor`: our measurement, Volta academia 3.4 (its table), with the decision in Fractal academia 3.40.

**Proof.**
- Code: `Volta\rust\src`, own checks `Volta\rust\tests\node_checks.rs`, crates `Volta\rust\vendor`
- Results: `Volta\tests\test_link_with_fractal.py` (run with `VOLTA_NODE=<volta.exe>`)
- Check it yourself: `cargo test` (from `Volta\rust`, offline)
- Not kept: the memory and timing runs as files.

**The idea behind it:** [Rewriting with parity tests](file:///E:/AI%20academia/Study%20hub.html#parity)


## 10. "The same bytes" as the test for a rewrite (Built, 12 Nov 2026)

The second part moved to Rust was a set of small tools that write files: an audit log, a settings store, and four
page builders (Fractal academia 3.41). Section 9's rule, the same files and protocol, was made stricter: the new
program must write **the same bytes** as the old one.
- **It turns a rewrite into a comparison.** No new test cases had to be invented. Both versions ran on the real
  inputs and the outputs were compared; 32 of 32 matched on the first run.
- **The work is in the old language's habits, not in the job.** What counts as white space, how line ends are
  written on Windows, how a float is printed, and where local time comes from each had to be copied exactly.
  A small layer that copies them once served every part.
- **Guard the switch while both versions exist.** Other work may still edit the old script. The new program checks
  whether the script it replaces is newer than itself and, if so, steps aside for it. The old version stays the
  fall-back.
- **Small tools gain most from start-up time.** A page build went from about a second to about a tenth; one log
  line from a script from 216 ms to 12 ms, nearly all of it Python starting.

**How we know.**
- 32 of 32 byte comparisons, page builds ~1 s to ~0.1 s, a log line 216 ms to 12 ms, the step-aside guard: our measurement, Fractal academia 3.41 (its table).

**Proof.**
- Code: `Fractal\rust\src`
- Results: `Fractal\rust\tests\parity.py` (the comparisons)
- Check it yourself: `py -3 rust\tests\parity.py` (from `Fractal`, about half a minute)

**The idea behind it:** [Rewriting with parity tests](file:///E:/AI%20academia/Study%20hub.html#parity)


## Open questions (also in 10)

- Speed and failure behaviour between two real machines, at home and over Tailscale.
- How to add training jobs without adding a way to run arbitrary code.
- Whether the everyday AI should hand hard questions to the bigger model by rule or by its own choice, and what
  that does to accuracy and waiting time.

**How we know.**
- Open by definition. They come from Volta academia 3.1 ("Not checked") and 3.7 (training stays on the PC); nothing has run between two real machines.

**The idea behind it:** none of the listed techniques; these are untested questions.

