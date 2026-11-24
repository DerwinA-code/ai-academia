/* ---------- module: memory and learning ---------- */
mod("memory","Memory and learning","What the AIs remember, and how a model's skills are changed");

lesson({id:"ppr",mod:"memory",title:"Graph memory with personalised PageRank",min:6,
 sub:"Notes are nodes, links are edges. A random walk that keeps jumping back to the question's nodes finds what is relevant, even when it shares no words.",
 learn:[["Memory as a graph",1],["The random walk with restarts",3],["Why it finds notes that share no words",4],["Hubs and the recall exam",5]],
 build(){const N=[["q",120,180,"your question","warn"],["a",260,90,"Studio"],["b",260,270,"voice"],["c",400,60,"Rust switch"],["d",410,180,"Pocket TTS"],["e",540,120,"port 8012"],["f",540,260,"Chatterbox"]];
  const E=[["q","a"],["q","b"],["a","c"],["b","d"],["d","e"],["b","f"],["a","d"]];let s="";
  E.forEach(([x,y],i)=>{const A=N.find(n=>n[0]===x),B=N.find(n=>n[0]===y);s+=SC.raw("e"+i,`<line x1="${A[1]}" y1="${A[2]}" x2="${B[1]}" y2="${B[2]}" class="ln"/>`)});
  N.forEach(([id,x,y,l,c])=>{s+=SC.dot("n"+id,x,y,26,c||"")+SC.text("l"+id,x,y+44,l,"sm")});
  s+=SC.raw("walk",`<path d="M120 180 L260 270 L410 180 L540 120" class="ln flow"/>`);
  s+=SC.raw("back",`<path d="M540 120 C 400 0 200 40 128 156" class="ln" stroke-dasharray="3 5" marker-end="url(#ah)"/><text class="lbl sm" x="330" y="28" text-anchor="middle">restart: jump back to the question (probability α)</text>`);
  s+=SC.raw("big",`<circle cx="410" cy="180" r="36" fill="none" stroke="var(--accent)" stroke-width="2"/><circle cx="540" cy="120" r="32" fill="none" stroke="var(--accent)" stroke-width="2"/>`);return s},
 always:[],
 steps:[
  {t:"Graph",title:"Notes and their links",show:["na","nb","nc","nd","ne","nf","la","lb","lc","ld","le","lf","e2","e3","e4","e5","e6"],body:"<p>The Mind stores facts as nodes and connects those that mention each other or were written together.</p>"},
  {t:"Question",title:"A question lights up its nodes",show:["nq","lq","e0","e1"],body:"<p>The question's words match a few nodes directly: these are the walk's starting points.</p>"},
  {t:"Walk",title:"A random walk spreads out from them",show:["walk"],body:"<p>Picture a walker that, at each step, follows a random edge from where it stands.</p>"},
  {t:"Restart",title:"…but keeps jumping back to the question",show:["back"],body:"<p>With probability α (about 0.15) it jumps back to a question node instead. So it never wanders far: nodes near the question get visited most.</p><p><code>r = α·e_q + (1 − α)·Pᵀr</code>, iterated until it settles.</p>",key:"Visit frequency is the relevance score."},
  {t:"No shared words",title:"It finds notes that share no words",show:["big"],body:"<p>\"What port does her voice use?\" reaches <i>port 8012</i> through <i>voice → Pocket TTS</i>, though the note never says \"voice\".</p>"},
  {t:"Measured",title:"Measured on the recall exam",body:"<p>Every memory change runs the recall exam (112 questions) before and after. Hubs, nodes linked to everything, soak up the walk and need damping.</p>",lat:"Fractal 3.14 (the Mind), 3.30 (the recall exam, 80 of 112), 3.34 (three word-based fixes; none helped), 3.47 (memory in Rust, 78 of 112 through both)."},
 ],
 records:["<b>Fractal 3.14, 3.28, 3.30, 3.34, 3.47</b>","<b>AI academia 05</b>"],
 lab(root){root.innerHTML=`<span class="eyebrow">Lab</span><h2>Walk the graph</h2><p class="sm">Click a node to make it the question. Change the restart probability and watch relevance spread or stay close.</p>
  <div class="cols"><div class="ctl">${slider("pa","Restart probability α",0.02,0.9,0.01,0.15)}<p class="sm">Low α: the walker roams and hubs win. High α: only the question's neighbours score.</p></div>
  <div class="out"><svg class="labsvg" viewBox="0 0 520 260" id="psv"></svg></div></div>`;
  const N=[[60,130,"question"],[160,60,"Studio"],[160,200,"voice"],[280,40,"Rust"],[290,130,"Pocket"],[400,80,"port 8012"],[400,210,"Chatterbox"],[480,150,"hub note"],[290,230,"d1 clip"]];
  const E=[[0,1],[0,2],[1,3],[2,4],[4,5],[2,6],[1,4],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[6,8],[2,8]];let q=0;
  const draw=()=>{const a=val(root,"pa"),n=N.length,adj=N.map(()=>[]);E.forEach(([x,y])=>{adj[x].push(y);adj[y].push(x)});let r=N.map((_,i)=>i===q?1:0);
   for(let it=0;it<60;it++){const nr=N.map((_,i)=>i===q?a:0);r.forEach((v,i)=>adj[i].forEach(j=>nr[j]+=(1-a)*v/adj[i].length));r=nr}
   const mx=Math.max(...r);let s=E.map(([x,y])=>`<line x1="${N[x][0]}" y1="${N[x][1]}" x2="${N[y][0]}" y2="${N[y][1]}" class="ln"/>`).join("");
   N.forEach(([x,y,l],i)=>{const rr=8+24*r[i]/mx;s+=`<g data-i="${i}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="${rr}" fill="color-mix(in srgb,var(--${i===q?"warn":"accent"}) ${20+60*r[i]/mx}%,transparent)" stroke="var(--${i===q?"warn":"accent"})"/><text class="lbl sm" x="${x}" y="${y+rr+12}" text-anchor="middle">${l} ${(r[i]*100).toFixed(0)}</text></g>`});
   const sv=root.querySelector("#psv");sv.innerHTML=s;sv.querySelectorAll("g[data-i]").forEach(g=>g.addEventListener("click",()=>{q=+g.dataset.i;draw()}))};
  wire(root,["pa"],[],draw);
 },
 quiz:[{q:"What does the restart probability α control?",o:["How close to the question the walk stays","How many notes are stored","The size of each note"],a:0,why:"High α keeps jumping back, so only near neighbours score; low α lets hubs dominate."}]});

