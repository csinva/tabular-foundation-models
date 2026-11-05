/* Animation driver: runs while the slide is shown, restarts on every entry */
function play(root,frame){
  var w=root.closest('.slide-wrap'),raf=0,t0=0;
  function tick(ts){if(!t0)t0=ts;frame((ts-t0)/1000);raf=requestAnimationFrame(tick);}
  w.addEventListener('slide:enter',function(){cancelAnimationFrame(raf);t0=0;raf=requestAnimationFrame(tick);});
  w.addEventListener('slide:leave',function(){cancelAnimationFrame(raf);});
  frame(0);
}
function pill(p,label){return h('p',{style:'font:500 24px '+SANS+';padding:10px 24px;border:2px solid '+C.ink+';border-radius:999px;transition:background .3s,color .3s'},p,label);}
function track(p,width){var t=h('div',{style:'width:'+width+'px;height:8px;border-radius:4px;background:'+C.grid+';position:relative'},p);
  var f=h('div',{style:'position:absolute;left:0;top:0;height:8px;border-radius:4px;background:'+C.orange},t);
  var k=h('div',{style:'position:absolute;top:-8px;width:24px;height:24px;border-radius:50%;background:'+C.orange+';transform:translateX(-12px)'},t);
  return function(u){f.style.width=(u*width)+'px';k.style.left=(u*width)+'px';};}
function ease(u){return u<0.5?2*u*u:1-Math.pow(-2*u+2,2)/2;}

/* 1. Two-way attention (static): one test cell, both attention patterns */
V.attn=function(root){
  var W=940,H=480;
  var lg=h('div',{style:'display:flex;gap:32px;align-items:center'},root);
  [[C.blueL,C.blue,'1 · across the row'],[C.orangeL,C.orange,'2 · down the column']].forEach(function(it){var d=h('div',{style:'display:flex;gap:10px;align-items:center'},lg);
    h('div',{style:'width:28px;height:28px;border-radius:5px;background:'+it[0]+';border:3px solid '+it[1]},d);h('p',{style:'font:24px '+SANS},d,it[2]);});
  var svg=el('svg',{width:W,height:H,viewBox:'0 0 '+W+' '+H,style:'display:block;margin-top:20px'},root);
  h('p',{style:'font:26px/1.4 '+SANS+';color:'+C.soft+';margin-top:12px'},root,'(test 1, x3) attends across its row, including the empty y, and to the 5 train cells of x3. It never sees test 2.');
  var cols=['x1','x2','x3','x4','x5','y'],rows=['train 1','train 2','train 3','train 4','train 5','test 1','test 2'];
  var X0=190,PW=108,CW=100,CH=48,sel={r:5,j:2};
  function ry(r){return r<5?50+r*58:50+5*58+28+(r-5)*58;}
  cols.forEach(function(c,j){txt(svg,X0+j*PW+CW/2,30,c,{'text-anchor':'middle','font-family':MONO,'font-size':26});});
  rows.forEach(function(n,r){txt(svg,170,ry(r)+CH/2+8,n,{'text-anchor':'end',fill:C.soft});});
  rows.forEach(function(_,r){cols.forEach(function(_,j){
    var test=r>=5,isY=j===5,fill=isY?(test?C.ground:C.orange):C.cell,stroke='none',sw=0,dash='',op=1;
    if(isY&&test){stroke=C.orange;sw=2.5;dash='7 5';}
    if(r===sel.r&&j===sel.j){fill=C.ink;stroke='none';sw=0;}
    else if(r===sel.r){fill=isY?C.blueL:C.blueL;stroke=C.blue;sw=4;dash=isY?'7 5':'';}
    else if(j===sel.j){if(test)op=0.3;else{fill=C.orangeL;stroke=C.orange;sw=4;}}
    el('rect',{x:X0+j*PW,y:ry(r),width:CW,height:CH,rx:6,fill:fill,stroke:stroke,'stroke-width':sw,'stroke-dasharray':dash,opacity:op},svg);});});
};

