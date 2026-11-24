# 09 Interfaces for AI

How to show what an AI is doing and how to make AI feel present. Sources: Ruby's `docs\RESEARCH.md` (Kara, Rose/JARVIS,
Azaris), Fractal's academia 3.14 and 3.18, GrindPilot's brain write-up, and the Lattice station (`docs/LATTICE.md`).

---

## 1. What makes the impressive AI demos impressive

- **The wow is mostly the interface.** Kara (tonythetechie) uses particle avatars, HUD dashboards and a projected
  keyboard, all built as web apps over ordinary models (local plus cloud). The creator said "the ai model is a hybrid
  between local and frontier models". The projected keyboard is a web app whose keys map to shortcuts.
- **Speed comes from small custom models doing the talking** (Rose/JARVIS, see 07). A big model works in the
  background, and a sub-agent does deep research while the assistant decides what's worth presenting.
- **Coding agents produce poor design on their own** (Huw Prosser's blog): UI needs a lot of human direction.
- **Model switching that keeps memory** and **reaching the assistant through many channels** (phone, text, chat apps)
  are the two ideas worth keeping from hosted "agent platforms". Their pitch is a cloud funnel, not a dependency.

**How we know.**
- Kara's interface and the creator's "hybrid" quote: outside source, "tonythetechie (Kara) reels and comments" (R); our notes in `Ruby\docs\RESEARCH.md` section 1.
- Small custom models talking, the sub-agent, and coding agents' poor design: "Huw Prosser, "Some thoughts on JARVIS" (huwprosser.com, 12 May 2026), Rose reels" (R); `Ruby\docs\RESEARCH.md` section 2.
- Agent platforms (model switching, many channels): "lukebuildsai, "Azaris" (reel)" (R); `Ruby\docs\RESEARCH.md` section 5.
- None of this is our measurement.

**The idea behind it:** none of the listed techniques; the felt quality of an assistant is mostly its interface and its speed.


## 2. Showing an AI's activity honestly (rules the user approved)

- **Only real events and numbers move.** Nothing animates for show. One particle or orbit dot per real tool call;
  numbers come from live readings.
- **One look per AI:** no two entities share a shape or colour. Reuse each AI's own model everywhere it appears, so it
  is recognisable.
- **Thoughts form an inner orbit** (one dot per recent tool call, fading after about 90 s). **Ideas form an outer
  orbit** (pale when new, solid once taken up).
- **Messages travel in the sender's colour.** Warnings never use an AI's colour.
- **Rooms map to real parts of the system** (documents, code, memory, live stats, ideas). Always draw an open berth, so
  there is visible room for the next AI.
- **Calm by default, paused while hidden,** slower with reduce-motion, so the view never takes GPU time from games.
- **Personality without invention (Built 11 Nov 2026, Fractal academia 3.35).** When a status view feels dull, the
  tempting fix is idle animation and made-up chatter, which breaks the rule above. What worked: short speech bubbles
  whose content is computed from the state (an event that just happened, or a number that is true now), with each
  AI's character in the wording only, and replies when one event involves two AIs. An AI that isn't present says
  nothing. Keep the line-writing code free of the page so it can be tested: "nothing changed, nothing said" is a
  one-line check.
- **Privacy:** private and incognito activity never appears; a phone copy carries tool and file names only, never
  chat text. Watching is not the same as checking in.
- **Environment lighting for the scene, not the characters:** the station reflects a painted sky, but the AI models
  don't, so they look the same as everywhere else.

**How we know.**
- The rules: the user's approvals while the station and Studio were built, recorded in `Fractal\docs\LATTICE.md` and Fractal academia 3.14 and 3.18.
- Personality without invention: our build, Fractal academia 3.35; the line-writing check `Fractal\runtime\experiments\tests\station_chatter_unit.js` (32/32 there).
- Privacy and lighting rules: decisions; source not recorded beyond `Fractal\docs\LATTICE.md`.

**Proof.**
- Code: `Lattice hub\station\station.html`
- Check it yourself: `node Fractal\runtime\experiments\tests\station_chatter_unit.js`

**The idea behind it:** none of the listed techniques; only real events and numbers move on screen.


## 3. 3D maps of memory (measured lessons)

- **Animation frames pause in hidden windows.** A map that "settled" in requestAnimationFrame opened as a square block
  in a background tab. **Settle the layout synchronously before the first draw.**
- **Hubs make springs overshoot.** With a 60-link node and strong springs, the first frame showed the whole brain as a
  dot (zoom 0.0014). Fix (d3-style): divide each link's pull by the smaller endpoint degree, let the busier end move
  less, fit the camera to the 95th-percentile radius, and re-fit once when settled.
- **Plain canvas is enough for a 3D brain:** a perspective divide, a Barnes-Hut octree force layout and depth-sorted
  drawing, with no WebGL. It was tuned on the real map: repulsion 4, spring 0.22, rest length 4 + 12/(1+w), centre
  pull 0.016.
- **Save the settled layout in the browser.** The first open settles in ~2.2 s; every later open takes 0.42 s.
- **Show provenance on every node** (watched, imported, taught, general): it makes the map trustworthy, not just
  pretty.
- **One event feed for the whole app** (recent tool events polled or streamed) makes "show what the AI is doing" cheap
  to add anywhere.

**How we know.**
- All points are from building the Mind map, Fractal academia 3.14: zoom 0.0014 and the d3-style fix; the force settings (repulsion 4, spring 0.22, rest length, centre pull 0.016); 2.2 s first settle and 0.42 s later opens. Result files not kept (timings recorded in the section only).

**Proof.**
- Code: `Fractal\rust\parts\studio\page\studio.html` (today's page), `Fractal\fractal\studio\studio.html` (where it was built)
- Not kept: the timing runs.

**The idea behind it:** [Graph memory with personalised PageRank](https://derwina-code.github.io/ai-academia/Study%20hub.html#ppr)


## 4. Look and sound

- **Original assets only.** A request for a console's system sounds was met with original WebAudio sounds, because the
  recordings are copyrighted. The user's own files can replace them.
- **Style the user settled on** ("plasma HUD"): sleek thin-line icons, no emoji, hairline borders, a sharp HUD
  typeface, glowing additive cores against dark space.

**How we know.**
- Original WebAudio sounds in place of copyrighted console sounds: Fractal academia 3.18.
- The "plasma HUD" style: the user's choice, recorded in Fractal academia 3.18 and 3.59 (the Plasma look). Decisions, not measurements.

**The idea behind it:** none of the listed techniques; original assets only, in the style the user chose.


## 5. Drawing a map that keeps growing (Measured, 11 Nov 2026)

- **Per-item work belongs on the graphics card.** Fractal's Mind map drew each note with 2D canvas calls and sorted
  all notes by depth every frame: **19.3 ms a frame** at 6,467 notes and 12,617 links, already over a 60 Hz budget
  (16.7 ms). Moved to WebGL2 points, with the depth buffer doing the sorting, the same map takes **0.6 ms**, and a test
  map of 103,472 notes and 201,872 links takes **5.9 ms**. (One PC, a 1479×1115 canvas, median of 25–40 frames, while
  another job was using the same card.)
- **A point can look like a sphere for free.** Shading each point in the fragment shader (a gradient from a dark side
  to its colour, a rim and a highlight) gives 3D-looking nodes with no extra geometry. Below about 4 pixels the shading
  can't be seen, so fade it out there.
- **Keep items solid.** Dimming by mixing toward the background colour, instead of transparency, lets the depth test
  work without sorting.
- **Per-frame work in the page should not depend on the item count.** Recompute what is highlighted only when the
  hover, selection or search changes. Draw text and highlights for the few picked-out items on a 2D layer on top.
- **Keep the old path as a fallback.** The first shader build failed to link (two shaders declared one setting with
  different precision). The fallback turned that into a console warning instead of a blank page.
- **Still a lead:** the layout step (placing new nodes) is the next thing that grows with the item count.
- Record: Fractal academia 3.28.

**How we know.**
- 19.3 ms against 0.6 ms at 6,467 notes, 5.9 ms at 103,472 notes, the canvas size and medians, the shader-link failure and fallback: our measurement, Fractal academia 3.28 (its table). Result file not kept.

**Proof.**
- Code: `Fractal\rust\parts\studio\page\studio.html` (WebGL2 path with `mindDraw2D` fallback), first built in `Fractal\fractal\studio\studio.html`
- Not kept: the frame timings (recorded only in Fractal academia 3.28).

**The idea behind it:** none of the listed techniques; per-item work goes on the graphics card, per-frame page work stays independent of the item count.

