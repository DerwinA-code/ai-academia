# GrindPilot: an evidence-driven agent that learns to play games from the screen

*Working paper, 10 November 2026. Written from GrindPilot's development record and its own documentation.*

---

## Abstract

GrindPilot is a desktop agent that plays video games through the same interface a person uses: it sees screenshots
and sends mouse and keyboard input. It started as a script that replayed recorded clicks for one game's daily
chores. Over about two weeks it became a general agent that **learns** each game's screens, buttons and routes by
watching a player and by exploring safely. It keeps that knowledge as one weighted graph, recalls from it with
personalised PageRank, and passes lessons that hold up across games into a separate "general brain".

It was tested on two games that are built very differently: *Zenless Zone Zero* (a 3D gacha game whose menus have
titles and an Escape-key menu) and *Melvor Idle* (a web-based idle game with a sidebar that is always on screen).
On the second game it completed and claimed one of its tutorial tasks by itself. It also has a measured exam with
two safety gates, an end-to-end benchmark on simulated games, and 148 automated tests.

This paper describes:
- the design;
- the learning rules;
- the safety model;
- 40 failures seen on real games, each with its cause and fix, generalised where possible;
- the open research questions.

The main claims:
1. **Recordings work better as material to learn from than as scripts to replay.**
2. **Knowledge kept as weighted evidence lets one small set of mechanisms serve three purposes:** recall, a map
   people can inspect, and forgetting.
3. **Cross-game promotion must be slow and grounded in outcomes.**
4. **Hard safety rules belong outside anything the agent can learn.**
5. **Agents that act on a real desktop fail mostly at perception and at where an action lands, not at planning.**

---

## 1. Introduction

### 1.1 The problem

Many games contain *grind*: repeated menu chores (claiming daily rewards, mail, quests) and long, repetitive
actions. Existing automation is game-specific: hand-written screen definitions and click scripts that break
when the user interface (UI) changes, the language changes, or a different client (for example the global
version instead of the Chinese one) shows different text.

The goal set for GrindPilot was broader:

> Given an infinite amount of time, it will learn the game, lore, mechanics and story, to have a full
> playthrough experience. It may sleep every now and then.

This makes it a problem in **open-ended skill learning under a pixels-and-input interface**:
- **No game API:** it gets screenshots only.
- **No reward signal from the game:** progress must be read off the screen.
- **A real user's computer and accounts:** mistakes can cost money or data.
- **Continual learning across titles:** what it learns in one game should give the next game a head start.

### 1.2 Approach in one paragraph

**Perception** is OCR plus light image matching, with no trained model. **Knowledge** is a per-game graph
(screens, buttons, routes, rules, facts, notes) whose link weights come from counted outcomes. **Behaviour** is a
small set of *goals* (reach a page, collect rewards, follow the game's own task list), which plan from that
knowledge instead of replaying clicks. **Learning** comes from three sources:
- watching the player;
- bounded self-exploration;
- the game's own text, its files on disk, and its public wiki.

**Consolidation ("Sleep")** runs between sessions. It passes grounded evidence to a general brain shared across
games, and it forgets knowledge that had a fair chance and never helped. A guard against spending money, and a set
of house rules, sit outside everything learned.

### 1.3 Contributions

1. A worked architecture for an agent that learns a game from the screen and is safe to run on the player's own
   machine and accounts (sections 3–6).
2. **Evidence-weighted knowledge graph.** One graph serves recall (personalised PageRank), the user's 3D map, and
   memory hygiene. It has a hub cap that must hold at *both* ends of a link (section 4).
3. **Slow cross-game promotion.** A general brain with three tiers (house, candidate, general). Evidence is
   *replaced* per source, so repeated consolidation cannot inflate it (section 5).
4. **An exam with gates that cannot be traded away.** Zero spending-guard misses and zero presses on greyed-out
   buttons. The agent is scored with the very functions it clicks with (section 7).
5. **A catalogue of 40 real-game failures** with their causes, fixes and general lessons (section 8).
6. **A first step toward autonomous play:** a quests goal that reads the game's task list, autoplay drives chosen
   by success rate, a journal of lore and mechanics, and scheduled rest (section 6).

---

## 2. Related work and influences

- **Game automation tools.** Typical tools for gacha dailies hand-code screens and actions per game and per
  client. GrindPilot imported one such project's screen definitions *as data* (that project is GPL-3.0, so no
  code was taken). Section 8 shows that this data did not transfer to a different client of the same game.
