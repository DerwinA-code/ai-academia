/* ---------- engine: routing, sidebar, lesson stage, quiz ---------- */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let prog=store.get("lattice-hub",{});
const MODS=[], LESSONS=[];
function mod(id,name,blurb){MODS.push({id,name,blurb})}
function lesson(o){LESSONS.push(o)}

/* scene primitives: each returns an <g class="el" id="s-ID"> so steps can show, hide, highlight and move it */
const SC={
  box(id,x,y,w,h,label,cls="",sub=""){return `<g class="el" id="s-${id}"><rect class="bx ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="9"/>`+
    `<text class="lbl" x="${x+w/2}" y="${y+h/2+(sub?-3:5)}" text-anchor="middle">${esc(label)}</text>`+
    (sub?`<text class="lbl sm" x="${x+w/2}" y="${y+h/2+13}" text-anchor="middle">${esc(sub)}</text>`:"")+`</g>`},
  arrow(id,x1,y1,x2,y2,cls=""){return `<g class="el" id="s-${id}"><path class="ln ${cls}" d="M${x1} ${y1}L${x2} ${y2}" marker-end="url(#ah)"/></g>`},
  curve(id,d,cls=""){return `<g class="el" id="s-${id}"><path class="ln ${cls}" d="${d}" marker-end="url(#ah)"/></g>`},
  text(id,x,y,str,cls="",anchor="middle"){return `<g class="el" id="s-${id}"><text class="lbl ${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(str)}</text></g>`},
  dot(id,x,y,r,cls=""){return `<g class="el" id="s-${id}"><circle class="bx ${cls}" cx="${x}" cy="${y}" r="${r}"/></g>`},
  raw(id,svg){return `<g class="el" id="s-${id}">${svg}</g>`},
};
const DEFS=`<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--line2)"/></marker>
<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
const ICON={
  star:`<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1.5l1.6 4.2 4.4.3-3.4 2.8 1.1 4.3L8 10.7 4.3 13.1l1.1-4.3L2 6l4.4-.3z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`,
  play:`<path d="M5 3l8 5-8 5z" fill="currentColor"/>`, pause:`<path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor"/>`,
};
function ring(p){const r=6.5,c=2*Math.PI*r;return `<svg class="ring" viewBox="0 0 16 16"><circle cx="8" cy="8" r="${r}" fill="none" stroke="var(--line2)" stroke-width="1.5"/><circle cx="8" cy="8" r="${r}" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="${c*p} ${c}" transform="rotate(-90 8 8)"/></svg>`}
function done(L){const n=L.steps.length;return Math.min(1,((prog[L.id]??-1)+1)/n)}

function drawSide(active){
  const q=($("#find")?.value||"").toLowerCase();
  $("#side").innerHTML=`<input id="find" placeholder="Find a technique" value="${esc(q)}" aria-label="Find a technique">
   <a href="#home" class="home ${active==="home"?"on":""}">Overview</a><a href="#proof" class="home ${active==="proof"?"on":""}">How the records prove their work</a>`+
   MODS.map(m=>{const ls=LESSONS.filter(l=>l.mod===m.id&&(!q||(l.title+" "+l.sub).toLowerCase().includes(q)));if(!ls.length)return"";
     return `<div class="mod-h"><span>${esc(m.name)}</span><span>${ls.filter(l=>done(l)>=1).length}/${ls.length}</span></div>`+
     ls.map(l=>`<a href="#${l.id}" class="${active===l.id?"on":""}">${ring(done(l))}<span>${esc(l.title)}</span></a>`).join("")}).join("");
  const f=$("#find");f.addEventListener("input",()=>{drawSide(active);const g=$("#find");g.focus();g.setSelectionRange(g.value.length,g.value.length)});
  $$("#side a").forEach(a=>a.addEventListener("click",()=>document.body.classList.remove("menu")));
}

function renderHome(){
  $("#crumb").textContent="Overview";
  const total=LESSONS.length, fin=LESSONS.filter(l=>done(l)>=1).length;
  $("#main").innerHTML=`<div class="card hero"><span class="eyebrow">The academia of the techniques</span>
   <h1>Learn how Lattice works, then try to break it</h1>
   <p class="sm" style="font-size:.95rem;max-width:75ch">Each lesson is one technique Fractal, Ruby, Odysseus or Volta uses. Step through it with the arrow keys, then open its
   lab and change the numbers until it fails: that is where the idea really sinks in. Every lesson ends with where we used it in the records,
   so you can open the proof, and a short check of what stuck. The full write-up of each technique, with its maths and sources, is
   <b>AI academia 13, Techniques, explained</b>.</p>
   <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><div class="bar" style="flex:1;min-width:160px"><i style="width:${total?fin/total*100:0}%"></i></div><span class="sm">${fin} of ${total} lessons finished</span>
   <a class="btn go" href="#${(LESSONS.find(l=>done(l)<1)||LESSONS[0]).id}">${fin?"Carry on":"Start"} <span>→</span></a></div></div>`+
   MODS.map(m=>{const ls=LESSONS.filter(l=>l.mod===m.id);if(!ls.length)return"";
    return `<div class="modtitle"><h2>${esc(m.name)}</h2><span class="sm">${esc(m.blurb)}</span></div><div class="grid">`+
    ls.map(l=>`<a class="card tile" href="#${l.id}"><span class="eyebrow">${l.steps.length} steps${l.lab?" · lab":""} · ${l.min} min</span><h3>${esc(l.title)}</h3><span class="sm">${esc(l.sub)}</span><div class="bar"><i style="width:${done(l)*100}%"></i></div></a>`).join("")+`</div>`}).join("");
}

