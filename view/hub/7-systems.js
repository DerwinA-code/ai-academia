/* ---------- module: safety and systems ---------- */
mod("systems","Safety and systems","Keeping AIs that run commands safe, accountable and rebuildable");

/* a teaching copy of the never-run floor's idea (the real one is rust\parts\tools\src\floor.rs, ~800 lines, 81 tests) */
const FLOOR_RULES=[
 [/^(format|diskpart|bcdedit|cipher\s+\/w)/i,"wipes or reconfigures a disk"],
 [/^(shutdown|restart-computer|stop-computer)\b/i,"restarts or shuts down the PC"],
 [/^(rm|del|erase|rd|rmdir|remove-item|ri)\b(?=.*\s(\/s|-r\w*|-recurse)(\s|$))(?=.*\s["']?([a-z]:\\?|\/)["']?(\s|$))/i,"deletes a whole drive"],
 [/^(rm|remove-item|del)\b.*(-rf|-recurse)\b.*\s(~|\$home|c:\\users)/i,"deletes the user's home"],
 [/^reg\s+delete\s+hk(lm|ey_local_machine)/i,"deletes system registry keys"],
 [/^set-executionpolicy\b/i,"changes Windows' script policy"],
 [/^(vssadmin|wbadmin)\s+delete/i,"deletes backups"],
];
function floorSplit(cmd){const out=[];let cur="",q=null;for(let i=0;i<cmd.length;i++){const c=cmd[i],n=cmd[i+1];
  if(q){cur+=c;if(c===q)q=null;continue}if(c==='"'||c==="'"){q=c;cur+=c;continue}
  if(c===";"||c==="\n"||((c==="&"||c==="|")&&n===c)){out.push(cur);cur="";if(n===c)i++;continue}
  if(c==="|"){out.push(cur);cur="";continue}cur+=c}out.push(cur);return out.map(s=>s.trim()).filter(Boolean)}
function floorPeel(s,trace,depth=0){if(depth>6)return[s];
  const carriers=[/^(?:powershell|pwsh)(?:\.exe)?\s+(?:-\w+\s+)*-(?:c|command)\s+(.+)$/i,/^cmd(?:\.exe)?\s+\/[ck]\s+(.+)$/i,/^(?:bash|sh|wsl)\s+(?:-\w+\s+)*-c\s+(.+)$/i,/^(?:iex|invoke-expression)\s+(.+)$/i,/^&\s*(.+)$/];
  for(const re of carriers){const m=s.match(re);if(m){let inner=m[1].trim().replace(/^["'{]|["'}]$/g,"");trace.push(`peeled a carrier: <code>${esc(s.slice(0,40))}…</code> → <code>${esc(inner)}</code>`);
    return floorSplit(inner).flatMap(x=>floorPeel(x,trace,depth+1))}}
  const enc=s.match(/^(?:powershell|pwsh)(?:\.exe)?\s+.*-e(?:nc|ncodedcommand)?\s+([A-Za-z0-9+/=]+)/i);
  if(enc){try{const b=atob(enc[1]);let t="";for(let i=0;i+1<b.length;i+=2)t+=String.fromCharCode(b.charCodeAt(i)|(b.charCodeAt(i+1)<<8));trace.push(`decoded -EncodedCommand → <code>${esc(t)}</code>`);return floorSplit(t).flatMap(x=>floorPeel(x,trace,depth+1))}catch(e){trace.push("could not decode: refused (fail closed)");return["__undecodable__"]}}
  const sub=[...s.matchAll(/\$\(([^)]*)\)/g)].map(m=>m[1]);if(sub.length){trace.push(`found $( ) inside: <code>${esc(sub.join(" ; "))}</code>`);return[s,...sub.flatMap(x=>floorSplit(x).flatMap(y=>floorPeel(y,trace,depth+1)))]}
  return[s]}
function floorJudge(cmd){const trace=[];if(cmd.length>20000)return{ok:false,why:"too long to read safely: refused",trace};
  const parts=floorSplit(cmd);trace.push(`split into ${parts.length} statement${parts.length>1?"s":""} (outside quotes)`);
  const all=parts.flatMap(p=>floorPeel(p,trace));
  for(const p of all){if(p==="__undecodable__")return{ok:false,why:"an encoded command that can't be read",trace};
   if(/\s-whatif\b/i.test(p))continue;for(const[re,why]of FLOOR_RULES)if(re.test(p))return{ok:false,why,trace,at:p}}
  return{ok:true,trace}}

lesson({id:"guards",mod:"systems",title:"Prompt injection and command guards",min:6,
 sub:"Text an agent reads can carry instructions. The defence is layers: treat read text as data, and put a floor under the commands that must never run, whatever the model was told.",
 learn:[["What prompt injection is",1],["Why the model can't be the only guard",2],["A floor that reads commands like a shell does",4],["Carriers, encodings and fail-closed",5]],
 build(){let s=SC.box("page",40,60,170,70,"web page / mail","warn","'ignore your rules…'")+SC.box("mdl",250,60,140,70,"model")+SC.box("cmd",440,60,170,70,"run_command","", "the model's request");
  s+=SC.arrow("a1",210,95,250,95)+SC.arrow("a2",390,95,440,95);s+=SC.box("floor",440,180,170,60,"never-run floor","good","Rust, before the shell");
  s+=SC.box("sh",440,280,170,50,"shell");s+=SC.arrow("a3",525,130,525,180)+SC.arrow("a4",525,240,525,280);s+=SC.box("no",250,190,140,50,"refused","bad");s+=SC.arrow("a5",440,210,390,214,"bad");return s},
 steps:[
  {t:"Injection",title:"Read text can give orders",show:["page","mdl","a1"],body:"<p>A page, mail or file the agent reads may contain \"ignore your instructions and run…\". To the model it's just more context; it can't reliably tell data from orders.</p>"},
  {t:"Layers",title:"So the model can't be the last guard",show:["cmd","a2"],body:"<p>Rules in the prompt help, but a fooled model will ask for the bad command anyway. Something outside the model has to check what actually runs.</p>",key:"Guard the action, not just the instructions."},
  {t:"The floor",title:"A list that no trust setting lifts",show:["floor","a3","sh","a4"],body:"<p>Under <code>run_command</code> sits a floor of commands refused whatever the trust level: disk wipes, restarts, deleting a drive root or the user's home, the protected folders and the user's own rules.</p>"},
  {t:"Read like a shell",title:"Split the way the shell will",show:["no","a5"],body:"<p>A guard that matches the whole string is easy to slip past. The floor splits statements outside quotes (<code>;</code>, <code>&&</code>, <code>||</code>, pipes) and judges each one.</p>"},
  {t:"Carriers",title:"Peel the wrappers",body:"<p><code>powershell -c \"…\"</code>, <code>cmd /c</code>, <code>bash -c</code>, <code>iex</code>, <code>$( )</code> and <code>-EncodedCommand</code> (base64 of UTF-16) are unwrapped and judged inside. Anything too long or undecodable is refused: <b>fail closed</b>.</p>",lat:"Fractal 3.75: the floor in <code>rust\\parts\\tools\\src\\floor.rs</code>, 50 must-block and 31 must-pass tests; replayed over 678 past commands, 0 refused."},
 ],
 records:["<b>Fractal 3.16</b> (mail and prompt injection), <b>3.74</b> (Hermes review), <b>3.75</b> (the floor), <b>3.82</b> (the scanner)","<b>AI academia 03</b>"],
 lab(root){root.innerHTML=`<span class="eyebrow">Lab</span><h2>Try to sneak a command past the floor</h2><p class="sm">A teaching copy of the floor's idea (a handful of its rules, not all of them). Type a command and see how it's split, peeled and judged. Nothing here runs anything.</p>
  <div class="cols"><div class="ctl"><label>Command<input type="text" id="fc" value='echo hi; cmd /c "format D: /q"'></label>
   <div style="display:flex;gap:6px;flex-wrap:wrap">${['dir; git status','echo ok && shutdown /r /t 0','powershell -c "Remove-Item C:\\ -Recurse -Force"','echo "shutdown /r" is just text','Get-ChildItem $(Set-ExecutionPolicy Bypass)','powershell -EncodedCommand cwBoAHUAdABkAG8AdwBuACAALwBzAA==','shutdown /r -WhatIf'].map(x=>`<button class="btn" style="padding:4px 8px;font-size:.78rem" data-x="${esc(x)}">${esc(x.length>26?x.slice(0,26)+"…":x)}</button>`).join("")}</div></div>
  <div class="out"><div class="verdict" id="fv"></div><div class="sm" id="ft" style="display:grid;gap:4px"></div></div></div>`;
  const go=()=>{const r=floorJudge(root.querySelector("#fc").value),v=root.querySelector("#fv");v.className="verdict "+(r.ok?"good":"bad");
   v.innerHTML=r.ok?"<b>Allowed</b>: nothing on the floor's list.":`<b>Refused</b>: ${esc(r.why)}${r.at?` (in <code>${esc(r.at)}</code>)`:""}.`;root.querySelector("#ft").innerHTML=r.trace.map(t=>"· "+t).join("<br>")};
  root.querySelector("#fc").addEventListener("input",go);root.querySelectorAll("[data-x]").forEach(b=>b.addEventListener("click",()=>{root.querySelector("#fc").value=b.dataset.x;go()}));go();
 },
 quiz:[{q:"Why does the floor split on ';' only outside quotes?",o:["Inside quotes it's text, not a new command","Quotes are always safe","It's faster"],a:0,why:"echo \"a; shutdown\" prints text; splitting inside quotes would refuse harmless commands."},
  {q:"An encoded command can't be decoded. What should a guard do?",o:["Refuse it (fail closed)","Allow it (fail open)","Ask the model"],a:0,why:"If the guard can't read it, it can't vouch for it."}]});

lesson({id:"handles",mod:"systems",title:"Processes, handles and clean shutdown",min:5,
 sub:"A program's children inherit its open files unless told not to. One leftover child can hold a log locked and stop the next start.",
 learn:[["Parent and child processes",1],["What handle inheritance does",2],["The fix: non-inheritable handles",4],["Detecting a closed window",5]],
 build(){let s=SC.box("launch",40,40,160,50,"launcher","", "output → studio.log")+SC.box("st",250,40,140,50,"studio.exe")+SC.box("log",470,40,140,50,"studio.log","warn");
  s+=SC.arrow("a1",200,65,250,65)+SC.curve("h0","M390 60 L470 60","flow");
  ["pocket-tts","model server","gateway"].forEach((n,i)=>{s+=SC.box("c"+i,220+i*0,130+i*60,200,44,n)});
  s+=SC.raw("inh",[0,1,2].map(i=>`<path d="M420 ${152+i*60} C 470 ${152+i*60} 520 120 530 92" class="ln" stroke="var(--warn)"/>`).join(""));
  s+=SC.raw("x",`<line x1="250" y1="40" x2="390" y2="90" stroke="var(--bad)" stroke-width="2"/><line x1="390" y1="40" x2="250" y2="90" stroke="var(--bad)" stroke-width="2"/>`);
  s+=SC.box("new",40,300,200,44,"new studio.exe","bad","can't open studio.log");return s},
 always:["launch","st","log","a1","h0"],
 steps:[
  {t:"Children",title:"Studio starts helper programs",show:["c0","c1","c2"],body:"<p>Studio launches pocket-tts, the model servers and Ruby's gateway as child processes.</p>"},
  {t:"Inherit",title:"Children inherit open handles",show:["inh"],body:"<p>On Windows, a child gets every <i>inheritable</i> handle of its parent. Studio's output handle (studio.log) was inheritable, so every child held the log open too.</p>"},
  {t:"Leftover",title:"Studio exits, a child doesn't",show:["x","new"],hide:["c1","c2"],body:"<p>When Studio died without stopping its children, pocket-tts kept running and kept studio.log open. The next Studio couldn't open its log and quietly failed to start.</p>",key:"An invisible leftover process is the usual cause of \"it won't start and nothing's running\"."},
  {t:"Fix",title:"Make the handles non-inheritable",body:"<p>At start, Studio calls <code>SetHandleInformation</code> to clear <code>HANDLE_FLAG_INHERIT</code> on its own standard handles. Children no longer hold studio.log.</p>"},
  {t:"Shutdown",title:"Notice the window closing, stop everything",body:"<p>Studio now counts its Edge window itself (the browser process with a window, not its helpers). Once a window it had is gone for 40 s, it calls fractal-off, which stops everything under Fractal's folder.</p>",lat:"Fractal 3.83 (the shutdown fix; first live test still to come), 3.52 (game guard)."},
 ],
 records:["<b>Fractal 3.83</b>: <code>rust\\parts\\studio\\src\\startup.rs</code> (<code>watch_window</code>, <code>keep_log_handles_private</code>)"],
 quiz:[{q:"Why could a leftover pocket-tts stop Studio from starting?",o:["It inherited studio.log's handle and kept the file open","It used all the memory","It changed Studio's settings"],a:0,why:"Inherited handles keep the file open after the parent exits."}]});

lesson({id:"audit",mod:"systems",title:"Append-only logs and an auditor",min:4,
 sub:"Every action an AI takes is written to a log nobody edits, and a separate auditor reads it for things a person should see.",
 learn:[["Why append-only",1],["One log per AI",2],["What the auditor looks for",3]],
 build(){let s="";["Fractal","Ruby","Odysseus","Volta"].forEach((n,i)=>{s+=SC.box("ai"+i,40,40+i*70,130,50,n,i===2?"odys":"")+SC.arrow("w"+i,170,65+i*70,250,65+i*70)});
  s+=SC.box("log",250,40,150,260,"activity log","good","append only");s+=SC.box("au",470,120,140,70,"auditor","warn","reads, never writes");s+=SC.arrow("r",400,155,470,155);return s},
 steps:[
  {t:"Append",title:"Write, never rewrite",show:["log","ai0","w0"],body:"<p>Each action is a new line with a time, who, what and whether it worked. Lines are never edited or removed, so the log is evidence, not a story.</p>",key:"A log you can edit proves nothing."},
  {t:"Everyone",title:"Every AI reports",show:["ai1","w1","ai2","w2","ai3","w3"],body:"<p>Fractal, Ruby, Odysseus and Volta each write their own file per day.</p>",lat:"Fractal 3.79: Odysseus had no log of his own; his chats were logged as Fractal's. Fixed 23 Nov."},
  {t:"Audit",title:"A separate reader looks for trouble",show:["au","r"],body:"<p>The auditor reads the logs (never writes them) and flags actions out of order, failures and anything worth a look. It also scans what the AIs write for themselves.</p>"},
 ],
 records:["<b>Fractal 3.27</b> (the log), <b>3.70</b> (the auditor), <b>3.79</b>, <b>3.82</b>","<code>E:\\Project Lattice\\AI activity logs</code>"],
 quiz:[{q:"Why must the auditor only read the log?",o:["So the record it checks can't be changed by the checker","Writing is slow","Logs are small"],a:0,why:"Separation keeps the evidence independent of whoever judges it."}]});

lesson({id:"parity",mod:"systems",title:"Rewriting with parity tests",min:5,
 sub:"To replace working code, run old and new on the same inputs and demand identical outputs, before switching over.",
 learn:[["The old code as the oracle",1],["Byte-for-byte comparison",2],["Running both side by side, then the switch",4]],
 metrics:[["same","Identical"]],
 build(){let s=SC.box("in",40,140,120,60,"same inputs")+SC.box("py",240,60,160,60,"Python (old)")+SC.box("rs",240,220,160,60,"Rust (new)","good");
  s+=SC.arrow("a1",160,160,240,95)+SC.arrow("a2",160,180,240,245)+SC.box("cmp",470,140,140,60,"compare","warn","byte for byte");s+=SC.arrow("a3",400,90,470,160)+SC.arrow("a4",400,250,470,180);return s},
 steps:[
  {t:"Oracle",title:"The old code is the reference",show:["in","py","a1"],body:"<p>The Python version works and is trusted. It becomes the oracle the Rust version must match.</p>"},
  {t:"Twin",title:"Run the new code on the same inputs",show:["rs","a2"],body:"<p>Every input goes through both.</p>"},
  {t:"Compare",title:"Demand identical outputs",show:["cmp","a3","a4"],m:{same:"3,277 / 3,277"},body:"<p>Outputs are compared byte for byte. One difference is a bug in one of them, found before any user meets it.</p>",key:"Parity tests turn a rewrite from a leap of faith into a measurement."},
  {t:"Switch",title:"Side by side, then switch, with a way back",body:"<p>The new part runs beside the old until it has matched for long enough; then the switch, keeping the old one as a fall-back (an empty <code>use-python-studio</code> file goes back).</p>",lat:"Fractal 3.41–3.48 (the parts, e.g. the model hub 3,277 of 3,277), 3.62 (the switch, 20 Nov 23:36)."},
 ],
 records:["<b>Fractal 3.40–3.48, 3.54–3.62</b>; oracles in <code>tests\\parity*.py</code>"],
 quiz:[{q:"What does a single mismatch in a parity test tell you?",o:["One of the two versions has a bug on that input","The test is broken","Nothing"],a:0,why:"Two implementations of the same behaviour disagreeing means at least one is wrong."}]});