- **Generalist game agents.** Recent work drives games through screenshots and keyboard/mouse with large
  vision-language models. GrindPilot instead keeps perception classical (OCR, templates, signatures) and keeps a
  local vision model optional. It puts the learning into the *knowledge structure*, which is cheap, inspectable
  and runs offline.
- **Retrieval over graphs.** Recall uses personalised PageRank, as in HippoRAG-style memory. The design was
  shared with a sister project, *Fractal*, which built its own memory ("Mind") from it and sent improvements back
  (section 4.4).
- **Memory consolidation.** "Sleep" borrows the idea of offline consolidation: replay what worked, strengthen it,
  and prune the rest. It insists on *grounding*: only recorded outcomes count as evidence.
- **Agent safety.** Agents acting on a computer face a risk that text agents don't: *where* an action lands. The
  spending guard and house rules follow the principle that hard constraints must not be learnable.

---

## 3. System overview

```
 player ─► web UI (local)  ◄── live log and status ──┐
              │ JSON API                              │
              ▼                                       │
          Service (one open game profile, its device, its state) ─┘
              ├── Brain: observe → rules → goal → act
              │     ├── Planner (routes on the screen map)   ├── Advisor (when lost)
              │     ├── Knowledge (facts + general brain)    └── Mind (graph recall)
              ├── Explorer (training) · Digester (watching) · Folder scanner · Web guide
              ├── Quests · Autoplay · Journal
              └── Sleep: consolidate → general brain; tidy each profile
          Devices: Windows · Linux (X11, Wayland) · Android (ADB, plus a native app)
          Storage: one SQLite file per game; one file for the general brain
```

- **One game = one file.** Screens, buttons, links, tasks, rules, notes, runs and pictures (stored once each, as
  WebP) live in a single SQLite profile. A one-hour watched session digests to kilobytes plus thumbnails: the raw
  recording is deleted once learned from.
- **Run loop.** Each step:
  1. observes the screen;
  2. applies rules (popups, login, tutorials first);
  3. advances the goal, or takes one hop of the planned route;
  4. when lost, waits patiently, then asks the advisor (whole-word popup buttons, Back/Esc, an optional local
     vision model).

  Budgets turn endless loops into clean failures with recovery.

---

## 4. Knowledge as evidence

### 4.1 Learning screens and links

- **Screens are identified by their titles.** These are OCR boxes in the top band of the screen that look like
  words, not numbers or currencies. A title becomes an *anchor*: an area that must show those words.
- **The same anchor mechanism covers every source:** imported, hand-made and learned screens. An imported screen
  with the same name is *grounded* on the user's client: it gains the local title, and its foreign anchors are
  switched off, not deleted.
- **Screens with no title** (the open 3D world) are recognised by stable pixels in the heads-up display (HUD).
  In a game whose menus are always on screen, recognition uses *chrome*: text found at the same place on two
  different pages is never a title.
- **Links between screens are learned from what happened,** each with a role:
  - **opens:** the click led to a new page;
  - **back:** the click returned to the previous page;
  - **reward:** a reward popup followed, or a claim button disappeared.

  Each link keeps counts of successes and failures and an average time.
- **The planner is Dijkstra's algorithm with cost = time / reliability².** Unreliable links are heavily
  penalised but stay usable.

### 4.2 One graph, three uses

All knowledge becomes one graph:
- **Nodes:** screens, buttons, rules, facts, notes, tasks, vocabulary and general skills.
- **Links:** their weights come from evidence. A route weighs `0.5 + min(6, successes)`, scaled by 0.3 when it
  fails more than it succeeds.
- **Regions:** the nodes are grouped like brain lobes: perception, navigation, memory, planning, reflexes and
  general.

**Recall is personalised PageRank (damping 0.85, 20 iterations)** seeded from the nodes that match a query. When
the agent must reach "Mail" with no known route and no player hint, recall ranks the screens most tied to "Mail".
The agent goes to the best one it *can* route to and looks there. The algorithm walks the graph, and the decision
logic receives a short ranked list.

