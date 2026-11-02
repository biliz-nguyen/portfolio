(() => {
  "use strict";
  const logs=window.EXPERIMENT_LOGS||[];
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const sel=document.getElementById("experiment-content");
  const grid=document.getElementById("experiment-list");
  const name=(l)=>"EXP_"+esc(l.number);
  if (grid) {
    grid.innerHTML=logs.map(l=>'<a class="exp-list-row" href="experiment.html?slug='+encodeURIComponent(l.slug)+'"><span class="exp-list-index">'+name(l)+' / '+esc(l.type)+'</span><span class="exp-list-title">'+esc(l.title)+'</span><span class="exp-list-summary">'+esc(l.summary)+'</span><span class="exp-list-arrow" aria-hidden="true">↗</span></a>').join("");
  }
  if(!sel)return;
  const slug=new URLSearchParams(location.search).get("slug")||"";
  const x=logs.find(l=>l.slug===slug);
  if(!x) {
    document.title="Experiment not found | Biliz Research Atlas";
    sel.innerHTML='<section class="exp-error"><h1>Experiment not found.</h1><p>Select an entry from the archive.</p><a href="experiments.html">← All experiments</a></section>';
    return;
  }
  document.title=x.title+" | Experiment Log — Biliz Research Atlas";
  const simpleList=(arr)=>'<ul>'+arr.map(item=>'<li>'+esc(item)+'</li>').join("")+'</ul>';
  const workflow=x.workflow.map((step,i)=>'<li><span class="exp-step-number">'+String(i+1).padStart(2,"0")+'</span><div><strong>'+esc(step[0])+'</strong><p>'+esc(step[1])+'</p></div></li>').join("");
  const anchors=(arr)=>arr.map(row=>'<a href="'+esc(row[1])+'"'+(row[1].startsWith("https://")?' target="_blank" rel="noopener noreferrer"':"")+'>'+esc(row[0])+' ↗</a>').join("");
  sel.innerHTML=
    '<div class="exp-breadcrumb"><a href="index.html#experiments">HOME</a><span>/</span><a href="experiments.html">EXPERIMENTS</a><span>/</span>'+name(x)+'</div>'+
    '<header class="exp-header"><div class="exp-meta"><span>'+name(x)+' / '+esc(x.type)+'</span><span class="exp-status">'+esc(x.status)+'</span></div><h1>'+esc(x.title)+'</h1><p>'+esc(x.summary)+'</p></header>'+
    '<div class="exp-layout"><div class="exp-main">'+
    '<section class="exp-block" id="objective"><span class="exp-label">01 / OBJECTIVE</span><h2>What are we testing?</h2><p>'+esc(x.objective)+'</p><h3>Research questions</h3>'+simpleList(x.questions)+'</section>'+
    '<section class="exp-block" id="setup"><span class="exp-label">02 / SETUP</span><h2>Hardware & environment</h2>'+simpleList(x.setup)+'</section>'+
    '<section class="exp-block" id="method"><span class="exp-label">03 / METHOD</span><h2>Experiment workflow</h2><ol class="exp-steps">'+workflow+'</ol></section>'+
    '<section class="exp-block" id="data"><span class="exp-label">04 / DATA & OUTPUTS</span><h2>Evidence & artifacts</h2><p>'+esc(x.data)+'</p><div class="exp-placeholder">DATASET / PLOTS / VIDEOS <span>TO BE DOCUMENTED</span></div></section>'+
    '<section class="exp-block" id="results"><span class="exp-label">05 / RESULTS</span><h2>Current findings</h2><p>'+esc(x.results)+'</p></section>'+
    '<section class="exp-block" id="lessons"><span class="exp-label">06 / LEARNING JOURNAL</span><h2>Lessons & next steps</h2><p>'+esc(x.lessons)+'</p></section></div>'+
    '<aside class="exp-aside"><div class="exp-aside-box"><span class="exp-label">LAB LOG / QUICK VIEW</span><dl><dt>ENTRY</dt><dd>'+name(x)+'</dd><dt>TYPE</dt><dd>'+esc(x.type)+'</dd><dt>SCOPE</dt><dd>'+esc(x.scope)+'</dd><dt>STATUS</dt><dd>'+esc(x.status)+'</dd></dl><p class="exp-aside-notice">This page separates planned measurements from verified findings.</p></div>'+
    '<div class="exp-aside-box"><span class="exp-label">RELATED READING</span><div class="exp-links">'+anchors(x.notes)+'</div></div>'+
    (x.links.length?'<div class="exp-aside-box"><span class="exp-label">EXTERNAL LINKS</span><div class="exp-links">'+anchors(x.links)+'</div></div>':"")+
    '<a class="exp-back" href="experiments.html">← ALL EXPERIMENTS</a></aside></div>';
})();