lesson({id:"sleep",mod:"memory",title:"Sleep: consolidating memory offline",min:4,
 sub:"When the PC is free, the AI rereads its recent chats and writes short notes for its Brain. Cheap, but what it writes has to be checked.",
 learn:[["Why consolidate offline",1],["What a note should and shouldn't be",3],["The risk: stale and poisoned notes",4]],
 build(){let s=SC.box("chats",40,80,150,70,"recent chats")+SC.box("sl",250,80,140,70,"Sleep","odys","the 27B, when idle")+SC.box("notes",450,80,150,70,"Brain notes","good");
  s+=SC.arrow("a1",190,115,250,115)+SC.arrow("a2",390,115,450,115);s+=SC.box("bad",450,200,150,60,"'I'm Ruby' note","bad","from a phone chat");s+=SC.box("scan",250,200,140,60,"scanner","warn","planted text?");return s},
 steps:[
  {t:"Idle",title:"Work done when nobody is waiting",show:["chats","sl","a1"],body:"<p>Sleep runs when the PC is free (no game, no chat, card idle). It reads the day's chats.</p>"},
  {t:"Notes",title:"It writes short notes for next time",show:["notes","a2"],body:"<p>Notes are added to the system prompt of later chats, so the AI starts knowing what it learned.</p>"},
  {t:"Good notes",title:"General, current, not duplicated",body:"<p>A good note is true beyond one chat and still true next week. About half of Sleep's notes in the 23 Nov audit were stale, duplicated or too specific, at about 560 tokens per chat.</p>",key:"Every note costs tokens on every chat forever; it has to earn its place."},
  {t:"Risks",title:"What it writes can mislead it",show:["bad","scan"],body:"<p>A note from a Ruby chat (\"refers to the assistant as Ruby\") made Fractal answer as Ruby. The note was turned off, and the scanner now checks self-written text for planted instructions.</p>",lat:"Fractal 3.13, 3.29 (Sleep), 3.82 (the scanner: 6,590 files, 0 hits)."},
 ],
 records:["<b>Fractal 3.13, 3.29, 3.65, 3.82</b>","<b>AI academia 06</b>"],
 quiz:[{q:"Why can a bad Sleep note do lasting harm?",o:["It's added to every later chat's prompt","It deletes chats","It slows the card"],a:0,why:"Notes ride along in the prompt, so a wrong one misleads every chat until removed."}]});

