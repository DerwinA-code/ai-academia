/* ---------- the proof page, routing, start ---------- */
function renderProof(){
  $("#crumb").textContent="How the records prove their work";
  $("#main").innerHTML=`<div class="card pad prose" style="max-width:none"><span class="eyebrow">The standard, from 24 Nov 2026</span>
   <h1 style="font-size:1.7rem">Every section shows how it was done, and the files that prove it</h1>
   <p>Each section of every academia (Fractal, Ruby, Odysseus, Volta, the NCM lab and AI academia) ends with three blocks. They're written to one standard: <b>AI academia 00, How every record is written</b>.</p>
   <table class="t"><tr><th>Block</th><th>What it holds</th><th>Example</th></tr>
    <tr><td><b>How we did it</b></td><td>The steps in order, the settings that matter, and the bar set before the run.</td><td>1. Three more hard-exam runs with the line (<code>chain6.cmd</code>). 2. The Rust exam with the playbook alone, then with the line…</td></tr>
    <tr><td><b>Proof</b></td><td>What ran, the result files, the code, a command to check it yourself, and what was <i>not</i> kept. Every path was checked when it was written, and the docs page marks each one as found or missing.</td><td><code>Fractal\\exam-kit\\results\\r1-book-cases.jsonl</code><br>Check it yourself: <code>exam pair results\\r1-book-cases.jsonl results\\r1-book.jsonl</code></td></tr>
    <tr><td><b>The idea behind it</b></td><td>A link to the technique's lesson here, and its full write-up in AI academia 13.</td><td>Paired comparison and the sign test</td></tr></table>
   <h2 style="font-size:1.2rem;margin-top:8px">Why "check it yourself" re-grades instead of re-running</h2>
   <p>Every answer a model gave in an exam is saved. Re-grading those answers against the hidden tests needs no model and takes seconds, and it gives the same verdicts if the record is honest. Re-running the model costs GPU time and differs a little from run to run (see <a href="#repeats">Repeats and the noise floor</a>).</p>
   <h2 style="font-size:1.2rem;margin-top:8px">What "Not kept" means</h2>
   <p>Some early work only printed its result to a console, and some files went in the 12 Nov clean-up. Those gaps are written down where they are, not hidden. A number with no file behind it says so.</p></div>`;
  drawSide("proof");
}
function route(){const h=location.hash.slice(1)||"home";const l=LESSONS.find(x=>x.id===h);L=null;stopAuto();
  if(l)renderLesson(l);else if(h==="proof")renderProof();else{renderHome();drawSide("home")}window.scrollTo(0,0)}
addEventListener("hashchange",route);
$("#menuBtn").addEventListener("click",()=>document.body.classList.toggle("menu"));
$("#themeBtn").addEventListener("click",()=>{const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==="dark":!matchMedia("(prefers-color-scheme: light)").matches;r.dataset.theme=dark?"light":"dark";store.set("lattice-hub-theme",r.dataset.theme)});
(()=>{const t=store.get("lattice-hub-theme",null);if(t)document.documentElement.dataset.theme=t})();
route();
</script>
</body>
</html>