The same graph is drawn as a 3D map, so the player can inspect what was learned and where each piece came from
(watched, imported, taught, game files, general brain). The same evidence also drives forgetting (section 5.3).

### 4.3 The hub cap must hold at both ends

A link is kept only if it is among the 24 strongest links of **both** of its ends.

- **Why both ends:** keeping a link when it is in the top 24 of *either* end caps nothing. A hub keeps all its
  links through the other ends, and then a hub screen with 60 links drowns recall and the map.
- **Ownership exception:** a button's link to its own screen is always kept. Without it, the cap orphaned buttons
  on busy screens. That bug was found by looking at the map.

### 4.4 Exchange with a sister project

The brain design was written up and sent to *Fractal*, a separate AI project. Fractal built its own memory from
it and replied with changes; GrindPilot adopted most of them:
- draw hubs on the map, but never let recall walk through them;
- fold old run records into one per day;
- count how often each item is used, and let that count protect it from forgetting;
- life-cycle colours on the map;
- a hierarchical note export.

GrindPilot sent one lesson back: **hubs make force-directed layouts overshoot** unless each link's spring
strength is scaled by its endpoints' degree (as in d3). Two independent builds of the same design agreeing on
most points, and correcting each other on the rest, was a useful validation in its own right.

---

## 5. The general brain and Sleep

### 5.1 Three tiers

A separate store holds **skills that might work in any game.** Examples:
- claim words ("Claim All");
- close words;
- tutorial words;
- back and menu keys;
- start words ("Start Fishing");
- task-card labels ("Active", "Ready to Claim");
- procedures (follow the task list, open collapsed sections, select then start).

Each skill keeps per-game evidence (wins and fails) and a tier:

| Tier | Meaning | Can a game profile change it? |
|---|---|---|
| house | seeded at creation: spending words, never-press-while-exploring words | **no** |
| candidate | seen working in one game | it is evidence, not authority |
| general | proven across games | the baseline for every game |

**Promotion.** A candidate becomes general when it has worked in **≥ 2 games with ≥ 3 wins at ≥ 80 %**, or has
**≥ 15 wins at ≥ 90 %** in one game. A general skill that falls below 50 % after 6 uses is demoted.

**Nothing is copied into a new game's profile.** At run time general skills are merged *under* the game's own
facts, so local knowledge wins. House words always apply: a game profile that calls "Purchase" a claim button
still cannot press it (tested).

### 5.2 Grounded, idempotent consolidation

Sleep reads what *actually worked* and passes it on as evidence:
- clicks on links with the reward role;
- back and menu keys whose links worked;
- rules that fired;
- start buttons that started an action;
- task-card labels that marked the current task.

Evidence is stored **per (game, source item) and replaced, not added**. Without this, nightly consolidation of
the same game inflated the counts until everything was promoted within a week. *An idempotent update is the
precondition for any repeated consolidation.*

### 5.3 Forgetting fairly

Tidying removes items that had **enough chances and no evidence of use**:
- imported screens never recognised in ≥ 5 runs;
- one-off popups;
- routes that failed ≥ 3 times with < 25 % reliability;
- imported rules that never fired in 10 runs;
- pictures nothing refers to.

**Never removed:**
- the home screen;
- anything a task or rule points at;
- anything the player made;
- anything recall has used.

A consistent backup is written first.

**A fairness bug.** The usage counters were added after the knowledge existed, so every old item read "seen 0".
Judging from creation dates would have wiped dozens of good screens on the first night. The fix stores when
counting *began* and judges only from then. *When a usage counter is added, record when counting began.*

### 5.4 When it sleeps

Sleep runs:
- after every run, every digest and every game-folder scan;
- nightly;
- during autoplay: every two hours of play, followed by a rest. Idle games keep progressing while it rests.

A non-blocking lock stops two sleeps from overlapping.

---

## 6. Behaviour: from goals to autonomous play

### 6.1 Goals instead of scripts

Tasks are goals that work out their own clicks from knowledge.

