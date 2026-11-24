/* ---------- module: measuring ---------- */
mod("measure","Measuring: is it real?","How we tell a real gain from luck on small exams");

/* exact maths used by the labs */
function lchoose(n,k){let s=0;for(let i=1;i<=k;i++)s+=Math.log(n-k+i)-Math.log(i);return s}
function signP(f,b){const n=f+b;if(!n)return 1;const k=Math.min(f,b);let s=0;for(let i=0;i<=k;i++)s+=Math.exp(lchoose(n,i)-n*Math.LN2);return Math.min(1,2*s)}
function wilson(x,n,z=1.96){if(!n)return[0,1];const p=x/n,z2=z*z,d=1+z2/n,c=(p+z2/(2*n))/d,h=z/d*Math.sqrt(p*(1-p)/n+z2/(4*n*n));return[Math.max(0,c-h),Math.min(1,c+h)]}
const pc=v=>Math.round(v*100)+"%";

lesson({id:"paired",mod:"measure",title:"Paired comparison and the sign test",min:6,
 sub:"Count what a change fixed and what it broke on the same questions, then ask how often luck alone would do that.",
 learn:[["Why two averages can hide what changed",2],["Fixed and broke: the only tasks that carry information",3],["The sign test: a fair coin over the tasks that moved",4],["Reading a p-value without fooling yourself",5]],
 metrics:[["f","Fixed"],["b","Broke"],["p","p (two-sided)"]],
 build(){let s="";const tasks=["a1","a2","b1","b2","c1","c2","d1","d2","e1","e2"],old=[0,1,1,1,0,1,1,0,1,1],nw=[1,1,1,0,1,1,1,1,1,1];
  tasks.forEach((t,i)=>{const x=40+i*58;s+=SC.text("t"+i,x+22,62,t,"sm");
   s+=SC.box("o"+i,x,74,44,40,old[i]?"pass":"fail",old[i]?"good":"bad");
   s+=SC.box("n"+i,x,150,44,40,nw[i]?"pass":"fail",nw[i]?"good":"bad")});
  s+=SC.text("ol",20,99,"old","sm","end")+SC.text("nl",20,175,"new","sm","end");
  s+=SC.text("avg",320,232,"old 7 of 10   ·   new 9 of 10","big");
  s+=SC.raw("mark",[0,3,4,7].map(i=>`<rect x="${36+i*58}" y="68" width="52" height="128" rx="10" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 4"/>`).join(""));
  s+=SC.text("coin",320,290,"if the change did nothing, each moved task is a coin flip: fixed or broke, 50:50","sm");
  s+=SC.text("pv",320,325,"P(3 or more of 4 the same way, either way) = 2 × 5/16 = 0.625","");
  return s},
 always:[],
 steps:[
  {t:"Two runs",title:"Same ten tasks, run before and after",show:["t0","t1","t2","t3","t4","t5","t6","t7","t8","t9","o0","o1","o2","o3","o4","o5","o6","o7","o8","o9","ol"],
   body:"<p>An exam is a list of tasks. We run the old setup over all of them and keep every answer. Then we change one thing and run the <b>same</b> tasks again.</p>"},
  {t:"Averages",title:"The averages say +2",show:["n0","n1","n2","n3","n4","n5","n6","n7","n8","n9","nl","avg"],m:{f:"?",b:"?",p:"?"},
   body:"<p>Old 7 of 10, new 9 of 10. It looks like a 20-point gain. But the average throws away <i>which</i> tasks changed, and that is where the information is.</p>"},
  {t:"Pair them",title:"Only the tasks that moved matter",show:["mark"],hl:["n0","n4","n7","n3"],m:{f:3,b:1},
   body:"<p>Line the two runs up task by task. Six tasks did the same both times: they say nothing about the change. Four moved: <b>three fixed</b> (fail to pass) and <b>one broke</b> (pass to fail).</p>",
   key:"A paired comparison reports <b>fixed N, broke M</b>. Same-both-times tasks are noise-free but uninformative."},
  {t:"The coin",title:"If the change did nothing, moved tasks are coin flips",show:["coin"],
   body:"<p>Suppose the change has no effect and the tasks just flip from run to run (they do: Fractal's 27B flips three tasks between identical runs). Then each moved task is equally likely to be a fix or a break. That is a fair coin, tossed once per moved task.</p>"},
  {t:"The p-value",title:"How often would luck look this good?",show:["pv"],m:{p:"0.625"},
   body:"<p>With 4 moved tasks, a split of 3:1 or more lopsided happens (either way) in 10 of 16 coin patterns: <b>p = 0.625</b>. So \"+2\" here is completely ordinary luck.</p><p>The test needs no assumption about how hard the tasks are. It is the <b>exact two-sided sign test</b>: a binomial with p = ½ over the moved tasks.</p>",
   key:"p is the chance of a result at least this lopsided <b>if nothing changed</b>. It is not the chance the change works.",
   lat:"Rust exam, 23 Nov: playbook alone 148 of 156, playbook plus the edge-case line 143: fixed 2, broke 7, p = 0.18. Not proof of harm, and not a gain: not adopted (Fractal academia 3.84)."},
 ],
 records:["<b>Fractal 3.81, 3.84</b>: every prompt line judged by fixed/broke and the sign test (<code>runtime\\experiments\\2026-11-23\\compare.js</code>)","<b>Fractal 3.44</b>: <code>exam pair new.jsonl base.jsonl</code> in the Rust exam kit","<b>AI academia 02</b>: paired tests over averages"],
 lab(root){root.innerHTML=`<span class="eyebrow">Lab</span><h2>Make luck look like a breakthrough</h2>
  <p class="sm">Set how many tasks a change fixed and broke. Then press <b>Simulate a useless change</b>: it reruns a model that flips tasks at random, and you watch how often nothing looks like something.</p>
  <div class="cols"><div class="ctl">${slider("lf","Fixed",0,20,1,3)}${slider("lb","Broke",0,20,1,1)}${slider("lflip","Tasks that flip by chance between runs",0,10,1,3)}
   <button class="btn go" id="sim">Simulate a useless change ×1000</button></div>
   <div class="out"><svg class="labsvg" viewBox="0 0 520 170" id="lsv"></svg><div class="verdict" id="lv"></div><div class="sm" id="lsim"></div></div></div>`;
  const draw=()=>{const f=val(root,"lf"),b=val(root,"lb"),n=f+b,p=signP(f,b);let s="";
   for(let i=0;i<=n;i++){const pr=n?Math.exp(lchoose(n,i)-n*Math.LN2):0,h=pr*130,x=20+i*(480/Math.max(n,1)),w=Math.max(4,480/Math.max(n,1)-3),ext=Math.min(i,n-i)<=Math.min(f,b);
    s+=`<rect x="${x}" y="${150-h}" width="${w}" height="${h}" fill="${ext?"var(--warn)":"var(--line2)"}" rx="2"/>`}
   s+=`<text x="20" y="166" class="lbl sm">0 fixed</text><text x="500" y="166" class="lbl sm" text-anchor="end">${n} fixed</text>`;
   root.querySelector("#lsv").innerHTML=s;
   const v=root.querySelector("#lv");v.className="verdict "+(p<0.05?"good":p<0.2?"warn":"bad");
   v.innerHTML=`<b>p = ${p.toFixed(3)}</b>. ${n===0?"Nothing moved: no evidence either way.":p<0.05?"Luck alone rarely does this (under 1 in 20). Worth believing, if you set this bar before the run.":p<0.2?"Suggestive, not proof. Repeat the run.":"Ordinary luck does this often. Not evidence."} Orange bars are the outcomes at least as lopsided as yours.`};
  wire(root,["lf","lb","lflip"],[],draw);
  root.querySelector("#sim").onclick=()=>{const k=val(root,"lflip"),f=val(root,"lf"),b=val(root,"lb"),obs=f-b;let hit=0;
   for(let r=0;r<1000;r++){let d=0;for(let i=0;i<k;i++)d+=Math.random()<.5?1:-1;if(d>=obs&&obs>0)hit++}
   root.querySelector("#lsim").innerHTML=obs>0?`A change that does nothing, on a model with ${k} flipping tasks, scored at least <b>+${obs}</b> in <b>${hit/10}%</b> of 1000 tries.`:`Set more fixed than broke to see how often luck matches it.`};
 },
 quiz:[
  {q:"Old run 20 of 26, new run 22 of 26. What do you need before believing the change helped?",o:["Which tasks it fixed and which it broke","Nothing: +2 is a clear gain","A bigger font on the chart"],a:0,why:"Two averages hide which tasks moved; fixed and broke on the same tasks carry the evidence."},
  {q:"A change fixed 2 tasks and broke 0. The two-sided sign test gives p = 0.5. What does that mean?",o:["Luck alone produces a 2:0 split half the time","The change has a 50% chance of working","The change is harmful"],a:0,why:"Two coin flips land the same way (either way) half the time. p is about luck, not about the change."},
  {q:"Why are tasks that passed in both runs left out of the sign test?",o:["They cannot tell a helpful change from a useless one","They are always wrong","The test is too slow with them"],a:0,why:"A task that did the same both times is equally likely under 'works' and 'does nothing', so it carries no information."},
 ]});

