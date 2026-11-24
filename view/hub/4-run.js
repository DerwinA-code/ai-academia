/* ---------- module: running a model on one card ---------- */
mod("run","Running a model on one card","Why speed is bytes per token, and what fits in 16 GB");

lesson({id:"vram",mod:"run",title:"Quantisation and the VRAM budget",min:6,
 sub:"Writing one token reads every weight once. So speed is bandwidth divided by model size, and anything that spills off the card is slow.",
 learn:[["Why speed is bytes per token",2],["What 4-bit weights buy",3],["The VRAM inequality",4],["Why a spill costs 3–4×",5]],
 metrics:[["w","Weights"],["tok","Top speed"],["fit","Fits 16 GB?"]],
 build(){let s=SC.raw("card",`<rect x="40" y="60" width="300" height="230" rx="12" fill="none" stroke="var(--line2)"/><text class="lbl sm" x="190" y="50" text-anchor="middle">graphics card: 16 GB, 896 GB/s</text>`);
  s+=SC.raw("w16",`<rect x="52" y="72" width="276" height="206" rx="8" fill="color-mix(in srgb,var(--bad) 25%,transparent)" stroke="var(--bad)"/><text class="lbl" x="190" y="170" text-anchor="middle">27B at 16 bits = 54 GB</text><text class="lbl sm" x="190" y="190" text-anchor="middle">does not fit</text>`);
  s+=SC.raw("w4",`<rect x="52" y="72" width="276" height="150" rx="8" fill="color-mix(in srgb,var(--accent) 22%,transparent)" stroke="var(--accent)"/><text class="lbl" x="190" y="145" text-anchor="middle">27B at ~4.25 bits ≈ 13.3–15 GB</text>`);
  s+=SC.raw("kv",`<rect x="52" y="226" width="276" height="22" rx="6" fill="color-mix(in srgb,var(--good) 25%,transparent)" stroke="var(--good)"/><text class="lbl sm" x="190" y="241" text-anchor="middle">KV cache for 36K tokens</text>`);
  s+=SC.raw("buf",`<rect x="52" y="252" width="200" height="22" rx="6" fill="color-mix(in srgb,var(--warn) 25%,transparent)" stroke="var(--warn)"/><text class="lbl sm" x="152" y="267" text-anchor="middle">compute buffer + other apps</text>`);
  s+=SC.box("ram",420,90,180,70,"system RAM","bad","~60–90 GB/s");s+=SC.curve("spill","M330 260 C 380 260 400 160 440 160","bad");
  s+=SC.raw("read",`<path d="M360 120 h40" class="ln flow"/><text class="lbl sm" x="380" y="110" text-anchor="middle">every token</text>`);
  s+=SC.text("form",490,230,"top speed ≈ bandwidth ÷ weight size","");s+=SC.text("form2",490,255,"896 ÷ 13.3 ≈ 67 tok/s (measured 50.8)","sm");return s},
 always:["card"],
 steps:[
  {t:"One pass",title:"Each token is a full pass",body:"<p>To write a token, the model multiplies the context through every layer. Each multiplication needs the layer's weights, so <b>every weight is read once per token</b>.</p>"},
  {t:"Too big",title:"At 16 bits, 27 billion weights don't fit",show:["w16"],m:{w:"54 GB",fit:"no"},body:"<p>27 billion parameters × 2 bytes = 54 GB. The card has 16.</p>"},
  {t:"Speed",title:"Speed is bandwidth ÷ bytes",show:["read","form","form2"],body:"<p>If each token reads all the weights, the fastest possible speed is memory bandwidth divided by the weights' size. Weights that are smaller are <b>read faster</b>, not just stored smaller.</p>",key:"Most speed work is about this one division."},
  {t:"4-bit",title:"Quantise: fewer bits per weight",hide:["w16"],show:["w4"],m:{w:"≈13.3 GB",tok:"≈67 max",fit:"yes"},body:"<p>GGUF quantisation stores weights in blocks of small integers with a shared scale (IQ4_XS: about 4.25 bits per weight). The 27B shrinks to about 13.3–15 GB and fits. Quality loss at 4 bits is small for a model this size; at 2–3 bits it grows fast.</p>",lat:"Fractal's file is Qwen3.8-27B-UD-IQ4_XS.gguf: 50.8 tok/s measured, about 76% of the 67 tok/s limit (Fractal academia Part 1.3)."},
  {t:"The budget",title:"Everything shares 16 GB",show:["kv","buf"],body:"<p><code>weights + KV cache + compute buffer + other apps + margin ≤ VRAM</code>. Context, batch size and a game in the background all eat into the same 16 GB.</p>"},
  {t:"Spill",title:"Over budget: layers move to RAM",show:["ram","spill"],m:{tok:"13–17",fit:"spills"},body:"<p>llama.cpp still runs, but the spilled part is read at RAM speed, about a tenth of the card's. Writing falls 3–4× (50 → 13–17 tok/s, seen many times).</p>",lat:"Fractal 3.52: a game ran at 5 fps because Fractal's model stayed on the card; the game guard now unloads it."},
 ],
 records:["<b>Fractal Part 1.2–1.3</b>: the budget and the speed table","<b>Fractal 3.12</b>: 4-bit KV cache","<b>Fractal 3.52</b>: the game at 5 fps","<b>AI academia 01</b>: local inference on consumer GPUs"],
 lab(root){root.innerHTML=`<span class="eyebrow">Lab</span><h2>Fit a model on the card</h2><p class="sm">Pick a model and a card. Push the context or the bits until it spills, and watch the speed fall off a cliff.</p>
  <div class="cols"><div class="ctl">${slider("vp","Parameters (billions)",1,125,1,27)}${slider("vb","Bits per weight",2,16,0.25,4.25)}${slider("vc","Context (thousand tokens)",2,128,1,36)}
  ${slider("vkv","KV bytes per token (KB) for this model",4,256,1,64)}${slider("vg","Card memory (GB)",8,48,1,16)}${slider("vbw","Card bandwidth (GB/s)",200,2000,10,896)}${slider("vo","Other apps on the card (GB)",0,8,0.5,0.5)}</div>
  <div class="out"><svg class="labsvg" viewBox="0 0 520 120" id="vsv"></svg><div class="verdict" id="vv"></div><p class="sm">KV per token depends on the model: 2 × attention layers × KV heads × head size × bytes. Hybrid models like Qwen3.8 keep full attention in only about 1 layer in 4, so theirs is small.</p></div></div>`;
  wire(root,["vp","vb","vc","vkv","vg","vbw","vo"],[0,v=>v,0,0,0,0,0],()=>{const P=val(root,"vp"),b=val(root,"vb"),ctx=val(root,"vc")*1000,kv=val(root,"vkv"),G=val(root,"vg"),bw=val(root,"vbw"),o=val(root,"vo");
   const W=P*b/8,K=kv*1024*ctx/1e9,B=0.8+ctx/1e5,tot=W+K+B+o,sc=480/Math.max(tot,G);
   let x=20,s="";[[W,"accent","weights"],[K,"good","KV"],[B,"warn","buffer"],[o,"odys","other"]].forEach(([v,c,l])=>{s+=`<rect x="${x}" y="30" width="${v*sc}" height="34" fill="color-mix(in srgb,var(--${c}) 30%,transparent)" stroke="var(--${c})"/>`+(v*sc>34?`<text class="lbl sm" x="${x+v*sc/2}" y="51" text-anchor="middle">${l}</text>`:"");x+=v*sc});
   s+=`<line x1="${20+G*sc}" y1="18" x2="${20+G*sc}" y2="78" stroke="var(--bad)" stroke-width="2"/><text class="lbl sm" x="${20+G*sc}" y="96" text-anchor="middle">card: ${G} GB</text>`;
   root.querySelector("#vsv").innerHTML=s;
   const over=tot-G,top=bw/W*0.76;let sp;if(over<=0)sp=top;else{const onCard=Math.max(0,W-over);sp=1/((onCard/(bw*0.76))+(Math.min(W,over)/70))}
   const v=root.querySelector("#vv");v.className="verdict "+(over<=0?"good":"bad");
   v.innerHTML=`Weights ${W.toFixed(1)} GB, KV ${K.toFixed(1)} GB, total ${tot.toFixed(1)} of ${G} GB. `+(over<=0?`Fits. Expect about <b>${sp.toFixed(0)} tok/s</b> (76% of the bandwidth limit, as measured on Fractal's card).`:`<b>Spills ${over.toFixed(1)} GB</b> to system RAM: about <b>${sp.toFixed(1)} tok/s</b>.`)});
 },
 quiz:[{q:"Why do 4-bit weights make writing faster, not just smaller?",o:["Each token reads every weight, so fewer bytes means less to read","The GPU does integer maths faster","They skip layers"],a:0,why:"Writing is limited by memory bandwidth: speed ≈ bandwidth ÷ bytes read per token."},
  {q:"Fractal's model starts writing at 15 tok/s instead of 50. The likeliest cause?",o:["Part of it spilled to system RAM","The prompt was too short","The temperature was too low"],a:0,why:"A spill moves layers to RAM, read about ten times slower: 3–4× slower writing overall."}]});

