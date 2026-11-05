(function(){
var C={ink:'#16202E',ground:'#F6F4EF',card:'#FDFCF9',line:'#D8D1C3',grid:'#E4DED2',soft:'#4A5361',muted:'#5F6672',
  orange:'#B4501F',orangeL:'#E8B796',blue:'#2F5D8A',blueL:'#9FB9D6',cell:'#E4DED2',hidden:'#CFC7B8',light:'#E08A4E'};
var SANS="'IBM Plex Sans', Arial, sans-serif", MONO="'IBM Plex Mono', 'Courier New', monospace";
var NS='http://www.w3.org/2000/svg';
function el(tag,a,p){var e=document.createElementNS(NS,tag);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,s,a){a=a||{};var t=el('text',Object.assign({x:x,y:y,'font-family':SANS,'font-size':24,fill:C.ink},a),p);t.textContent=s;return t;}
function h(tag,a,p,s){var e=document.createElement(tag);for(var k in a){if(k==='style')e.style.cssText=a[k];else e.setAttribute(k,a[k]);}if(s!=null)e.textContent=s;if(p)p.appendChild(e);return e;}
function button(p,label){var b=h('button',{type:'button',style:'font:500 24px '+SANS+';padding:10px 24px;border:2px solid '+C.ink+';border-radius:999px;background:transparent;color:'+C.ink+';cursor:pointer'},p,label);b.addEventListener('pointerup',function(){b.blur();});return b;}
function setOn(b,on){b.style.background=on?C.ink:'transparent';b.style.color=on?C.ground:C.ink;}
function slider(p,min,max,step,val,width){var s=h('input',{type:'range',min:min,max:max,step:step,value:val,style:'width:'+width+'px;height:32px;accent-color:'+C.orange+';cursor:pointer'},p);s.addEventListener('pointerup',function(){s.blur();});s.addEventListener('change',function(){s.blur();});return s;}
function rng(seed){var s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function gauss(r){var u=1-r(),v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
var SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
function sci(v){var e=Math.floor(Math.log10(v)),m=v/Math.pow(10,e);var ms=m.toFixed(1);if(ms==='10.0'){ms='1.0';e+=1;}return ms+' × 10'+String(e).split('').map(function(c){return SUP[c];}).join('');}
function supT(t,base,e){while(t.firstChild)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(base+'10'));var sp=el('tspan',{dy:-14,'font-size':'0.7em'},t);sp.textContent=String(e);}
function sciT(t,v){var e=Math.floor(Math.log10(v)),m=v/Math.pow(10,e);var ms=m.toFixed(1);if(ms==='10.0'){ms='1.0';e+=1;}supT(t,ms+' × ',e);}
function fmtN(n){return Math.round(n).toLocaleString('en-US');}
function marker(svg,id,color){var d=el('defs',{},svg);var m=el('marker',{id:id,markerUnits:'userSpaceOnUse',viewBox:'-14 -7 14 14',markerWidth:14,markerHeight:14,refX:33,refY:0,orient:'auto',overflow:'visible'},d);el('path',{d:'M-14 -7 L0 0 L-14 7 Z',fill:color},m);}

var V={};