- **reach(page)** tries, in order:
  1. already there?
  2. one hop of the planned route;
  3. a visible button whose words match;
  4. the player's navigation facts ("press K", "X is in Y");
  5. graph recall;
  6. the menu key;
  7. a budgeted look one level inside the current page's buttons;
  8. the advisor.

  A click that changes nothing is *not* arrival. That check was added after the benchmark caught a false success
  (section 7).
- **collect(page)** reaches the page, then claims. Claim buttons match whole words only, never "Claimed" or "Not
  Claimable", and each spot is pressed at most twice. It follows red notification dots, except dots next to
  numbers, because a currency "+" opens a shop.
- **quests** follows the game's own task list:
  1. read the active objective as verb, amount and thing ("Catch 3 Raw Shrimp");
  2. reach the place;
  3. pick the thing, opening collapsed sections and "Select…" lists if needed;
  4. press the start button, which is often below the fold;
  5. wait, checking that the action is still running, then claim.

  A task counts as finished only when a *different* task becomes active.

### 6.2 Busy detection without a game API

To know whether an action is running, the agent compares the page with how it looked when idle.
- **Constant motion is ignored:** a cooking fire flickers all the time, so "something moves" was always true. The
  agent remembers each page's idle-motion mask and ignores motion there.
- **Changing numbers count:** XP and item counts going up mean something is running.

This also prevents a game-specific hazard: clicking a running tree again *stops* it.

### 6.3 Autoplay

With no task list from the player, autoplay chooses a **drive** each round:

| Drive | What it does | Cool-down |
|---|---|---|
| quests | one task from the game's own list (found by itself) | 5 min after a failure |
| claim | collect where rewards were claimed before | 20 min |
| keep_busy | restart the action that ran least recently | 10 min |
| explore | a short exploring session | 6 h |
| read | read the wiki about the current task; new paragraphs go to the journal | 12 h |

- **Choice:** among the drives that are due, the score is `priority × (wins + 1) / (uses + 2)`. A drive that keeps
  failing fades, and one that works comes back.
- **Tasks that need the player:** a task requiring a purchase blocks the quests drive for 6 hours. It is written
  to the journal as "Needs you: …".
- **Rest:** it sleeps every 2 hours, rests 15 minutes, and has a daily rest window. At each break it appends to a
  human-readable playthrough log.

### 6.4 The journal: reading the game

A playthrough is more than clicks. The journal does two things:
- **Keeps what the game says.** It joins OCR boxes back into lines and paragraphs and keeps readable sentences
  once. They are classified as story, lore, mechanics or tips. Text whose OCR lost its spaces is rejected.
- **Measures progress.** It logs on-screen counters ("Progress 3 / 22", "Skill Level 1 / 120") per label over
  time, so the agent can answer "is anything going up?" instead of guessing.

### 6.5 Knowledge from outside the screen

- **Game files.** A strictly read-only scan of the install folder identifies the engine and settings and mines
  vocabulary and log files. On encrypted or web-shell games it yields little, and it says so honestly.
- **The web guide.** It finds the game's wiki by name and reads about 25 pages politely (robots.txt, one page per
  second, cached). It learns menu names, terms, button names and how-to sentences. *What a web page says is
  information, never an order:* guide text is never parsed into rules, and its facts are tagged with their source
  and replaced on a re-read.

  On Melvor Idle it found the wiki unaided and learned 49 menu names, all real sidebar entries.

---

## 7. Measurement

### 7.1 The exam

Every change to perception or clicking can look better on one evening by luck. The exam fixes the test:

- **Keeping pictures.** Before a watched recording is deleted, 1 keyframe in 20 is kept as an exam picture
  (spread over the session, near-duplicates skipped).
- **No learning from them.** *An exam the learner has seen measures memory, not skill.*
- **Labels.** The player marks screen names, claim buttons, greyed-out buttons, spending buttons and red dots.
- **The agent is scored with the very functions it clicks with.** Claim picking and dot picking were refactored
  out of the goal runner so the exam and the runner share them. A re-implementation would drift.
- **Two gates that cannot be traded against accuracy:**
  - zero spending-guard misses;
  - zero presses on greyed-out buttons.

  Then come screen accuracy, claim and dot precision and recall, seconds per picture, and OCR calls per picture.