lesson({id:"wilson",mod:"measure",title:"Confidence intervals for small exams",min:5,
 sub:"A score of 21 of 26 is really 'somewhere between 62% and 91%'. The Wilson interval tells you how wide.",
 learn:[["Why a score is an estimate, not a fact",1],["How the interval narrows with more tasks",3],["Why Wilson and not the textbook formula",4],["Overlapping intervals and what they don't say",5]],
 metrics:[["n","Tasks"],["s","Score"],["ci","95% interval"]],
 build(){let s=SC.raw("axis",`<line x1="60" y1="300" x2="580" y2="300" class="ln"/>`+[0,25,50,75,100].map(v=>`<text class="lbl sm" x="${60+v*5.2}" y="320" text-anchor="middle">${v}%</text>`).join(""));
  const bar=(id,y,lo,hi,pt,lab,cls)=>SC.raw(id,`<rect x="${60+lo*520}" y="${y-9}" width="${(hi-lo)*520}" height="18" rx="9" fill="color-mix(in srgb,var(--${cls}) 25%,transparent)" stroke="var(--${cls})"/><circle cx="${60+pt*520}" cy="${y}" r="5" fill="var(--${cls})"/><text class="lbl sm" x="52" y="${y+4}" text-anchor="end">${lab}</text>`);
  const [a,b]=wilson(21,26),[c,d]=wilson(22,26),[e,f]=wilson(210,260);
  s+=SC.raw("pt",`<circle cx="${60+21/26*520}" cy="90" r="6" fill="var(--accent)"/><text class="lbl" x="${60+21/26*520}" y="70" text-anchor="middle">21 of 26 = 81%</text>`);
  s+=bar("b1",90,a,b,21/26,"plain","accent");s+=bar("b2",140,c,d,22/26,"line","good");s+=bar("b3",200,e,f,210/260,"×10 tasks","warn");
  s+=SC.text("note",320,250,"the same rate on ten times the tasks: an interval a third as wide","sm");return s},
 always:["axis"],
 steps:[
  {t:"A score",title:"21 of 26 passed",show:["pt"],m:{n:26,s:"81%"},body:"<p>Fractal's 27B passes 21 of the 26 hard-exam tasks. It is tempting to write \"81%\" and move on.</p><p>But the exam is a small sample of every task the model could meet. Draw a different 26 and you'd get a different score.</p>"},
  {t:"The interval",title:"What the score is really saying",show:["b1"],m:{ci:"62–91%"},body:"<p>The 95% interval is the range of true pass rates that could plausibly have produced 21 of 26. Here it is <b>62% to 91%</b>: nearly 30 points wide.</p>",key:"With 26 tasks, a single run can't separate 75% from 85%."},
  {t:"A rival",title:"22 of 26 sits inside the same range",show:["b2"],m:{s:"85%",ci:"66–94%"},body:"<p>The edge-case line scored 22. Its interval (66–94%) almost covers the plain one. One run can't tell them apart.</p><p>(Paired tests do better than comparing intervals, because they use the same tasks; see the sign test lesson.)</p>"},
  {t:"More tasks",title:"Ten times the tasks, a third the width",show:["b3","note"],m:{n:260,ci:"75–85%"},body:"<p>Width shrinks like 1/√n. Ten times the tasks makes the interval about √10 ≈ 3.2 times narrower. That is why the Rust exam (156 problems) is a sharper instrument than the hard exam (26).</p>"},
  {t:"Why Wilson",title:"Why not the textbook formula?",body:"<p>The textbook interval p ± 1.96·√(p(1−p)/n) breaks near 0% and 100%: at 26 of 26 it gives a width of zero, as if a perfect score were certain. Wilson's interval inverts the test instead:</p><p><code>centre = (p + z²/2n) / (1 + z²/n)</code><br><code>half-width = z/(1 + z²/n) · √(p(1−p)/n + z²/4n²)</code></p><p>with z = 1.96 for 95%. It stays sensible at the edges and on small n.</p>",key:"Wilson (1927) is the standard choice for small pass/fail samples."},
  {t:"Reading them",title:"What overlap does and doesn't mean",body:"<p>Overlapping intervals don't prove two setups are equal, and slightly separate ones don't prove a gain. They tell you how much a single run can resolve. When a difference is smaller than the width, repeat the runs or use a paired test.</p>",lat:"Fractal 3.81 lists every run with its Wilson interval; one 23 of 26 (71–96%) looked like a gain over 20–21 and the repeats came back 21 and 21."},
 ],
 records:["<b>Fractal 3.81</b>: Wilson intervals for every hard-exam run (<code>compare.js</code>)","<b>AI academia 06 s13.4</b>: the papers on small evaluations"],
 lab(root){root.innerHTML=`<span class="eyebrow">Lab</span><h2>How many tasks do you need?</h2><p class="sm">Pick two true pass rates you want to tell apart, and an exam size. See whether one run can separate them.</p>
  <div class="cols"><div class="ctl">${slider("wn","Tasks in the exam",5,400,1,26)}${slider("wa","Setup A's true rate",0,100,1,80,v=>v+"%")}${slider("wb","Setup B's true rate",0,100,1,85,v=>v+"%")}</div>
  <div class="out"><svg class="labsvg" viewBox="0 0 520 120" id="wsv"></svg><div class="verdict" id="wv"></div></div></div>`;
  wire(root,["wn","wa","wb"],[0,v=>v+"%",v=>v+"%"],()=>{const n=val(root,"wn"),a=val(root,"wa")/100,b=val(root,"wb")/100;
   const A=wilson(Math.round(a*n),n),B=wilson(Math.round(b*n),n);
   const bar=(y,iv,pt,c,l)=>`<rect x="${20+iv[0]*480}" y="${y-8}" width="${(iv[1]-iv[0])*480}" height="16" rx="8" fill="color-mix(in srgb,var(--${c}) 25%,transparent)" stroke="var(--${c})"/><circle cx="${20+pt*480}" cy="${y}" r="4" fill="var(--${c})"/><text class="lbl sm" x="${22+iv[1]*480}" y="${y+4}">${l} ${pc(iv[0])}–${pc(iv[1])}</text>`;
   root.querySelector("#wsv").innerHTML=bar(35,A,a,"accent","A")+bar(80,B,b,"good","B");
   const over=A[1]>=B[0]&&B[1]>=A[0];let need=n;for(let m=5;m<=20000;m=Math.ceil(m*1.05)){const x=wilson(Math.round(a*m),m),y=wilson(Math.round(b*m),m);if(x[1]<y[0]||y[1]<x[0]){need=m;break}need=m}
   const v=root.querySelector("#wv");v.className="verdict "+(over?"warn":"good");
   v.innerHTML=over?`The intervals overlap: one run of ${n} tasks can't tell ${pc(a)} from ${pc(b)}. You'd need about <b>${need}</b> tasks for them to separate.`:`They separate: ${n} tasks are enough to tell these apart in one run.`});
 },
 quiz:[
  {q:"Width of a pass-rate interval shrinks roughly like…",o:["1/√n","1/n","it doesn't depend on n"],a:0,why:"Standard error is √(p(1−p)/n), so four times the tasks halves the width."},
  {q:"A run scores 26 of 26. The textbook interval says the rate is exactly 100%. What's wrong?",o:["It collapses to zero width at the edges; Wilson's doesn't","Nothing, a perfect score is certain","It should be 0%"],a:0,why:"p(1−p) is zero at p = 1, so the naive formula claims certainty. Wilson adds z²/4n² and stays honest."},
 ]});