lesson({id:"distill",mod:"memory",title:"Distillation into a small model",min:5,
 sub:"A small student learns from a big teacher's answers, ideally from its whole probability spread, not just its top pick.",
 learn:[["Teacher and student",1],["Soft targets and temperature",2],["What a small brain trades away",4]],
 build(){let s=SC.box("t",60,60,160,70,"teacher","","big model")+SC.box("st",420,60,160,70,"student","good","phone-sized");s+=SC.arrow("a",220,95,420,95);
  s+=SC.raw("bars",["yes","maybe","no","other"].map((w,i)=>{const h=[90,40,15,6][i];return `<rect x="${110+i*40}" y="${280-h}" width="28" height="${h}" fill="color-mix(in srgb,var(--accent) 40%,transparent)" stroke="var(--accent)"/><text class="lbl sm" x="${124+i*40}" y="296" text-anchor="middle">${w}</text>`}).join("")+`<text class="lbl sm" x="190" y="170" text-anchor="middle">soft target: the whole spread</text>`);
  s+=SC.raw("hard",`<rect x="440" y="190" width="28" height="90" fill="var(--warn)"/><text class="lbl sm" x="454" y="296" text-anchor="middle">yes</text><text class="lbl sm" x="470" y="170" text-anchor="middle">hard target: top pick only</text>`);return s},
 steps:[
  {t:"Pair",title:"A big teacher, a small student",show:["t","st","a"],body:"<p>A phone can't run the 27B. A small model can learn to imitate it on the jobs that matter.</p>"},
  {t:"Soft",title:"Learn the spread, not just the answer",show:["bars","hard"],body:"<p>The teacher's probabilities say which wrong answers are nearly right. Training on that spread (softened by a temperature T, matched with KL divergence) carries more information per example than the top pick alone.</p><p><code>p_i = exp(z_i/T) / Σ exp(z_j/T)</code></p>",key:"Higher T flattens the spread and reveals the teacher's second choices."},
  {t:"Data",title:"Or learn from the teacher's written answers",body:"<p>When only text is available, the student is fine-tuned on the teacher's answers: sequence-level distillation.</p>"},
  {t:"Trade",title:"A small brain trades skills",body:"<p>Teaching it more of one thing can cost another. Ruby's rounds showed that, and why every candidate has to pass the same seeds before it replaces the current brain.</p>",lat:"Fractal 3.24 (distilling Ruby's phone brain); Ruby academia: v5 stays her brain after 6 candidates failed ten seeds."},
 ],
 records:["<b>Fractal 3.24</b>","<b>Ruby academia</b>: the rounds and the facts card","<b>AI academia 06, 12</b>"],
 lab(root){root.innerHTML=`<span class="eyebrow">Lab</span><h2>Soften the teacher</h2><div class="cols"><div class="ctl">${slider("dt","Temperature T",0.2,5,0.1,1)}</div><div class="out"><svg class="labsvg" viewBox="0 0 520 150" id="dsv"></svg><div class="sm">Teacher's raw scores: yes 4.0, maybe 2.5, no 1.0, other −1.0.</div></div></div>`;
  wire(root,["dt"],[],()=>{const z=[4,2.5,1,-1],T=val(root,"dt"),e=z.map(v=>Math.exp(v/T)),S=e.reduce((a,b)=>a+b),p=e.map(v=>v/S);
   root.querySelector("#dsv").innerHTML=p.map((v,i)=>`<rect x="${40+i*120}" y="${130-v*110}" width="70" height="${v*110}" rx="4" fill="color-mix(in srgb,var(--accent) 45%,transparent)" stroke="var(--accent)"/><text class="lbl sm" x="${75+i*120}" y="${124-v*110}" text-anchor="middle">${(v*100).toFixed(0)}%</text><text class="lbl sm" x="${75+i*120}" y="146" text-anchor="middle">${["yes","maybe","no","other"][i]}</text>`).join("")});
 }});