let L=null,cur=0,auto=null;
function renderLesson(l){
  L=l;cur=0;stopAuto();
  const m=MODS.find(x=>x.id===l.mod), idx=LESSONS.indexOf(l);
  $("#crumb").textContent=`${m.name} / ${l.title}`;
  $("#main").innerHTML=`<div class="lesson">
   <div style="display:grid;gap:16px;min-width:0">
    <div class="card lhead"><div class="row"><span class="eyebrow">${esc(m.name)} · lesson ${idx+1} of ${LESSONS.length}</span>
      <span class="tags"><span class="tag">${l.min} min</span><span class="tag">${l.steps.length} steps</span>${l.lab?`<span class="tag" style="color:var(--accent)">lab</span>`:""}</span></div>
     <h1>${esc(l.title)}</h1><p class="sm" style="font-size:.92rem">${esc(l.sub)}</p></div>
    <div class="card stagewrap">
     ${l.metrics?`<div class="metrics">${l.metrics.map(x=>`<div class="metric"><small>${esc(x[1])}</small><b id="m-${x[0]}">—</b></div>`).join("")}</div>`:""}
     <div class="stage"><svg viewBox="0 0 640 360" id="scene" role="img" aria-label="${esc(l.title)}, animated">${DEFS}${l.build()}</svg></div>
     <div class="stage-tools"><span class="keys"><kbd>←</kbd><kbd>→</kbd> step <kbd>R</kbd> replay <kbd>Space</kbd> play</span>
      <span style="display:flex;gap:6px"><button class="iconbtn" id="replay" aria-label="Replay"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8a5 5 0 1 0 1.5-3.6M3 2v3h3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button>
      <button class="iconbtn" id="autoBtn" aria-label="Play the steps"><svg width="16" height="16" viewBox="0 0 16 16" id="autoIc">${ICON.play}</svg></button></span></div>
     <div class="dots" id="dots">${l.steps.map((s,i)=>`<button class="dot" data-i="${i}"><span>${i+1}</span><em>${esc(s.t)}</em></button>`).join("")}</div>
    </div>
    ${l.lab?`<div class="card lab" id="lab"></div>`:""}
    ${l.quiz?`<div class="card quiz" id="quiz"></div>`:""}
   </div>
   <div class="narr">
    <div class="card story" aria-live="polite" id="story"></div>
    <div class="card learn"><h3>You'll learn</h3><ul id="learn">${l.learn.map(x=>`<li data-at="${x[1]-1}"><i>✓</i><span>${esc(x[0])}</span></li>`).join("")}</ul></div>
    <div class="card learn"><h3>In our records</h3><div class="sm" style="display:grid;gap:6px">${l.records.map(r=>`<div>${r}</div>`).join("")}</div></div>
   </div></div>`;
  $$("#dots .dot").forEach(d=>d.addEventListener("click",()=>{stopAuto();go(+d.dataset.i)}));
  $("#replay").addEventListener("click",()=>{stopAuto();go(0)});
  $("#autoBtn").addEventListener("click",toggleAuto);
  if(l.lab){l.lab($("#lab"))}
  if(l.quiz){makeQuiz($("#quiz"),l.quiz)}
  go(Math.min(prog[l.id+"-at"]||0,l.steps.length-1),true);
}
function go(i,instant){
  cur=Math.max(0,Math.min(L.steps.length-1,i));const s=L.steps[cur];
  const vis=new Set(L.always||[]),pos={},m={};
  for(let j=0;j<=cur;j++){const t=L.steps[j];(t.show||[]).forEach(x=>vis.add(x));(t.hide||[]).forEach(x=>vis.delete(x));Object.assign(pos,t.pos||{});Object.assign(m,t.m||{})}
  const hl=new Set(s.hl||[]);
  $$("#scene .el").forEach(el=>{const id=el.id.slice(2);if(instant)el.style.transition="none";el.classList.toggle("off",!vis.has(id));el.classList.toggle("hl",hl.has(id));if(instant){void el.getBoundingClientRect();el.style.transition=""}});
  Object.entries(pos).forEach(([id,p])=>{const el=document.getElementById("s-"+id);if(el)el.style.transform=`translate(${p[0]}px,${p[1]}px)`});
  (L.metrics||[]).forEach(([k])=>{const b=$("#m-"+k);const v=m[k]??"—";if(b.textContent!==String(v)){b.textContent=v;b.classList.add("bump");setTimeout(()=>b.classList.remove("bump"),600)}});
  $$("#dots .dot").forEach((d,k)=>{d.classList.toggle("past",k<cur);d.classList.toggle("cur",k===cur)});
  const cd=$("#dots .dot.cur");if(cd&&!instant)cd.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"});
  $$("#learn li").forEach(li=>li.classList.toggle("got",cur>=+li.dataset.at));
  const idx=LESSONS.indexOf(L),nextL=LESSONS[idx+1],last=cur===L.steps.length-1;
  const nextLabel=last?(L.lab?"Open the lab":nextL?`Next lesson: ${nextL.title}`:"Back to the overview"):`Next: ${L.steps[cur+1].t}`;
  $("#story").innerHTML=`<div class="top"><span class="eyebrow">Step ${cur+1} / ${L.steps.length}</span></div>
   <h2>${esc(s.title)}</h2><div class="body">${s.body}</div>
   ${s.key?`<div class="keyidea"><span class="ic">${ICON.star}</span><div>${s.key}</div></div>`:""}
   ${s.lat?`<div class="inlattice"><small>IN LATTICE</small>${s.lat}</div>`:""}
   <div class="navbtns"><button class="btn" id="back" ${cur===0?"disabled":""}>← Back</button><button class="btn go" id="next"><span>${esc(nextLabel)}</span><span>→</span></button></div>`;
  $("#back").addEventListener("click",()=>{stopAuto();go(cur-1)});
  $("#next").addEventListener("click",()=>{stopAuto();next()});
  prog[L.id]=Math.max(prog[L.id]??-1,cur);prog[L.id+"-at"]=cur;store.set("lattice-hub",prog);
  drawSide(L.id);
}
function next(){if(cur<L.steps.length-1)go(cur+1);else if(L.lab){$("#lab").scrollIntoView({behavior:"smooth",block:"start"})}else{const n=LESSONS[LESSONS.indexOf(L)+1];location.hash=n?n.id:"home"}}
function stopAuto(){if(auto){clearInterval(auto);auto=null}const ic=$("#autoIc");if(ic)ic.innerHTML=ICON.play}
function toggleAuto(){if(auto){stopAuto();return}$("#autoIc").innerHTML=ICON.pause;auto=setInterval(()=>{if(cur>=L.steps.length-1){stopAuto();return}go(cur+1)},7000)}
document.addEventListener("keydown",e=>{if(!L||!$("#scene"))return;if(e.target.closest("input,textarea,select"))return;
  if(e.key==="ArrowRight"){stopAuto();next()}else if(e.key==="ArrowLeft"){stopAuto();go(cur-1)}else if(e.key==="r"||e.key==="R"){stopAuto();go(0)}else if(e.key===" "&&!e.target.closest("button,a")){e.preventDefault();toggleAuto()}});