lesson({id:"repeats",mod:"measure",title:"Repeats and the noise floor",min:4,
 sub:"Before testing a change, run the unchanged setup several times. The spread you see is the floor any real gain has to clear.",
 learn:[["Why the same model scores differently twice",1],["Measuring the floor before the change",2],["Setting the bar before the run",4]],
 metrics:[["runs","Runs"],["spread","Spread"]],
 build(){let s="";const runs=[21,20,21],x0=90;runs.forEach((r,i)=>{s+=SC.box("r"+i,x0+i*120,120,100,70,r+" of 26","", "plain run "+(i+1))});
  s+=SC.raw("band",`<rect x="70" y="105" width="380" height="100" rx="14" fill="none" stroke="var(--warn)" stroke-dasharray="5 5"/><text class="lbl sm" x="260" y="225" text-anchor="middle">the noise floor: 20 to 21</text>`);
  s+=SC.box("c1",480,120,110,70,"23 of 26","good","one run of a change");s+=SC.box("c2",480,210,110,50,"21, 21","bad","its repeats");
  s+=SC.text("why",320,300,"thinking turned off, greedy answers, yet tool timing and parallel reads still differ","sm");return s},
 steps:[
  {t:"Flips",title:"The same settings, different scores",show:["r0","r1","r2"],m:{runs:3,spread:"20–21"},body:"<p>Even with greedy answers, the 27B scored 21, 20 and 21 on identical runs. Tool results arrive in different orders, timings differ, and a few tasks sit on a knife edge.</p>"},
  {t:"The floor",title:"Three tasks flip on their own",show:["band","why"],body:"<p>Three tasks changed between identical runs. Any change has to beat <b>that</b>, not the single number you happened to record first.</p>",key:"Measure the setup's own spread before measuring a change."},
  {t:"A mirage",title:"23 looked like a gain",show:["c1"],hl:["c1"],body:"<p>The all-four prompt line scored 23 of 26 on its first run: two above the best plain run.</p>"},
  {t:"Repeats",title:"…and came back 21 and 21",show:["c2"],hl:["c2"],body:"<p>Its repeats gave 21 and 21. The first run was the high end of its own spread.</p>",lat:"Fractal 3.81 and 3.84: the rule set beforehand was 'at least two more than the best of three plain runs, nothing broken'. Nothing tried cleared it."},
  {t:"The bar",title:"Write the bar down first",body:"<p>Decide before running: how many repeats, what counts as better, which tasks must not break. Afterwards, every number tempts you to move the bar.</p>"},
 ],
 records:["<b>Fractal 3.80</b>: the plan, with the bar set before any run","<b>Fractal 3.81, 3.84</b>: spread 20–21, the 23 that didn't repeat"],
 quiz:[{q:"A change scores 23 once against a plain best of 21. What next?",o:["Repeat it before believing it","Adopt it","Lower the bar"],a:0,why:"One run is inside the spread of a model that flips three tasks on its own."},
  {q:"Why set the bar before the runs?",o:["So the result can't be explained away afterwards","Because it's faster","The exam needs it to run"],a:0,why:"A bar chosen after seeing the numbers tends to land just under them."}]});

