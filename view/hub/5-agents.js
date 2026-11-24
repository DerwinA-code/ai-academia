/* ---------- module: agents and tools ---------- */
mod("agents","Agents and tools","How a model acts: the loop, the judge, the instructions and the space it works in");

lesson({id:"loop",mod:"agents",title:"The agent tool loop",min:4,
 sub:"Model, tool call, result back into the context, model again, until it answers. Everything an agent does is this loop.",
 learn:[["The four moves of the loop",1],["Why results go back into the context",3],["Where the loop goes wrong",5]],
 metrics:[["turn","Turn"],["ctx","Context used"]],
 build(){let s=SC.box("ctx",40,130,150,80,"context","","rules + chat + results")+SC.box("mdl",250,40,140,60,"model")+SC.box("call",470,130,140,60,"tool call","warn","read_file(...)");
  s+=SC.box("tool",250,250,140,60,"tool runs","good","Rust, on the PC")+SC.box("ans",470,40,140,50,"answer","good");
  s+=SC.arrow("a1",190,150,250,80)+SC.arrow("a2",390,80,470,150)+SC.arrow("a3",520,190,390,270)+SC.arrow("a4",250,280,190,200)+SC.arrow("a5",390,60,470,62);return s},
 always:["ctx","mdl"],
 steps:[
  {t:"Read",title:"The model reads its whole context",show:["a1"],m:{turn:1,ctx:"8K"},body:"<p>Rules, the chat, earlier tool results: the model sees all of it on every turn.</p>"},
  {t:"Call",title:"It asks for a tool",show:["a2","call"],body:"<p>Instead of answering, it writes a structured call: a tool name and arguments. Studio parses it.</p>"},
  {t:"Run",title:"The tool runs outside the model",show:["a3","tool"],body:"<p>Studio runs the tool for real (read a file, run a command, search). Guards decide what may run (see command guards).</p>"},
  {t:"Back",title:"The result goes back into the context",show:["a4"],m:{turn:2,ctx:"14K"},body:"<p>The output is appended to the context and the model runs again with it. That is how it \"sees\" the world: only through what comes back.</p>",key:"The model never touches anything directly; it only reads what tools return."},
  {t:"Answer",title:"It stops when it answers",show:["a5","ans"],body:"<p>When it writes a reply with no tool call, the loop ends.</p>"},
  {t:"Failures",title:"Where loops go wrong",body:"<p>Context fills with results (see fixed context), the model trusts a tool's text as instructions (prompt injection), or it loops on the same call. Each has its own lesson.</p>",lat:"Fractal 3.4: Studio and the tool loop; 3.58: the loop in Rust (the <code>agent</code> part)."},
 ],
 records:["<b>Fractal Part 1.6, 3.4, 3.58</b>","<b>AI academia 03</b>"],
 quiz:[{q:"How does the model learn what a file contains?",o:["The tool's output is appended to its context","It reads the disk itself","It remembers it from training"],a:0,why:"Everything comes back as text in the context."}]});

lesson({id:"repair",mod:"agents",title:"Solve, check, repair with a compiler",min:5,
 sub:"Let the compiler and the tests judge, and send the model their exact words. A judge that can't be argued with beats the model's own opinion.",
 learn:[["Why the model is a poor judge of its own code",1],["The loop: write, compile, test, repair",2],["What the playbook adds",4]],
 metrics:[["pass","Rust exam"]],
 build(){let s=SC.box("w",40,140,120,60,"write")+SC.box("c",210,140,120,60,"cargo check","warn")+SC.box("t",380,140,120,60,"tests","warn")+SC.box("d",540,140,80,60,"done","good");
  s+=SC.arrow("a1",160,170,210,170)+SC.arrow("a2",330,170,380,170)+SC.arrow("a3",500,170,540,170);
  s+=SC.curve("back","M270 200 C 270 270 100 270 100 202","bad");s+=SC.text("err",185,290,"error[E0382]: borrow of moved value: `v`","sm");return s},
 steps:[
  {t:"Self-check",title:"Asking the model if it's right doesn't work well",show:["w"],body:"<p>A model that wrote a bug usually believes the bug. Its \"looks correct\" carries little information.</p>"},
  {t:"The judge",title:"The compiler and tests are the judge",show:["c","t","a1","a2"],body:"<p>Rust's compiler checks types and borrowing; the tests check behaviour. Both give exact, unarguable messages.</p>"},
  {t:"Repair",title:"Send back the exact error",show:["back","err"],m:{pass:"142 of 156"},body:"<p>The error text goes back to the model, which repairs and tries again, a few rounds at most.</p>",key:"The judge's own words are worth more than any summary of them."},
  {t:"Done",title:"Stop when everything passes",show:["d","a3"]},
  {t:"Playbook",title:"Rules learned from past failures",m:{pass:"148 of 156"},body:"<p>The Rust academy's playbook lists the mistakes the 27B kept making. Given with the task, it lifted the exam from 142 to 148 (fixed 8, broke 2 against no playbook, live run of 23 Nov).</p>",lat:"Fractal 3.1, 3.22, 3.44 (exam kit), 3.84 (the playbook live: 148 of 156)."},
 ],
 records:["<b>Fractal 3.1, 3.22, 3.44, 3.84</b>","<b>AI academia 03</b>: compilers as judges"],
 quiz:[{q:"Why send the compiler's exact message rather than 'it failed'?",o:["It names the line and the cause, so the repair can be targeted","It's shorter","The model ignores summaries"],a:0,why:"The exact error tells the model what and where; a summary loses both."}]});