function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function makeQuiz(root,items){
  let order=shuffle(items),i=0,right=0;
  function draw(){
    if(i>=order.length){root.innerHTML=`<span class="eyebrow">Check what stuck</span><h2 style="font-size:1.15rem">${right} of ${order.length} right</h2>
      <p class="sm">${right===order.length?"All of it. On to the next lesson.":"Step through the lesson again, or try the lab, then have another go."}</p>
      <div><button class="btn" id="again">Try again</button></div>`;$("#again").onclick=()=>{order=shuffle(items);i=0;right=0;draw()};
      prog[L.id+"-quiz"]=Math.max(prog[L.id+"-quiz"]||0,right/order.length);store.set("lattice-hub",prog);return}
    const it=order[i],opts=shuffle(it.o.map((t,k)=>({t,ok:k===it.a})));
    root.innerHTML=`<div style="display:flex;justify-content:space-between"><span class="eyebrow">Check what stuck</span><span class="sm">${i+1} of ${order.length}</span></div>
     <p class="stmt">${it.q}</p><div class="opts">${opts.map((o,k)=>`<button class="opt" data-k="${k}">${o.t}</button>`).join("")}</div><p class="fb" aria-live="polite"></p>`;
    let answered=false;
    $$("#quiz .opt").forEach(b=>b.addEventListener("click",()=>{if(answered)return;answered=true;const o=opts[+b.dataset.k];
      $$("#quiz .opt").forEach((x,k)=>{if(opts[k].ok)x.classList.add("right")});if(!o.ok)b.classList.add("wrong");else right++;
      root.querySelector(".fb").innerHTML=(o.ok?"<b style='color:var(--good)'>Right.</b> ":"<b style='color:var(--bad)'>Not quite.</b> ")+it.why+
       ` <button class="btn" style="margin-left:6px;padding:4px 10px" id="qn">${i+1<order.length?"Next":"Finish"} →</button>`;
      $("#qn").onclick=()=>{i++;draw()}}));
  }
  draw();
}

/* small helpers for labs */
function slider(id,label,min,max,step,val,fmt=v=>v){return `<label>${label} <b id="${id}-v">${fmt(val)}</b><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`}
function wire(root,ids,fmts,fn){ids.forEach((id,k)=>{const el=root.querySelector("#"+id);el.addEventListener("input",()=>{root.querySelector("#"+id+"-v").textContent=(fmts[k]||(v=>v))(+el.value);fn()})});fn()}
const val=(root,id)=>+root.querySelector("#"+id).value;