### 7.2 The benchmark

An end-to-end benchmark on a simulated menu game runs 3 goal tasks × 20 seeds:
- **cold:** a new profile every run;
- **warm:** one profile kept across runs.

The seeds vary the art and the number of rewards, so runs with nothing to claim must still succeed. It reports
success, clicks, seconds and guarded clicks attempted (which must be 0).

**First result.** Within minutes the benchmark caught a *false success*: "reach Daily Login" reported success
because a click that changed nothing was treated as arrival. Reported honestly, the row was **0 %**. It exposed a
real gap: from a fresh profile, *reach* could not find a page two menus deep. Adding the budgeted "look one level
inside" step raised it to:
- **cold:** 100 %, 2.9 clicks on average;
- **warm:** 100 %, 2.0 clicks, using the learned route directly.

No other row moved.

### 7.3 Simulated games as test fixtures

Each failure class found live got a simulated game that reproduces it:
- a menu game;
- a sidebar game: a sidebar longer than the window, a logo on every page, no back key, a shop, and a link that
  opens another program;
- a quest game: collapsed sections, a "Select Recipe" list, clicking a running tree stops it, and a final task that
  wants a purchase.

The suite grew from 113 to 148 tests over the period.

**A lesson about fixtures:** colour-coded fake OCR needs a distinct colour for *every* drawn thing. One HUD icon
shared the target word's colour and produced a false pass.

---

## 8. What broke on real games

These are the failures observed live, grouped by type. Each was fixed and, where possible, covered by a test.
This catalogue is probably the most transferable result of the project.

### 8.1 Imported knowledge does not transfer between clients

- **What happened:**
  - All four imported daily tasks failed with "nothing recognisable": the global client says "Press to Play"
    where the imported data expected the Chinese client's wording.
  - The imported anchors for the open world never matched.
- **Lesson:** imported knowledge must be *grounded* on the user's client before it is trusted. Grounding added the
  local title and switched off, without deleting, anchors that never matched.

### 8.2 Fuzzy matching: fine for reading, dangerous for pressing

| Pressed by mistake | Matched against | Why |
|---|---|---|
| "Not Claimable", ten times | "claim" | fuzzy match |
| "Confirm Move" in the bank | "confirm" (a popup-closing word) | part of a longer action |
| (the reverse) the "Tutorial Island" link was *blocked* | the never-click phrase "Skip Tutorial Island" | 86 % alike |

- **Fixes:**
  - buttons are matched on whole words;
  - popup words must be the whole button;
  - a never-click phrase of several words also needs its first word, the action ("Skip").
- **Lesson:** *a fuzzy match is fine for reading and dangerous for pressing.*

### 8.3 Text that isn't UI

- **What happened:**
  - Exploring clicked "CoflerMadte", which was OCR of a "Coffee Mate" sign in the background art.
  - It clicked "DO", "DOL" and "DOU" repeatedly as a carousel scrolled.
  - On Melvor it took the game's logo for every page's title.
  - It took a task card repeated on every page for the thing to press.
- **Fixes:**
  - candidates are ranked by "is this the game's own vocabulary?";
  - short fragments that aren't words are skipped;
  - each label is tried at most twice per screen;
  - chrome is learned as text *at a position* that appears on two different pages;
  - a task card's own words are never the thing to press.
- **Lesson:** *moving UI defeats position memory, so remember labels too; and rank candidates by "is this UI?".*

### 8.4 Badges and paths that lead to shops

- **What happened:**
  - "New!" dots never clear after a visit.
  - A red dot next to a currency counter sits on a "+" that opens a top-up shop.
  - The game's Options menu was not on the never-press list.
- **Fixes:**
  - each dot is followed once per session;
  - dots next to numbers are skipped;
  - Settings and Options were added to the explore-avoid list mid-run, as a fact.
- **Lesson:** *protect the paths that lead to shops, not just the words that spend.*

### 8.5 Where a click lands

These were the most serious failures.
- **Links that leave the game.** Melvor's sidebar has Wiki, Reddit and Discord links, and exploring opened them in
  the player's browser.
- **The wrong window taken for the game.** A maximised browser tab whose title contained the game's name won the
  window search.

