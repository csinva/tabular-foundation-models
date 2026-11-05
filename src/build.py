import json, re, pathlib, html
root = pathlib.Path(__file__).resolve().parent
deck = json.loads((root/"deck.json").read_text())
arrow = '<svg width="96" height="24" viewBox="0 0 96 24" style="flex:none"><line x1="8" y1="12" x2="80" y2="12" stroke="#16202E" stroke-width="3"/><path d="M78 3 L94 12 L78 21 Z" fill="#16202E"/></svg>'
slides, notes = [], []
for i, sid in enumerate(deck["order"], 1):
    s = (root/"slides"/f"{sid}.html").read_text()
    s = re.sub(r'<x-connector[^>]*></x-connector>', arrow, s)
    m = re.search(r'<aside>(.*?)</aside>', s, re.S)
    h = re.search(r'<h[12][^>]*>(.*?)</h[12]>', s, re.S)
    title = re.sub(r'<br>', ' ', h.group(1)) if h else sid
    notes.append(f"## {i}. {html.unescape(re.sub('<[^>]+>','',title))}\n\n{m.group(1).strip() if m else ''}\n")
    slides.append(s)
viz = (root/"viz_head.js").read_text() + (root/"viz_body.js").read_text()
import base64
IMG = "data:image/png;base64," + base64.b64encode((root/"kumo_pareto.png").read_bytes()).decode()