lesson({id:"lora",mod:"memory",title:"LoRA fine-tuning",min:5,
 sub:"Instead of changing a huge weight matrix, learn a thin correction made of two small matrices. A fraction of the memory, the original left untouched.",
 learn:[["Why full fine-tuning doesn't fit",1],["The low-rank update W + BA",2],["What rank buys and costs",3],["QLoRA: training on a 4-bit model",4]],
 metrics:[["full","Full update"],["lora","LoRA update"]],
 build(){let s=SC.box("W",60,80,180,180,"W (frozen)","","4096 × 4096");s+=SC.text("plus",280,175,"+","big");
  s+=SC.box("B",320,80,40,180,"B","good")+SC.box("A",380,80,180,40,"A","good")+SC.text("rk",470,150,"rank r = 16","sm");
  s+=SC.text("f",320,310,"W' = W + B·A   ·   trains r·(d_in + d_out) numbers instead of d_in·d_out","sm");return s},
 always:["W"],
 steps:[
  {t:"Too big",title:"Fine-tuning every weight needs huge memory",m:{full:"16.8M"},body:"<p>One 4096 × 4096 matrix has 16.8 million weights, and training keeps gradients and optimiser state for each: several times the model's own size.</p>"},
  {t:"Low rank",title:"Learn a thin correction instead",show:["plus","B","A","rk"],m:{lora:"131K"},body:"<p>LoRA freezes W and learns B (d × r) and A (r × d). Their product is a full-size update of rank r. With r = 16: 16 × (4096 + 4096) = 131K numbers, under 1% of the matrix.</p>",key:"The idea: the change a fine-tune needs is low-rank, even if the weights are not."},
  {t:"Rank",title:"Rank is the dial",show:["f"],body:"<p>Higher rank can express more change but costs more memory and overfits small data sooner. Adapters are small files and can be swapped without touching the base model.</p>"},
  {t:"QLoRA",title:"Train on top of a 4-bit model",body:"<p>QLoRA keeps the base weights in 4 bits and trains the adapter in higher precision, so a big model can be tuned on one card. The 27B is still too big for the 16 GB card; it is waiting for Volta's V100s.</p>",lat:"Fractal Part 7 (fine-tuning the 27B needs the V100s); Ruby's phone brains and Fractal's fast voice were trained on this PC."},
 ],
 records:["<b>Fractal Part 7</b>, <b>3.24</b>","<b>AI academia 06</b>: LoRA results"],
 lab(root){root.innerHTML=`<span class="eyebrow">Lab</span><h2>Size an adapter</h2><div class="cols"><div class="ctl">${slider("ld","Matrix size d",256,8192,256,4096)}${slider("lr","Rank r",1,256,1,16)}${slider("lm","Matrices adapted",1,500,1,256)}</div><div class="out"><div class="verdict" id="lov"></div></div></div>`;
  wire(root,["ld","lr","lm"],[],()=>{const d=val(root,"ld"),r=val(root,"lr"),m=val(root,"lm"),full=d*d*m,lo=r*2*d*m;root.querySelector("#lov").innerHTML=`Full: <b>${(full/1e6).toFixed(0)}M</b> numbers. LoRA: <b>${(lo/1e6).toFixed(1)}M</b> (${(lo/full*100).toFixed(2)}%), an adapter of about ${(lo*2/1e6).toFixed(0)} MB at 16 bits.`});
 }});