Nothing was pressed in the browser, because every click first focuses the game window. But a general agent must not
rely on that alone. Now:
- **A click that brings another program to the front** marks that label as "never click (it leaves the game)"
  and refocuses the game.
- **Window matching prefers the exact title** and never accepts browsers, chat apps or editors when it matches by
  title.

**Lesson:** *an agent acting on a desktop must check where its actions land, not only what it clicks.*

### 8.6 Time, motion and the fold

| Symptom | Cause | Fix |
|---|---|---|
| Stuck on the title screen | A task step timed out during the resource check | Rules act; tasks wait patiently |
| Stuck behind a chain of login popups | Esc was allowed only once per step | Back is allowed again on each new popup, at most 5 times per step |
| "Nothing started" after picking an item | The start button appears below the fold | Scroll down for it |
| "Already running" on an idle page | A fire animation that never stops | Learn each page's idle motion; trust changing numbers |
| An unfinished task counted as done | The card's label changed from "Active" to "Ready to Claim" | Done only when a different task is active |

### 8.7 Interfaces without a back key

- **What happened:** Melvor has no menu key and no back key. Its sidebar scrolls, and at its end the scroll is
  passed to the page underneath.
- **What was needed:**
  - *hub mode*: every page is one click from a hub;
  - going back by clicking the page's name;
  - finding the *menu column* (many short labels aligned on their left edge);
  - remembering how far to scroll for each button;
  - undoing a scroll that made the hub unrecognisable.
- **Lesson:** *navigation assumptions from one game family (Esc opens the menu, Esc goes back) are the first thing
  a second game breaks.*

### 8.8 Tooling and process

- **A launcher process is not the window.** The desktop app shut itself down because it waited on the browser
  launcher, which exits at once when the browser is already running.
- **Launch like the file explorer does.** An admin-only game must be started through the shell (ShellExecute), not
  spawned directly.
- **Animation frames pause in hidden windows.** The 3D map's layout must be settled synchronously before the first
  draw.
- **Watch the live log and capture the screen when something looks odd.** Most bugs above were found in seconds
  that way.
- **Don't do the agent's job for it.** During the second game a developer drove the game by hand to move things
  along. That defeated the experiment: the agent learned nothing from it, and the player could not see or pause the
  agent. *Interventions should go through the agent's own teaching channels (watching, notes, facts), or be
  clearly recorded as interventions.*

---

## 9. Results so far

| Measure | Result |
|---|---|
| Watching, one hour of *Zenless Zone Zero* | 45 screens, 402 buttons, 161 links and 77 reward buttons learned; the raw recording deleted |
| Recognition after watching | main menu recognised in about 0.1 s |
| Graph size, *Zenless Zone Zero* profile | 1,496 nodes, 1,403 links |
| Exploring, *Melvor Idle*, final session | 5 pages (close to all the tutorial allows), 21 links, 1 reward, no external links, never lost the hub |
| Web guide, *Melvor Idle* | wiki found unaided; 30 pages; 49 real menu names; 88 how-to lines |
| Quests, *Melvor Idle* | "Catch 3 Raw Shrimp" completed and claimed by the agent (tutorial 2/22 → 3/22) |
| Benchmark, simulated games | 100 % on all three tasks, cold and warm; 0 guarded clicks |
| Tests | 148 passing |

**Not yet shown:**
- An overnight autoplay run.
- A real-game exam baseline: it needs labelled pictures from a new watched session.
- A skill promoted to general on the strength of two real games.

The honest summary: **the parts for open-ended play exist and work individually. A real "playthrough" has not
happened yet.**

---

## 10. Discussion

### 10.1 Why knowledge, not a policy

A learned end-to-end policy would need a game-specific reward and large amounts of play. The evidence-graph design
learns from a handful of episodes, explains itself (every node has a source), runs offline on a consumer PC, and
can be corrected by a sentence from the player ("Mail is in the Menu"), effective mid-run. The price is
brittleness at perception. Almost every failure in section 8 is a perception or grounding failure, not a planning
one.

### 10.2 Slow promotion as a defence against overfitting to one game

Requiring two independent games before a skill becomes general is a cheap form of out-of-distribution validation.
The open question is whether "two games" should mean two *different engines or UI families*. "Claim All" proven
in two gacha games built on the same engine may not hold for a web idle game.