fonts = "".join(f'<link rel="stylesheet" href="{f["href"]}">' for f in deck["faces"].values())
doc = f"""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{deck['title']}</title>{fonts}
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{background:#0d1118;height:100%;overflow:hidden}}
section{{width:1920px;height:1080px;position:relative;overflow:hidden;flex:none}}
section > aside{{display:none}}
ul{{padding-left:1.1em}} li::marker{{color:#B4501F}}
table{{border-collapse:collapse;width:100%}} th,td{{padding:0.35em 0.6em;border-bottom:1px solid #D8D1C3;vertical-align:top}} th{{border-bottom:2px solid #16202E}}
.slide-wrap{{position:absolute;left:50%;top:50%;width:1920px;height:1080px;transform-origin:0 0;opacity:0;visibility:hidden;transition:opacity .25s ease}}
.slide-wrap.active{{opacity:1;visibility:visible}}
body.ov{{overflow:auto}}
body.ov .slide-wrap{{opacity:1;visibility:visible;transition:none;cursor:pointer;border-radius:6px;overflow:hidden}}
body.ov .slide-wrap.sel{{outline-style:solid;outline-color:#F0894A}}
#counter{{position:fixed;right:16px;bottom:12px;font:14px/1 'IBM Plex Mono',monospace;color:#8F9BAB;opacity:.7;user-select:none;pointer-events:none}}
@page{{size:1920px 1080px;margin:0}}
@media print{{
  html,body{{background:none;height:auto;overflow:visible}}
  #counter{{display:none}}
  .slide-wrap{{position:relative;left:0;top:0;transform:none!important;opacity:1;visibility:visible;transition:none;page-break-after:always;break-after:page}}
}}
</style></head><body>
{''.join(f'<div class="slide-wrap">{s}</div>' for s in slides)}
<div id="counter"></div>
<script>{viz}</script>
<script>
(function(){{
  var w=[].slice.call(document.querySelectorAll('.slide-wrap')), n=w.length, i=0, c=document.getElementById('counter');
  function fit(){{
    var k=Math.min(window.innerWidth/1920, window.innerHeight/1080);
    w.forEach(function(d){{d.style.transform='scale('+k+') translate(-50%,-50%)';}});
  }}
  var prev=-1;
  function show(j){{
    i=Math.max(0,Math.min(n-1,j));
    if(prev!==i){{ if(prev>=0) w[prev].dispatchEvent(new Event('slide:leave')); w[i].dispatchEvent(new Event('slide:enter')); prev=i; }}
    w.forEach(function(d,t){{d.classList.toggle('active',t===i);}});
    c.textContent=(i+1)+' / '+n;
    history.replaceState(null,'','#'+(i+1));
  }}
  var ov=false, sel=0;
  var cut=[0,1];['sec2','sec3'].forEach(function(id){{var j=w.findIndex(function(d){{return d.querySelector('section#'+id);}});if(j>0)cut.push(j);}});cut.push(n);
  var secs=[];for(var q=0;q<cut.length-1;q++)secs.push([cut[q],cut[q+1]]);
  var names=['','1 · Overview','2 · TabPFN v2','3 · Later models'].slice(0,secs.length),pos=[],hdrs=names.map(function(t){{
    var p=document.createElement('p');p.textContent=t;p.style.cssText="position:absolute;display:none;font:600 22px/1 'Space Grotesk',Arial,sans-serif;color:#8F9BAB;letter-spacing:0.5px";document.body.appendChild(p);return p;}});
  function layout(){{
    var S=secs.length,T=Math.max(S+2,Math.floor(innerWidth/280)),g=24,sg=72,hh=44,ns=secs.map(function(r){{return r[1]-r[0];}}),cs=null,best=1e9;
    (function rec(i,left,acc){{ if(i===S-1){{var a=acc.concat([left]);if(left<1)return;var r=Math.max.apply(null,a.map(function(c,j){{return Math.ceil(ns[j]/c);}}));if(r<best){{best=r;cs=a;}}return;}}
      for(var c=1;c<=left-(S-1-i);c++)rec(i+1,left-c,acc.concat([c])); }})(0,T,[]);
    var tw=(innerWidth-2*g-(S-1)*sg-(T-S)*g)/T,sc=tw/1920,th=1080*sc,xs=[g];
    for(var j=1;j<S;j++)xs.push(xs[j-1]+cs[j-1]*tw+(cs[j-1]-1)*g+sg);
    secs.forEach(function(sr,s){{
      var x0=xs[s];
      hdrs[s].style.display='block';hdrs[s].style.left=x0+'px';hdrs[s].style.top=g+'px';
      for(var t=sr[0];t<sr[1];t++){{var k=t-sr[0],r=Math.floor(k/cs[s]),cc=k%cs[s],d=w[t];
        pos[t]={{s:s,k:k,cs:cs[s]}};
        d.style.left=(x0+cc*(tw+g))+'px';d.style.top=(g+hh+r*(th+g))+'px';d.style.transform='scale('+sc+')';d.style.outlineWidth=(5/sc)+'px';
        d.classList.toggle('sel',t===sel);}}
    }});
    return 0;
  }}
  function vmove(dir){{var p=pos[sel],sr=secs[p.s],t=sel+dir*p.cs;if(t>=sr[0]&&t<sr[1])sel=t;}}
  function openOv(){{ov=true;sel=i;document.body.classList.add('ov');layout();w[sel].scrollIntoView({{block:'center'}});c.textContent='';}}
  function closeOv(j){{ov=false;document.body.classList.remove('ov');window.scrollTo(0,0);hdrs.forEach(function(h){{h.style.display='none';}});
    w.forEach(function(d){{d.style.left='';d.style.top='';d.style.outlineWidth='';d.classList.remove('sel');}});fit();show(j);}}
  document.addEventListener('keydown',function(e){{
    if(e.metaKey||e.ctrlKey||e.altKey) return;
    var k=e.key, a=document.activeElement;
    if(ov){{
      var cols=layout();
      if(k==='Escape')closeOv(i);
      else if(k==='Enter'||k===' ')closeOv(sel);
      else if(k==='ArrowRight')sel=Math.min(n-1,sel+1);
      else if(k==='ArrowLeft')sel=Math.max(0,sel-1);
      else if(k==='ArrowDown')vmove(1);
      else if(k==='ArrowUp')vmove(-1);
      else return;
      e.preventDefault(); if(ov){{layout();w[sel].scrollIntoView({{block:'nearest'}});}} return;
    }}
    if(k==='Escape'&&!(a&&a.tagName==='INPUT')){{openOv();e.preventDefault();return;}}
    if(a&&a.tagName==='INPUT') {{ if(k==='Escape') a.blur(); return; }}
    if(a&&a.tagName==='BUTTON'&&(k===' '||k==='Enter')) return;
    if(k==='ArrowRight'||k==='ArrowDown'||k===' '||k==='PageDown'||k==='Enter'){{show(i+1);e.preventDefault();}}
    else if(k==='ArrowLeft'||k==='ArrowUp'||k==='PageUp'||k==='Backspace'){{show(i-1);e.preventDefault();}}
    else if(k==='Home'){{show(0);e.preventDefault();}}
    else if(k==='End'){{show(n-1);e.preventDefault();}}
    else if(k==='f'||k==='F'){{
      if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen();
    }}
  }});
  document.addEventListener('click',function(e){{
    if(ov){{var d=e.target.closest('.slide-wrap');if(d)closeOv(w.indexOf(d));return;}}
    if(e.target.closest('.viz,button,input'))return;show(e.clientX>window.innerWidth/2?i+1:i-1);}});
  window.addEventListener('resize',function(){{if(ov)layout();else fit();}});
  var h=parseInt(location.hash.slice(1),10);
  fit(); show(isNaN(h)?0:h-1);
}})();
</script></body></html>"""
doc = doc.replace('src="kumo_pareto.png"', 'src="'+IMG+'"')
(root.parent/"index.html").write_text(doc)
print("ok", len(slides))