/* 2. Prior: a new random SCM and its table every few seconds */
V.prior=function(root){
  var row=h('div',{style:'display:flex;gap:40px;align-items:center;transition:opacity .1s'},root);
  var GW=720,GH=520,SW=600,SH=520;
  var gsvg=el('svg',{width:GW,height:GH,viewBox:'0 0 '+GW+' '+GH},row);
  var ar=el('svg',{width:64,height:24,viewBox:'0 0 64 24'},row);el('line',{x1:4,y1:12,x2:46,y2:12,stroke:C.ink,'stroke-width':3},ar);el('path',{d:'M44 3 L60 12 L44 21 Z',fill:C.ink},ar);
  var ssvg=el('svg',{width:SW,height:SH,viewBox:'0 0 '+SW+' '+SH},row);
  var pb=h('div',{style:'display:flex;gap:20px;align-items:center;margin-top:28px'},root);
  var tr=track(pb,1200);var pl=h('p',{style:'font:24px '+MONO+';color:'+C.muted},pb);
  var cap=h('p',{style:'font:26px/1.4 '+SANS+';color:'+C.soft+';margin-top:16px;transition:opacity .1s'},root);
  var FUNCS={tanh:Math.tanh,relu:function(x){return Math.max(0,x);},sine:function(x){return Math.sin(2*x);},linear:function(x){return x;},step:function(x){return x>0.3?1:0;}};
  var FN=Object.keys(FUNCS);
  function z(a){var m=0,s=0,i;for(i=0;i<a.length;i++)m+=a[i];m/=a.length;for(i=0;i<a.length;i++)s+=(a[i]-m)*(a[i]-m);s=Math.sqrt(s/a.length)||1;return a.map(function(v){return(v-m)/s;});}
  function sample(r){
    var L=3+(r()<0.5?1:0),nodes=[],edges=[],N=260;
    for(var l=0;l<L;l++){var k=2+Math.floor(r()*2);for(var i=0;i<k;i++)nodes.push({l:l,i:i,k:k});}
    nodes.forEach(function(n,a){if(n.l===0)return;var ps=[];nodes.forEach(function(m,b){if(m.l<n.l&&r()<0.35)ps.push(b);});
      if(!ps.length){var prev=[];nodes.forEach(function(m,b){if(m.l===n.l-1)prev.push(b);});ps.push(prev[Math.floor(r()*prev.length)]);}
      n.parents=ps;n.w=ps.map(function(){return(0.6+r())*(r()<0.5?-1:1);});n.f=FN[Math.floor(r()*FN.length)];n.noise=0.1+0.25*r();ps.forEach(function(p){edges.push([p,a]);});});
    nodes.forEach(function(n){
      var v;
      if(n.l===0){var uni=r()<0.5;v=[];for(var s=0;s<N;s++)v.push(uni?(r()*2-1)*1.7:gauss(r));}
      else{var pre=[];for(var s2=0;s2<N;s2++){var t=0;n.parents.forEach(function(p,q){t+=n.w[q]*nodes[p].v[s2];});pre.push(t);}
        pre=z(pre);v=pre.map(function(x){return FUNCS[n.f](x)+n.noise*gauss(r);});}
      n.v=z(v);
    });
    var cand=[];nodes.forEach(function(n,a){if(n.l>=1)cand.push(a);});var tgt=cand[Math.floor(r()*cand.length)];
    var anc={},des={};(function up(a){edges.forEach(function(e){if(e[1]===a&&!anc[e[0]]){anc[e[0]]=1;up(e[0]);}});})(tgt);
    (function dn(a){edges.forEach(function(e){if(e[0]===a&&!des[e[1]]){des[e[1]]=1;dn(e[1]);}});})(tgt);
    var rel=[],oth=[];nodes.forEach(function(_,a){if(a===tgt)return;(anc[a]||des[a]?rel:oth).push(a);});
    function pick(){var pool=(rel.length&&(r()<0.85||!oth.length))?rel:oth;var j=Math.floor(r()*pool.length);return pool.splice(j,1)[0];}
    var f1=pick(),f2=pick();if(f2===undefined)f2=oth.length?oth.pop():rel.pop();
    var K=r()<0.5?2:3,tv=nodes[tgt].v.slice().sort(function(a,b){return a-b;}),th=[];for(var q=1;q<K;q++)th.push(tv[Math.floor(q*N/K)]);
    var y=nodes[tgt].v.map(function(v){var c=0;th.forEach(function(t){if(v>t)c++;});return c;});
    function relName(a){return anc[a]?'upstream of y':des[a]?'downstream of y':'not causally linked to y';}
    return {nodes:nodes,edges:edges,tgt:tgt,f:[f1,f2],y:y,K:K,L:L,rel:[relName(f1),relName(f2)]};
  }
  function knn(d){var xs=d.nodes[d.f[0]].v,ys=d.nodes[d.f[1]].v,n=xs.length,ok=0;
    for(var i=0;i<n;i++){var bd=[1e9,1e9,1e9,1e9,1e9],bl=[0,0,0,0,0];
      for(var j=0;j<n;j++){if(i===j)continue;var dd=(xs[i]-xs[j])*(xs[i]-xs[j])+(ys[i]-ys[j])*(ys[i]-ys[j]);
        if(dd<bd[4]){var p=4;while(p>0&&bd[p-1]>dd){bd[p]=bd[p-1];bl[p]=bl[p-1];p--;}bd[p]=dd;bl[p]=d.y[j];}}
      var cnt={},top=-1,tc=-1;bl.forEach(function(l){cnt[l]=(cnt[l]||0)+1;});for(var k in cnt)if(cnt[k]>tc){tc=cnt[k];top=+k;}if(top===d.y[i])ok++;}
    return ok/n-1/d.K;}
  function draw(d,idx){
    while(gsvg.firstChild)gsvg.removeChild(gsvg.firstChild);while(ssvg.firstChild)ssvg.removeChild(ssvg.firstChild);
    marker(gsvg,'priorM',C.muted);
    d.nodes.forEach(function(n){n.x=(n.i+1)*GW/(n.k+1);n.y=50+n.l*((GH-140)/(d.L-1));});
    d.edges.forEach(function(e){var a=d.nodes[e[0]],b=d.nodes[e[1]];el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:C.muted,'stroke-width':2.5,'marker-end':'url(#priorM)'},gsvg);});
    d.nodes.forEach(function(n,a){var role=a===d.tgt?'t':a===d.f[0]?'x1':a===d.f[1]?'x2':'h';
      el('circle',{cx:n.x,cy:n.y,r:30,fill:role==='t'?C.orange:role==='h'?C.hidden:C.blue},gsvg);
      if(role!=='h')txt(gsvg,n.x,n.y+9,role==='t'?'y':role,{'text-anchor':'middle','font-family':MONO,'font-size':26,fill:C.ground});
      else if(n.l>0)txt(gsvg,n.x,n.y+8,n.f,{'text-anchor':'middle','font-family':MONO,'font-size':18,fill:C.soft});});
    var lg=[[C.blue,'shown feature'],[C.orange,'target'],[C.hidden,'other node']],lx=0;
    lg.forEach(function(it){el('circle',{cx:lx+14,cy:GH-24,r:12,fill:it[0]},gsvg);txt(gsvg,lx+36,GH-16,it[1],{fill:C.soft});lx+=it[1].length*13+80;});
    var M=70,T=56,PWd=SW-M-20,PHd=SH-T-70;
    el('rect',{x:M,y:T,width:PWd,height:PHd,fill:C.card,stroke:C.line},ssvg);
    var xs=d.nodes[d.f[0]].v,ys=d.nodes[d.f[1]].v;function mm(a){return[Math.min.apply(null,a),Math.max.apply(null,a)];}
    var bx=mm(xs),by=mm(ys),cl=[C.blue,C.light,C.ink];
    xs.forEach(function(x,s){el('circle',{cx:M+12+(x-bx[0])/(bx[1]-bx[0]||1)*(PWd-24),cy:T+12+(1-(ys[s]-by[0])/(by[1]-by[0]||1))*(PHd-24),r:6.5,fill:cl[d.y[s]],opacity:0.85},ssvg);});
    txt(ssvg,M+PWd/2,SH-20,'x1',{'text-anchor':'middle','font-family':MONO,'font-size':26});
    txt(ssvg,36,T+PHd/2+8,'x2',{'text-anchor':'middle','font-family':MONO,'font-size':26});
    var kx=M;for(var c=0;c<d.K;c++){el('circle',{cx:kx+10,cy:24,r:9,fill:cl[c]},ssvg);txt(ssvg,kx+28,32,'class '+c,{fill:C.soft});kx+=150;}
    cap.textContent=d.nodes.length+' nodes · x1 is '+d.rel[0]+', x2 is '+d.rel[1]+' · '+d.K+' classes';
  }
  var cand=[];for(var s=1;s<=40;s++){var d=sample(rng(s));cand.push({s:s,q:knn(d)});}
  cand.sort(function(a,b){return b.q-a.q;});var seeds=cand.slice(0,6).map(function(c){return c.s;});
  var DUR=1.125,cur=-1;
  play(root,function(t){var k=Math.floor(t/DUR)%seeds.length;tr((t%DUR)/DUR);pl.textContent='table '+(k+1)+' / '+seeds.length;if(k===cur)return;
    var first=cur===-1;cur=k;
    if(first){draw(sample(rng(seeds[k])),k);return;}
    row.style.opacity=0;cap.style.opacity=0;
    setTimeout(function(){draw(sample(rng(seeds[k])),k);row.style.opacity=1;cap.style.opacity=1;},100);});
};