lesson({id:"moe",mod:"memory",title:"Mixture of experts and routers",min:5,
 sub:"Many expert blocks, a router picks a few per token. Total size grows; the work per token doesn't.",
 learn:[["Total versus active parameters",2],["Top-k routing",1],["Why MoE needs memory, not speed",3],["Teams of whole models",4]],
 metrics:[["tot","Total"],["act","Active per token"]],
 build(){let s=SC.box("tok",40,150,100,50,"token")+SC.box("rt",190,150,110,50,"router","warn");s+=SC.arrow("a0",140,175,190,175);
  for(let i=0;i<8;i++){const y=30+i*40,on=i===2||i===5;s+=SC.box("x"+i,400,y,130,30,"expert "+(i+1),on?"good":"");if(on)s+=SC.arrow("ar"+i,300,175,400,y+15)}
  s+=SC.text("note",320,350,"8 experts, top-2: a quarter of the expert weights do the work","sm");return s},
 always:["tok","x0","x1","x2","x3","x4","x5","x6","x7"],
 steps:[
  {t:"Route",title:"A router scores every expert",show:["rt","a0"],body:"<p>For each token, a small router layer gives each expert a score.</p>"},
  {t:"Top-k",title:"Only the top k run",show:["ar2","ar5","note"],hl:["x2","x5"],m:{tot:"8 experts",act:"2"},body:"<p>The two best experts process the token; their outputs are mixed by the router's weights. The rest stay idle.</p>"},
  {t:"Memory",title:"All experts must still be loaded",body:"<p>Any token may need any expert, so all of them must sit in memory. MoE saves compute per token, not memory: a 125B MoE needs 64 GB+ of RAM even if it runs like a much smaller model.</p>",key:"Speed follows active parameters; memory follows total parameters."},
  {t:"Teams",title:"The same idea with whole models",body:"<p>A team of expert models with a router in front is MoE at the system level. Lattice measured it: the specialists tried did not beat the 27B on its weak spots.</p>",lat:"Fractal 3.69 (specialists), 3.70 and 3.78 (the MoE trials, removed from Studio's menu), 3.80–3.81 (Odysseus 5 of 20)."},
 ],
 records:["<b>Fractal 3.69, 3.70, 3.78, 3.80, 3.81</b>","<b>AI academia 12</b>"],
 lab(root){root.innerHTML=`<span class="eyebrow">Lab</span><h2>Build a mixture</h2><div class="cols"><div class="ctl">${slider("me","Experts",2,256,1,64)}${slider("mk","Active per token (k)",1,16,1,4)}${slider("ms","Size of each expert (billions)",0.1,8,0.1,1.8)}${slider("mh","Shared layers (billions)",0,20,0.5,5)}${slider("mb","Bits per weight",2,16,0.25,4.25)}</div><div class="out"><div class="verdict" id="mv"></div></div></div>`;
  wire(root,["me","mk","ms","mh","mb"],[],()=>{const e=val(root,"me"),k=Math.min(val(root,"mk"),e),s=val(root,"ms"),h=val(root,"mh"),b=val(root,"mb"),tot=e*s+h,act=k*s+h,gb=tot*b/8;
   const v=root.querySelector("#mv");v.className="verdict "+(gb<=16?"good":"warn");v.innerHTML=`Total <b>${tot.toFixed(0)}B</b>, active <b>${act.toFixed(1)}B</b> per token. Memory ≈ <b>${gb.toFixed(0)} GB</b>${gb>16?": does not fit the 16 GB card; the rest would be read from RAM":""}. Speed behaves like a ${act.toFixed(0)}B model when it fits.`});
 }});
