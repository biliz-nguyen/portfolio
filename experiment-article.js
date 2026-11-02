/**
 * Load owner-reviewable markdown as a focused article on the Unitree page.
 * Other experiments retain the standard structured experiment template.
 */
(() => {
  "use strict";
  if(new URLSearchParams(location.search).get("slug")!=="unitree-lidar")return;
  const target=document.querySelector("#experiment-content .exp-main");
  if(!target)return;
  const aside=document.querySelector("#experiment-content .exp-aside");
  const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function inline(value){
    return escapeHtml(value)
      .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g,(_,label,url)=>
        '<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+label+'</a>')
      .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  }
  function render(md){
    const rows=md.replace(/\r/g,"").split("\n");
    let out="",code=null,list=null;
    const close=()=>{if(list){out+="</"+list+">";list=null;}};
    for(const row of rows){
      if(row.startsWith("~~~")){
        close();
        if(code===null)code=[];
        else {out+='<pre class="exp-source-code"><code>'+escapeHtml(code.join("\n"))+"</code></pre>";code=null;}
        continue;
      }
      if(code!==null){code.push(row);continue;}
      if(!row.trim()){close();continue;}
      const heading=row.match(/^(#{1,4})\s+(.+)$/);
      if(heading){
        close();
        const level=Math.min(4,heading[1].length+1);
        out+="<h"+level+">"+inline(heading[2])+"</h"+level+">";
        continue;
      }
      const photo=row.match(/^!\[([^\]]+)\]\((https:\/\/[^)\s]+)\)$/);
      if(photo){
        close();
        out+='<figure><img loading="lazy" alt="'+escapeHtml(photo[1])+'" src="'+escapeHtml(photo[2])+'"></figure>';
        continue;
      }
      const item=row.match(/^[-*] (.+)$/),ordered=row.match(/^\d+\. (.+)$/);
      if(item||ordered){
        const kind=item?"ul":"ol";
        if(list!==kind){close();out+="<"+kind+">";list=kind;}
        out+="<li>"+inline((item||ordered)[1])+"</li>";
        continue;
      }
      close();
      if(row.startsWith("> ")){out+="<blockquote>"+inline(row.slice(2))+"</blockquote>";continue;}
      if(row.startsWith("*")&&row.endsWith("*")){out+='<p class="exp-figure-caption">'+inline(row.slice(1,-1))+"</p>";continue;}
      out+="<p>"+inline(row)+"</p>";
    }
    close();
    return out;
  }
  target.innerHTML='<div class="exp-article-loading">Loading technical draft…</div>';
  if(aside){
    aside.insertAdjacentHTML("afterbegin",
      '<div class="exp-aside-box"><span class="exp-label">SOURCE-BASED DRAFT</span>'+
      '<p class="exp-aside-notice" style="margin-top:12px">Review before publishing numerical findings. The original repository documents setup and screenshots, not a complete benchmark.</p>'+
      '<div class="exp-links"><a href="https://github.com/biliz-nguyen/portfolio/edit/main/experiments/unitree-lidar.md" target="_blank" rel="noopener noreferrer">EDIT ARTICLE ON GITHUB ↗</a></div></div>');
  }
  fetch("experiments/unitree-lidar.md")
    .then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.text();})
    .then(md=>{target.innerHTML='<article class="exp-source-article">'+render(md)+'</article>';})
    .catch(()=>{target.innerHTML='<section class="exp-block"><h2>Draft unavailable</h2><p>Read the Markdown in the portfolio repository.</p></section>';});
})();