### 10.3 Safety as architecture

The guard words and house rules are not learned. They sit in a store no profile can write to, they apply to every
source of clicks (rules, advisor, goals, exploration, tutorial highlights, and points with text under them), and
they are scored by the exam as a gate. Several failures show why the boundary must be hard:
- a fuzzy match turned "claim" into "Claimable";
- a sidebar link left the game;
- a currency "+" led to a shop.

Each was harmless only because the guard held. Text from outside (wiki pages) is treated as information, never as
an instruction. This is the same boundary language-model agents need against prompt injection.

### 10.4 Measuring before changing

The benchmark's first act was to catch a lying success. A test that checks only "did it return OK" would have kept
it. *Check the world's state (the page it ended on, what was claimed), not the agent's report.*

---

## 11. Open questions

1. **Learned drive selection.** Autoplay's choice is a hand-set priority × success rate. Should it be a bandit per
   drive and game, with the general brain giving priors to a new game?
2. **From guide text to actions.** Should wiki sentences ("Raw Shrimp comes from Fishing", "Select Fishing from
   the left menu") enter the planner as *low-trust* edges that only in-game success can raise? How should that
   trust be bounded so a web page can never loosen safety?
3. **Lore as a graph.** The journal sorts text by keywords. Should journal entries link to the screens and terms
   they mention, so recall can answer "what is the Abyss?" and the agent can follow a story?
4. **Learned perception thresholds.** The chrome and menu-column model has fixed thresholds (2 % position, 0.75
   text similarity, ≥ 4 aligned labels). Should they be learned per game and judged by an exam "wrong title"
   score?
5. **Confidence-based acting.** Keep match scores and refuse low-confidence clicks on anything not yet proven,
   instead of acting on a fixed threshold.
6. **Icons.** Many buttons are icons. Can icon templates be labelled by what they opened ("the envelope opens
   Mail") and shared through the general brain?
7. **Planning with resources.** "Cook 3 Shrimp" needs raw shrimp. A task that needs something first should plan to
   make it (fish, then cook).
8. **Story games and 3D worlds.** The approach is strongest in menu-driven games (idle, gacha dailies,
   management). Dialogue choices and walking a 3D world need new goal types.
9. **Forgetting windows.** Is "unused in 5 runs" too eager for screens visited weekly? Should the window be counted
   in game days?

---

## 12. Conclusion

GrindPilot shows that a small, classical, inspectable system can learn a game's interface from watching and
safe exploration, carry lessons between games, and begin to make its own progress through a game's task list,
while running on a player's real machine and accounts without spending their money.

Its most reusable findings are not algorithms but disciplines:
- **ground** imported knowledge before trusting it;
- **make consolidation idempotent;**
- **cap hubs at both ends;**
- **record when counting began;**
- **match fuzzily for reading but exactly for pressing;**
- **check where actions land;**
- **keep safety outside learning;**
- **measure the world, not the agent's report.**

The goal of a full, unattended playthrough remains open. The next evidence will come from the first long
autoplay run and the first real-game exam baseline.

---

## Appendix A. Key parameters

| Parameter | Value |
|---|---|
| Screen signature | 160 × 90 grey |
| Planner cost | time / reliability² |
| Recall | personalised PageRank, d = 0.85, 20 iterations |
| Hub cap | 24 strongest links, at both ends |
| Promotion | ≥ 2 games, ≥ 3 wins, ≥ 80 %; or ≥ 15 wins at ≥ 90 % in one game |
| Demotion | < 50 % after 6 uses |
| Explore budget | 60 clicks, 15 min, depth ≤ 3, 14 tries per screen |
| Exam sampling | 1 keyframe in 20, ≤ 100 per recording, ≤ 600 per profile |
| Autoplay | sleep every 120 min, rest 15 min, daily rest window |

## Appendix B. Source

The project's own documentation (its "documentary", chapters 01–14) records each stage in more detail: the
architecture, the brain design and the exchange with Fractal, the safety model, the exam, both test games, and
autoplay. This paper condenses it for a general AI audience. Personal and account details are deliberately left
out.