lesson({id:"lessons",mod:"agents",title:"Lessons and playbooks in the prompt",min:5,
 sub:"A line in the instructions can change behaviour, but only some kinds. Measure every line; most do nothing, some do harm.",
 learn:[["What a prompt line can change",1],["Why a line can break other tasks",3],["Habits that prompts don't move",4]],
 metrics:[["m","Mean of 26"]],
 build(){const rows=[["plain","20.7",""],["standing rules","21",""],["change only what's needed","21",""],["never add by hand","20","bad"],["edge cases","21.6","good"],["all four","21.7","warn"]];let s="";
  rows.forEach(([l,v,c],i)=>{s+=SC.box("r"+i,60,30+i*50,330,40,l,c)+SC.text("v"+i,450,55+i*50,v+" of 26","")});return s},
 steps:[
  {t:"Lines",title:"Instructions are part of the input",show:["r0","v0"],m:{m:"20.7"},body:"<p>A lesson is a sentence added to the system prompt: \"list every edge case\", \"use a tool to add up\". It costs tokens on every turn.</p>"},
  {t:"Measured",title:"Each line, one at a time",show:["r1","v1","r2","v2","r3","v3","r4","v4"],body:"<p>On 23 Nov each candidate line ran on the 26-task hard exam. Most landed on the plain model's own spread.</p>"},
  {t:"Harm",title:"A line can break what worked",show:["r5","v5"],hl:["r3","r5"],body:"<p>\"Never add up by hand\" sent the model to a tool on a task it did correctly by hand, and broke it every time. Lines interact with tasks they weren't written for.</p>",key:"Check what a line breaks, not just what it fixes."},
  {t:"Habits",title:"A rule it can see, and breaks anyway",body:"<p>The fading-rule task failed 0 of 7 times even with the rule quoted on every turn: the model wrote the banned unit in brackets right after the rule. That is a habit, not forgetting, and prompts don't move habits. Training might.</p>"},
  {t:"Wider check",title:"And check on a second exam",body:"<p>The edge-case line fixed one task on the hard exam, then cost five problems on the Rust exam (148 → 143). Not adopted.</p>",lat:"Fractal 3.81, 3.84; the line files are <code>runtime\\experiments\\2026-11-23\\L1–L7</code>."},
 ],
 records:["<b>Fractal 3.2</b> (the Coach), <b>3.20</b> (playbooks), <b>3.81, 3.84</b>"],
 quiz:[{q:"A new prompt line fixes one task. Before adopting it you should…",o:["Check what it broke, repeat it, and test on a second exam","Adopt it: fixes are fixes","Add three more lines"],a:0,why:"Lines can break unrelated tasks, and one run is inside the noise."}]});