lesson({id:"kv",mod:"run",title:"The KV cache",min:4,
 sub:"The model remembers each past token as a key and a value in every attention layer. That memory is what context costs.",
 learn:[["What a key and a value are",1],["Why the cache saves recomputing",2],["The bytes formula",3],["Quantising the cache",4]],
 metrics:[["ctx","Context"],["kvb","Cache"]],
 build(){let s="";for(let i=0;i<8;i++){s+=SC.box("tk"+i,40+i*70,60,58,36,"tok "+(i+1))}
  s+=SC.raw("kvrow",Array.from({length:8},(_,i)=>`<rect x="${40+i*70}" y="120" width="26" height="40" rx="4" fill="color-mix(in srgb,var(--accent) 25%,transparent)" stroke="var(--accent)"/><rect x="${72+i*70}" y="120" width="26" height="40" rx="4" fill="color-mix(in srgb,var(--good) 25%,transparent)" stroke="var(--good)"/>`).join("")+`<text class="lbl sm" x="40" y="178">K and V per token, per attention layer</text>`);
  s+=SC.box("new",320,210,120,44,"next token","warn");s+=SC.curve("look","M380 210 C 380 180 200 175 150 162","flow");
  s+=SC.text("f",320,300,"bytes = 2 × attention layers × KV heads × head size × bytes per number × tokens","sm");return s},
 always:["tk0","tk1","tk2","tk3","tk4","tk5","tk6","tk7"],
 steps:[
  {t:"Attention",title:"Each new token looks back at all the others",show:["new","look"],m:{ctx:"8"},body:"<p>Attention compares the new token's <i>query</i> with every earlier token's <i>key</i>, then mixes their <i>values</i> by how well they matched.</p>"},
  {t:"Cache",title:"Keep the keys and values, don't recompute them",show:["kvrow"],body:"<p>Past tokens' keys and values never change, so they are stored. Without the cache, each new token would re-run the whole context through the model.</p>",key:"The cache trades memory for not recomputing the past."},
  {t:"Cost",title:"It grows with every token",show:["f"],m:{kvb:"grows"},body:"<p>The cache is <code>2 × layers × KV heads × head size × bytes × tokens</code>. Grouped-query attention (few KV heads shared by many query heads) and hybrid layers (Qwen3.8: full attention in about 1 layer in 4) keep it small.</p>"},
  {t:"4-bit cache",title:"Store the cache at lower precision",body:"<p>The cache can be quantised too: q8_0 ≈ 8.5 bits, q4_0 ≈ 4.5 bits per number. Halving the cache buys context or room for the MTP drafter.</p>",lat:"Fractal 3.12: the 4-bit KV cache, measured on the haystack recall test (12 of 12 facts at 20K tokens) before adoption."},
 ],
 records:["<b>Fractal Part 1.1</b>, <b>3.12</b>","<b>AI academia 01</b>"],
 quiz:[{q:"What does the KV cache store?",o:["Keys and values of past tokens in each attention layer","The model's weights","The user's chat history as text"],a:0,why:"Past keys and values don't change, so they're kept instead of recomputed."}]});

