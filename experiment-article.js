/**
 * Load owner-reviewable markdown as a focused article on the Unitree page.
 * Other experiments retain the standard structured experiment template.
 */
(() => {
  "use strict";
  if(new URLSearchParams(location.search).get("slug")!=="unitree-lidar")return;
  document.body.classList.add("page-unitree-pixel");
  const target=document.querySelector("#experiment-content .exp-main");
  if(!target)return;
  const aside=document.querySelector("#experiment-content .exp-aside");
  const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function inline(value){
    return escapeHtml(value)
      .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g,(_,label,url)=>
        '<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+label+'</a>')
      .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")
      .replace(/`([^`]+)`/g,"<code>$1</code>");
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
  target.innerHTML='<div class="exp-article-loading">Loading experiment notes…</div>';
  if(aside){
    aside.insertAdjacentHTML("afterbegin",
      '<div class="exp-aside-box unitree-author-box"><span class="exp-label">PROJECT AUTHOR</span><strong>BILIZ NGUYEN</strong><span class="unitree-author-alias">GitHub: NguyenLeMinh-dev</span></div>'+
      '<div class="exp-aside-box"><span class="exp-label">PIXEL LAB / SETUP TEST</span>'+
      '<p class="exp-aside-notice" style="margin-top:12px">Project author confirms the hardware and ROS 2 visualization test. No model training or quantitative SLAM benchmark was performed.</p>'+
      '<div class="exp-links"><a href="https://github.com/biliz-nguyen/portfolio/edit/main/experiments/unitree-lidar.md" target="_blank" rel="noopener noreferrer">EDIT ARTICLE ON GITHUB ↗</a></div></div>');
  }
  fetch("experiments/unitree-lidar.md")
    .then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.text();})
    .then(md=>{target.innerHTML='<article class="exp-source-article">'+"<div class=\"unitree-pixel-rig\"><div class=\"unitree-pixel-top\"><span><i class=\"unitree-pixel-led\" aria-hidden=\"true\"></i> RESEARCH_ATLAS / EXP_001</span><span>PERSONAL PROJECT</span></div><div class=\"unitree-pixel-content\"><div class=\"unitree-pixel-art\"><svg viewBox=\"0 0 120 82\" shape-rendering=\"crispEdges\" aria-hidden=\"true\" focusable=\"false\"><g fill=\"#a4d3f3\"><rect x=\"56\" y=\"9\" width=\"8\" height=\"4\"/><rect x=\"39\" y=\"15\" width=\"5\" height=\"5\"/><rect x=\"79\" y=\"17\" width=\"5\" height=\"5\"/><rect x=\"25\" y=\"28\" width=\"5\" height=\"5\"/><rect x=\"92\" y=\"29\" width=\"5\" height=\"5\"/><rect x=\"15\" y=\"44\" width=\"4\" height=\"4\"/><rect x=\"103\" y=\"45\" width=\"4\" height=\"4\"/></g><path d=\"M20 58Q60 6 100 58M34 57Q60 25 86 57\" stroke=\"#5d86bc\" opacity=\".6\" fill=\"none\" stroke-width=\"2\" stroke-dasharray=\"3 6\"/><rect x=\"47\" y=\"51\" width=\"26\" height=\"12\" fill=\"#29476b\" stroke=\"#7fafdf\" stroke-width=\"2\"/><rect x=\"54\" y=\"45\" width=\"12\" height=\"6\" fill=\"#8ad0eb\"/><rect x=\"59\" y=\"34\" width=\"3\" height=\"11\" fill=\"#c4edff\"/><rect x=\"57\" y=\"55\" width=\"6\" height=\"5\" fill=\"#c3e6fd\"/></svg></div><div class=\"unitree-pixel-route\"><span class=\"unitree-pixel-kicker\">SENSOR PIPELINE / SETUP TEST</span><div class=\"unitree-pixel-stages\"><span>UNITREE L1</span><b aria-hidden=\"true\">→</b><span>ROS 2</span><b aria-hidden=\"true\">→</b><span>POINT-LIO</span></div><p>Learn · Configure · Visualize · Validate</p></div></div><div class=\"unitree-pixel-foot\"><span>LAB LOG // SYSTEM INTEGRATION</span><span>SETUP TESTED / NO TRAINING</span></div></div>"+'<div class="unitree-pixel-article-text">'+render(md)+'</div></article>';})
    .catch(()=>{target.innerHTML='<section class="exp-block"><h2>Draft unavailable</h2><p>Read the Markdown in the portfolio repository.</p></section>';});
})();