lesson({id:"context",mod:"agents",title:"Working inside a fixed context",min:5,
 sub:"The context window is a fixed budget. Long tasks overflow it unless old tool output is trimmed and progress is written to a checkpoint.",
 learn:[["Why long tasks overflow",1],["Masking old tool output",2],["Checkpoint notes and a fresh start",3]],
 metrics:[["used","Used of 36K"]],
 build(){let s=SC.raw("win",`<rect x="40" y="60" width="560" height="60" rx="10" fill="none" stroke="var(--line2)"/><text class="lbl sm" x="320" y="50" text-anchor="middle">context window: 36,864 tokens</text>`);
  const blk=(id,x,w,c,l)=>SC.raw(id,`<rect x="${x}" y="66" width="${w}" height="48" rx="6" fill="color-mix(in srgb,var(--${c}) 25%,transparent)" stroke="var(--${c})"/><text class="lbl sm" x="${x+w/2}" y="94" text-anchor="middle">${l}</text>`);
  s+=blk("rules",46,70,"accent","rules")+blk("t1",120,130,"warn","file A")+blk("t2",254,130,"warn","file B")+blk("t3",388,130,"warn","file C")+blk("t4",522,72,"bad","full");
  s+=blk("m1",120,60,"line2","A: masked")+blk("m2",184,60,"line2","B: masked");
  s+=SC.box("ck",200,200,240,60,"checkpoint note","good","goal, done, next, facts");return s},
 always:["win","rules"],
 steps:[
  {t:"Filling",title:"Every tool result takes space",show:["t1","t2","t3"],m:{used:"30K"},body:"<p>Reading three big files can take most of the window. The answer still needs room.</p>"},
  {t:"Overflow",title:"Then it overflows",show:["t4"],m:{used:"36K+"},body:"<p>Past the limit, the oldest text is cut or the request fails. Worst of all, the model may lose the instructions.</p>"},
  {t:"Mask",title:"Replace old output with a stub",hide:["t1","t2","t4"],show:["m1","m2"],m:{used:"18K"},body:"<p>Once a result has been used, its body is swapped for a one-line stub (\"file A, 40 KB, read at turn 3\"). The model can read it again if it needs to.</p>",key:"Keep decisions, drop raw material that has already been digested."},
  {t:"Checkpoint",title:"Write progress down, then start fresh",show:["ck"],body:"<p>For very long work, the agent writes a checkpoint (goal, what's done, what's next, key facts) and continues in a fresh context from the note. Work survives a restart too.</p>",lat:"Fractal 3.5 (fixed context), 3.38 and 3.55 (work that survives a restart, the handoff part)."},
 ],
 records:["<b>Fractal 3.5, 3.38, 3.55</b>","<b>AI academia 04</b>"],
 lab(root){root.innerHTML=`<span class="eyebrow">Lab</span><h2>Run a long task in 36K</h2><p class="sm">Each step reads a file. Turn masking on and off, and see on which step the window overflows.</p>
  <div class="cols"><div class="ctl">${slider("cf","File size (thousand tokens)",1,12,0.5,5)}${slider("cs","Steps in the task",2,40,1,12)}<label><span>Mask results after use</span><select id="cm"><option value="1">on</option><option value="0">off</option></select></label>${slider("cc","Checkpoint every N steps (0 = never)",0,20,1,0)}</div>
  <div class="out"><svg class="labsvg" viewBox="0 0 520 140" id="csv"></svg><div class="verdict" id="cv"></div></div></div>`;
  const run=()=>{const f=val(root,"cf"),n=val(root,"cs"),mask=root.querySelector("#cm").value==="1",ck=val(root,"cc"),W=36.864;let used=3,fail=0,pts=[];
   for(let i=1;i<=n;i++){if(ck&&i%ck===1&&i>1)used=4;used+=f+0.6;if(mask&&i>1)used-=f*0.9;pts.push(used);if(used>W&&!fail)fail=i}
   let s=`<line x1="20" y1="${120-W/W*100}" x2="500" y2="${120-W/W*100}" stroke="var(--bad)" stroke-dasharray="5 4"/>`;
   pts.forEach((u,i)=>{const h=Math.min(u/W,1.15)*100;s+=`<rect x="${20+i*480/n}" y="${120-h}" width="${Math.max(2,480/n-2)}" height="${h}" fill="${u>W?"var(--bad)":"var(--accent)"}" opacity=".7"/>`});
   root.querySelector("#csv").innerHTML=s;const v=root.querySelector("#cv");v.className="verdict "+(fail?"bad":"good");
   v.innerHTML=fail?`Overflows at step <b>${fail}</b> of ${n}.`:`All ${n} steps fit; peak ${Math.max(...pts).toFixed(1)}K of 36.9K.`};
  wire(root,["cf","cs","cc"],[],run);root.querySelector("#cm").addEventListener("change",run);
 }});