lesson({id:"spec",mod:"run",title:"Speculative decoding",min:6,
 sub:"A cheap drafter guesses the next tokens; the big model checks them all in one pass. Same output, more tokens per weight read.",
 learn:[["Why checking k tokens costs about one pass",1],["Correct by construction",3],["Expected tokens per pass",4],["Why it can still be slower",5]],
 metrics:[["a","Acceptance α"],["k","Draft k"],["e","Tokens / pass"]],
 build(){let s=SC.box("big",250,40,140,60,"27B (target)","", "one pass")+SC.box("dr",60,150,130,50,"drafter","odys","MTP head / n-gram");
  ["the","cat","sat"].forEach((w,i)=>{s+=SC.box("g"+i,230+i*70,160,60,34,w,"")});
  s+=SC.arrow("d1",190,175,226,177);s+=SC.curve("chk","M320 100 C 320 130 320 140 320 156","flow");
  s+=SC.raw("ok",`<text class="lbl" x="260" y="225" text-anchor="middle" fill="var(--good)">kept</text><text class="lbl" x="330" y="225" text-anchor="middle" fill="var(--good)">kept</text>`);
  s+=SC.raw("no",`<text class="lbl" x="400" y="225" text-anchor="middle" fill="var(--bad)">replaced: "on"</text>`);
  s+=SC.text("f",320,290,"E[tokens per pass] = (1 − α^(k+1)) / (1 − α)","");s+=SC.text("f2",320,315,"α = 0.97, k = 1 → 1.97     k = 2 → 2.91","sm");return s},
 steps:[
  {t:"Memory-bound",title:"A pass costs about the same for 1 token or a few",show:["big"],body:"<p>Writing is limited by reading the weights (see the VRAM lesson). Once they're read, checking 3 tokens instead of 1 costs little extra arithmetic.</p>"},
  {t:"Draft",title:"A cheap drafter guesses ahead",show:["dr","g0","g1","g2","d1"],m:{k:3},body:"<p>A drafter proposes the next k tokens. Fractal's drafter is MTP: a small extra layer trained <i>with</i> the model (Qwen3.8 ships one), plus an n-gram matcher that copies repeated text.</p>"},
  {t:"Check",title:"The big model checks all of them in one pass",show:["chk"],body:"<p>The target model runs once over the context plus the guesses and computes what it would have written at each position.</p>"},
  {t:"Keep",title:"Keep matches, replace the first miss",show:["ok","no"],body:"<p>Guesses are kept up to the first disagreement; that position takes the target's own token. The output is exactly what the big model would have written alone.</p>",key:"Only speed changes, never the text (at temperature 0; with sampling, a rejection rule keeps the distribution exact)."},
  {t:"Expected gain",title:"How many tokens per pass?",show:["f","f2"],m:{a:"0.97",k:"1",e:"1.97"},body:"<p>If each guess is accepted with probability α, a pass yields on average (1 − α^(k+1))/(1 − α) tokens: a geometric series that stops at the first miss.</p>"},
  {t:"The catch",title:"Why 2-ahead ran slower than 1-ahead",body:"<p>Each pass costs more: the drafter runs k times and the check is wider. On a full card that extra memory pressure ate the gain: 2-ahead was accepted 83–96% yet slower at 32–36K context than 1-ahead.</p>",lat:"Fractal 3.11 adopted MTP 1-ahead plus n-gram (acceptance: reasoning 0.97, prose 0.87, code 0.85). The 11-file task went from 210 s to 32 s."},
 ],
 records:["<b>Fractal Part 1.5</b>, <b>3.11</b>","<b>AI academia 01</b>: speculative decoding"],
 lab(root){root.innerHTML=`<span class="eyebrow">Lab</span><h2>Tune the drafter</h2><p class="sm">Raise k for more tokens per pass, but every guess costs something. Find where more guessing stops paying.</p>
  <div class="cols"><div class="ctl">${slider("sa","Acceptance α",0.3,0.99,0.01,0.97)}${slider("sk","Draft length k",1,8,1,1)}${slider("sc","Cost of each drafted token (share of a pass)",0,0.5,0.01,0.05)}${slider("sw","Extra cost of a wider check, per token",0,0.3,0.01,0.03)}</div>
  <div class="out"><svg class="labsvg" viewBox="0 0 520 150" id="ssv"></svg><div class="verdict" id="sv"></div></div></div>`;
  wire(root,["sa","sk","sc","sw"],[],()=>{const a=val(root,"sa"),k=val(root,"sk"),c=val(root,"sc"),w=val(root,"sw");
   const sp=K=>((1-Math.pow(a,K+1))/(1-a))/(1+K*c+K*w);let s="",best=1,bv=0;for(let K=1;K<=8;K++){const v=sp(K);if(v>bv){bv=v;best=K}const h=v/3*120;s+=`<rect x="${20+(K-1)*60}" y="${135-h}" width="48" height="${h}" rx="4" fill="${K===k?"var(--accent)":"color-mix(in srgb,var(--accent) 30%,transparent)"}"/><text class="lbl sm" x="${44+(K-1)*60}" y="${130-h}" text-anchor="middle">${v.toFixed(2)}×</text><text class="lbl sm" x="${44+(K-1)*60}" y="148" text-anchor="middle">k=${K}</text>`}
   root.querySelector("#ssv").innerHTML=s;const e=(1-Math.pow(a,k+1))/(1-a),v=root.querySelector("#sv");v.className="verdict "+(k===best?"good":"warn");
   v.innerHTML=`k = ${k}: ${e.toFixed(2)} tokens per pass, about <b>${sp(k).toFixed(2)}×</b> plain speed. Best here: k = ${best} (${bv.toFixed(2)}×).`});
 },
 quiz:[{q:"Does speculative decoding change what the big model writes?",o:["No, only how fast (it keeps the target's own token at the first miss)","Yes, it writes the drafter's text","Only on code"],a:0,why:"Guesses are kept only where they match; the output is the target's."},
  {q:"α = 0.97, k = 1. Tokens per pass?",o:["About 1.97","Exactly 2","0.97"],a:0,why:"(1 − 0.97²)/(1 − 0.97) = 0.0591/0.03 ≈ 1.97."}]});