lesson({id:"hidden",mod:"measure",title:"Hidden tests and held-out exams",min:4,
 sub:"Show the model some tests, grade it on others. Otherwise it learns to pass the tests instead of solving the task.",
 learn:[["Shown tests versus hidden tests",1],["Why held-out data guards against tuning to the exam",3],["Never editing the exam",4]],
 build(){let s=SC.box("task",40,60,150,60,"task + doc comment")+SC.box("shown",40,160,150,50,"shown tests","good")+SC.box("model",250,110,130,70,"model's code");
  s+=SC.box("hid",460,60,140,50,"hidden tests","warn","never shown")+SC.box("grade",460,170,140,60,"pass / fail");
  s+=SC.arrow("a1",190,90,250,135)+SC.arrow("a2",190,185,250,155)+SC.arrow("a3",380,145,460,195)+SC.arrow("a4",530,110,530,170);
  s+=SC.text("t",320,300,"a1_rs_money: the hidden test sends a negative amount the doc comment forbids","sm");return s},
 steps:[
  {t:"Shown",title:"The model sees a task and some tests",show:["task","shown","model","a1","a2"],body:"<p>Each hard-exam task gives the model the job, the doc comments and a few tests it can run while it works.</p>"},
  {t:"Hidden",title:"Grading uses tests it never saw",show:["hid","grade","a3","a4"],body:"<p>The verdict comes from <b>hidden</b> tests: edge cases the doc names but the shown tests skip. Passing only the shown tests isn't enough.</p>",key:"A model that writes to the tests it can see will pass them and fail the hidden ones."},
  {t:"A real miss",title:"The doc said it; the shown tests didn't",show:["t"],body:"<p><code>a1_rs_money</code> failed in every run: the doc comment forbids a signed amount, the shown tests never try one, and the 27B never checks it.</p>"},
  {t:"Held out",title:"Held-out data for anything you tune",body:"<p>The same idea at a bigger scale: when you tune prompts or train on failures, keep a set of tasks you never tune on and judge only on those. Otherwise you've measured how well you memorised the exam.</p>"},
  {t:"Hands off",title:"The exam is never edited",body:"<p>Standing rule: the evals and <code>data\\rules.json</code> are never edited to make a result look better. The marker itself is tested (<code>exam general selftest</code>: 92 of 92 known answers marked right).</p>",lat:"Fractal 3.67: the hard exam with hidden tests. Ruby's recall exam has a contamination check (Ruby academia)."},
 ],
 records:["<b>Fractal 3.67</b>: the hard exam (<code>exam-kit\\data\\general-hard</code>)","<b>Fractal 3.44</b>: HumanEval-rs with hidden tests"],
 quiz:[{q:"Why grade on tests the model never saw?",o:["So passing means solving the task, not matching visible tests","To make the exam faster","Because shown tests are wrong"],a:0,why:"Visible tests can be satisfied without solving the general problem."}]});