/* 3. Attention cost (static): n = 10k, 100k, 1M at d = 100 */
V.cost=function(root){
  var M=100,K=128,NS_=[1e4,1e5,1e6];
  var W=1664,H=560,X0=380,X1=1340,LO=6,HI=16;
  var svg=el('svg',{width:W,height:H,viewBox:'0 0 '+W+' '+H,style:'display:block'},root);
  function sx(v){return X0+(Math.log10(v)-LO)/(HI-LO)*(X1-X0);}
  var top=20,bot=470;
  for(var e=LO;e<=HI;e+=2){el('line',{x1:sx(Math.pow(10,e)),y1:top,x2:sx(Math.pow(10,e)),y2:bot,stroke:C.grid,'stroke-width':2},svg);
    supT(txt(svg,sx(Math.pow(10,e)),bot+44,'',{'text-anchor':'middle','font-family':MONO,fill:C.muted}),'',e);}
  txt(svg,X1,bot+82,'attention pairs per layer, d = 100 features (log scale)',{'text-anchor':'end',fill:C.muted});
  txt(svg,1600,top+10,'A ÷ B',{'text-anchor':'end','font-family':MONO,fill:C.muted});
  NS_.forEach(function(n,g){var y0=top+40+g*148;
    txt(svg,X0-30,y0+58,'n = '+fmtN(n),{'text-anchor':'end','font-family':MONO,'font-size':26});
    var A=n*M*M+M*n*n,B=n*M*M+2*n*M*K+n*n;
    [[A,C.blue,'A · per-cell'],[B,C.orange,'B · rows → ICL']].forEach(function(it,k){var y=y0+k*52;
      el('rect',{x:X0,y:y,width:Math.max(2,sx(it[0])-X0),height:42,fill:it[1],rx:3},svg);
      sciT(txt(svg,sx(it[0])+14,y+31,'',{'font-family':MONO}),it[0]);
      if(g===0)txt(svg,X0+10,y+30,it[2],{fill:C.ground,'font-weight':600});});
    txt(svg,1600,y0+62,Math.round(A/B)+'×',{'text-anchor':'end','font-family':"'Space Grotesk', Arial, sans-serif",'font-size':44,'font-weight':600});});
};

document.querySelectorAll('[data-viz]').forEach(function(m){var f=V[m.getAttribute('data-viz')];if(f)f(m);});
})();