lesson({id:"voice",mod:"run",title:"Speech synthesis and the latency budget",min:4,
 sub:"A voice feels like conversation only if the first sound comes in under about 3 seconds. Every stage spends part of that budget.",
 learn:[["The stages between speaking and hearing",1],["Why first sound matters more than total time",2],["Streaming in sentences",3]],
 metrics:[["t","First sound"]],
 build(){const st=[["mic","hear (whisper)",0.6],["llm","think: first sentence",1.2],["tts","speak: first chunk",0.7]];let s="",x=40;
  st.forEach(([id,l,t],i)=>{const w=t*150;s+=SC.box(id,x,120,w,60,l,i==2?"good":"")+SC.text(id+"t",x+w/2,205,t+" s","sm");x+=w+10});
  s+=SC.raw("budget",`<line x1="40" y1="100" x2="490" y2="100" stroke="var(--warn)" stroke-dasharray="6 4"/><text class="lbl sm" x="490" y="92" text-anchor="end">about 3 s: the conversational limit</text>`);
  s+=SC.text("str",320,280,"stream: speak sentence 1 while sentence 2 is still being written","");return s},
 steps:[
  {t:"Stages",title:"Three stages, each with a cost",show:["mic","mict","llm","llmt","tts","ttst"],m:{t:"2.5 s"},body:"<p>Speech to text, the model's reply, then text to speech. Each adds time before the first sound.</p>"},
  {t:"Budget",title:"The first sound is what you notice",show:["budget"],body:"<p>People tolerate a long answer; they don't tolerate silence. The rule in Lattice: first sound under about 3 seconds, measured before any voice path ships.</p>",key:"Measure time to first audio, not total generation time."},
  {t:"Stream",title:"Don't wait for the whole reply",show:["str"],body:"<p>Speak the first sentence as soon as it exists and keep writing behind it. The voice model has to start quickly on short text for this to work.</p>",lat:"Fractal 3.76–3.77: Pocket TTS picked blind by the user and wired in on port 8012; Chatterbox stays the fall-back. Ruby 1.8: first word of a routed answer 5.3 s → 0.82 s."},
 ],
 records:["<b>Fractal 3.64, 3.66, 3.76, 3.77</b>","<b>AI academia 07</b>: voice"],
 lab(root){root.innerHTML=`<span class="eyebrow">Lab</span><h2>Spend the 3-second budget</h2><div class="cols"><div class="ctl">${slider("l1","Hearing the question (s)",0.1,3,0.1,0.6)}${slider("l2","Prompt tokens before the reply",100,8000,100,1500)}${slider("l3","Prompt reading speed (tok/s)",200,4000,100,1500)}${slider("l4","Words in the first sentence",3,40,1,12)}${slider("l5","Writing speed (tok/s)",5,100,1,50)}${slider("l6","Voice start-up for a short chunk (s)",0.1,4,0.1,0.7)}</div>
  <div class="out"><div class="verdict" id="lv2"></div></div></div>`;
  wire(root,["l1","l2","l3","l4","l5","l6"],[],()=>{const t=val(root,"l1")+val(root,"l2")/val(root,"l3")+val(root,"l4")*1.33/val(root,"l5")+val(root,"l6");const v=root.querySelector("#lv2");
   v.className="verdict "+(t<=3?"good":t<=4.5?"warn":"bad");v.innerHTML=`First sound after <b>${t.toFixed(1)} s</b>. `+(t<=3?"Conversational.":"Too slow to feel like talking: shorten the prompt, the first sentence or the voice's start-up.")});
 }});
