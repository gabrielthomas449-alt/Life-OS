(()=>{
/* ================= Icons ================= */
const P={
 today:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" stroke-width="2.6" stroke-linecap="round"/>',
 calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M9.2 10v10.5M14.8 10v10.5M3.5 15.2h17"/>',
 faith:'<path d="M12 3v18M6.5 8.5h11"/>',
 school:'<path d="M2 9.5l10-5 10 5-10 5z"/><path d="M6 11.5v4.5c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.5M22 9.5v6"/>',
 elevate:'<path d="M4 20h16M6.5 20v-5M11 20v-8.5M15.5 20v-6M20 20V5.5"/><path d="M5 11l5-4 4 3 6-6M16 4h4v4"/>',
 money:'<path d="M12 3v18M16.4 7.6c-.8-1.4-2.4-2.2-4.4-2.2-2.6 0-4.4 1.3-4.4 3.1 0 4.6 9.3 2.4 9.3 7 0 2-1.9 3.3-4.8 3.3-2.2 0-4-.9-4.9-2.4"/>',
 fitness:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.2v5.6M20.5 9.2v5.6M6.5 12h11"/>',
 people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16.2 14.1c2.7.3 4.8 2.7 4.8 5.9"/>',
 notes:'<path d="M5 3.5h10l4 4v13H5z"/><path d="M15 3.5v4h4M8.5 12h7M8.5 16h4.5"/>',
 files:'<path d="M3 7.5a2 2 0 012-2h4l2 2.2h8a2 2 0 012 2V18a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
 ai:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
 back:'<path d="M15 5l-7 7 7 7"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 close:'<path d="M6 6l12 12M18 6L6 18"/>',
 task:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
 event:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/>',
 note:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'
};
const icon=(k,w=1.7)=>`<svg viewBox="0 0 24 24" fill="none" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${P[k]}</svg>`;

const MODULES=[
 {id:'today',name:'Today'},{id:'calendar',name:'Calendar'},{id:'faith',name:'Faith'},{id:'school',name:'School'},
 {id:'elevate',name:'Elevate',full:'Elevate Systems'},{id:'money',name:'Money'},{id:'fitness',name:'Fitness'},{id:'people',name:'People'},
 {id:'notes',name:'Notes'},{id:'files',name:'Files'},{id:'ai',name:'Assistant',full:'AI Assistant'},{id:'settings',name:'Settings'}
];
const N=MODULES.length;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

/* ================= Dates ================= */
const DAYS=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>iso(new Date());
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const fromIso=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const fmtDay=s=>{if(s===today())return'Today';if(s===addDays(1))return'Tomorrow';return fromIso(s).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})};
const longDate=d=>d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
const fmtMin=m=>{let h=Math.floor(m/60),mi=m%60,ap=h>=12?'PM':'AM';h=h%12||12;return h+':'+String(mi).padStart(2,'0')+' '+ap};
const nowMin=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
function parseTime(s){
  s=s.toLowerCase();
  if(/\bnoon\b/.test(s))return 720; if(/\bmidnight\b/.test(s))return 0;
  const m=s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?(?![\d])/); if(!m)return null;
  let h=+m[1],mi=+(m[2]||0); if(h>23||mi>59)return null; const ap=m[3];
  if(ap){if(ap[0]==='p'&&h<12)h+=12;if(ap[0]==='a'&&h===12)h=0}else if(h<7)h+=12;
  return h*60+mi;
}
function parseDay(s){
  s=s.toLowerCase();
  if(/\btomorrow\b/.test(s))return addDays(1);
  if(/\b(today|tonight|this evening)\b/.test(s))return today();
  for(let i=0;i<7;i++){if(new RegExp('\\b'+DAYS[i]+'\\b').test(s)){let diff=(i-new Date().getDay()+7)%7;if(diff===0)diff=7;return addDays(diff)}}
  if(/\bnext week\b/.test(s))return addDays(7);
  return null;
}

/* ================= Data ================= */
/* ---- API layer: the server (Cloudflare D1) is the source of truth ---- */
let D={events:[],tasks:[],notes:[],habits:[],settings:{clock:true,notify:true},log:[]};
let tmp=0;const tid=()=>'tmp'+(tmp++);
async function api(path,opts={}){
  const r=await fetch('/api/'+path,{method:opts.method||'GET',headers:opts.body?{'content-type':'application/json'}:{},body:opts.body?JSON.stringify(opts.body):undefined,credentials:'same-origin'});
  let data=null;try{data=await r.json()}catch(e){}
  if(r.status===401&&!path.startsWith('auth/')){showLogin();throw new Error('auth')}
  if(!r.ok)throw new Error((data&&data.error)||'Request failed ('+r.status+')');
  return data;
}
function toast2(msg){const el=$('#toast');el.innerHTML=`<div class="src">Gabe OS</div><p>${esc(msg)}</p>`;show(el);clearTimeout(toast2.t);toast2.t=setTimeout(()=>hide(el),4000)}
const fail=e=>{if(e.message!=='auth')toast2(e.message+' Your change was not saved.');load()};
async function load(){try{D=await api('state');try{localStorage.setItem('gabeos.cache',JSON.stringify(D))}catch(e){}refresh()}catch(e){if(e.message!=='auth')console.warn(e)}}
try{const c=JSON.parse(localStorage.getItem('gabeos.cache'));if(c&&c.events)D=c}catch(e){}
// mutations: optimistic local change, then server
const db={
  addTask(t){const x={id:tid(),done:false,due:null,note:null,tag:'Personal',...t};D.tasks.push(x);created(x,api('tasks',{method:'POST',body:t}));return x},
  setTask(x,patch){Object.assign(x,patch);after(x,()=>api('tasks/'+x.id,{method:'PATCH',body:patch}))},
  delTask(x){D.tasks=D.tasks.filter(t=>t!==x);after(x,()=>api('tasks/'+x.id,{method:'DELETE'}))},
  addEvent(e){const x={id:tid(),tag:'Personal',...e};D.events.push(x);created(x,api('events',{method:'POST',body:e}));return x},
  setEvent(x,patch){Object.assign(x,patch);after(x,()=>api('events/'+x.id,{method:'PATCH',body:patch}))},
  delEvent(x){D.events=D.events.filter(e=>e!==x);after(x,()=>api('events/'+x.id,{method:'DELETE'}))},
  addNote(text){const x={id:tid(),text,at:Date.now()};D.notes.unshift(x);created(x,api('notes',{method:'POST',body:{text}}));return x},
  delNote(x){D.notes=D.notes.filter(n=>n!==x);after(x,()=>api('notes/'+x.id,{method:'DELETE'}))},
  saveSettings(){api('settings',{method:'PUT',body:D.settings}).catch(fail)},
  log(q,a){D.log.push({q,a,at:Date.now()});if(D.log.length>40)D.log.shift();api('log',{method:'POST',body:{q,a}}).catch(()=>{})}
};
// items created offline-fast get a temp id; later edits wait for the real id
const pend=new WeakMap();
function created(x,p){const q=p.then(r=>{Object.assign(x,r);const a=document.activeElement;if(!(a&&/INPUT|TEXTAREA/.test(a.tagName)))refresh()}).catch(fail);pend.set(x,q)}
function after(x,f){(pend.get(x)||Promise.resolve()).then(f).catch(fail)}
const preamble=()=>D.tasks.find(x=>/constitution preamble/i.test(x.title)&&!x.done);
const eventsOn=day=>D.events.filter(e=>e.day==='daily'||e.day===day).sort((a,b)=>a.min-b.min);
const openTasks=()=>D.tasks.filter(t=>!t.done);
const tasksToday=()=>D.tasks.filter(t=>!t.due||t.due<=today()).sort((a,b)=>a.done-b.done);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= Canvas world ================= */
const cv=$('#bg'),ctx=cv.getContext('2d');
let W=0,H=0,DPR=1;
function resize(){DPR=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR}
resize();addEventListener('resize',()=>{resize();layoutRing()});
const S={zoom:1,wave:1,rays:0,streak:0,dim:0,ox:.5,oy:.45};
const tweens=[];
const ease={in:p=>p*p*p,out:p=>1-Math.pow(1-p,3),io:p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2};
function tween(k,to,dur,e='io',delay=0){for(let i=tweens.length-1;i>=0;i--)if(tweens[i].k===k)tweens.splice(i,1);tweens.push({k,to,dur:RM?1:dur,e:ease[e],start:performance.now()+(RM?0:delay),from:null})}
const RIB=[
  {amp:.11,k1:.9,k2:1.7,s1:.22,s2:.13,ph:0,y:0,spread:.9,hue:'150,205,255',a:.07,n:42},
  {amp:.08,k1:1.2,k2:.7,s1:-.16,s2:.19,ph:2.1,y:.03,spread:.6,hue:'110,175,255',a:.06,n:34},
  {amp:.06,k1:.6,k2:2.3,s1:.12,s2:-.1,ph:4.2,y:-.02,spread:1.3,hue:'190,225,255',a:.045,n:28}
];
const motes=Array.from({length:46},(_,i)=>({x:Math.random(),y:.25+Math.random()*.45,r:.6+Math.random()*1.6,s:.004+Math.random()*.012,p:Math.random()*6}));
const hash=i=>{const x=Math.sin(i*127.1)*43758.5;return x-Math.floor(x)};

function drawBG(t){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#1a73e0');g.addColorStop(.38,'#0a43a8');g.addColorStop(.75,'#04205e');g.addColorStop(1,'#020b26');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const r=ctx.createRadialGradient(W*.5,H*.1,0,W*.5,H*.1,Math.max(W,H)*.7);
  r.addColorStop(0,'rgba(140,200,255,.35)');r.addColorStop(1,'rgba(140,200,255,0)');
  ctx.fillStyle=r;ctx.fillRect(0,0,W,H);
}
function drawWave(t){
  if(S.wave<=.01)return;
  const cx=W*S.ox,cy=H*S.oy;
  ctx.save();ctx.translate(cx,cy);ctx.scale(S.zoom,S.zoom);ctx.translate(-cx,-cy);
  ctx.globalCompositeOperation='lighter';
  const base=H*.45,step=Math.max(10,W/110);
  for(const rb of RIB){
    for(let i=0;i<rb.n;i++){
      const f=i/rb.n;
      ctx.beginPath();
      for(let x=-60;x<=W+60;x+=step){
        const u=x/W;
        const env=.55+.45*Math.sin(u*Math.PI);
        const y=base+H*rb.y
          +H*rb.amp*Math.sin(u*rb.k1*6.283+t*rb.s1+rb.ph+f*.35)*env
          +H*rb.amp*.55*Math.sin(u*rb.k2*6.283-t*rb.s2+f*.8)
          +H*.045*rb.spread*(f-.5)*Math.sin(u*3.1+t*.17+rb.ph);
        x<-50?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      const edge=1-Math.abs(f-.5)*1.6;
      ctx.strokeStyle=`rgba(${rb.hue},${(rb.a*(.4+edge)*S.wave).toFixed(3)})`;
      ctx.lineWidth=f>.48&&f<.52?1.6:1;
      ctx.stroke();
    }
  }
  for(const m of motes){
    const x=((m.x+t*m.s*.2)%1)*W,y=H*m.y+Math.sin(t*.6+m.p)*14;
    ctx.fillStyle=`rgba(220,240,255,${(.18+.25*Math.sin(t*1.3+m.p)**2)*S.wave})`;
    ctx.beginPath();ctx.arc(x,y,m.r,0,6.283);ctx.fill();
  }
  ctx.restore();
}
function drawRays(t){
  if(S.rays<=.01)return;
  const cx=W*.5,cy=H*.44,R=Math.hypot(W,H)*.75;
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<90;i++){
    const a=i/90*6.283+t*.015+hash(i)*.05,l=R*(.3+.7*hash(i+9)),r0=40+hash(i+3)*80;
    const gr=ctx.createLinearGradient(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0,cx+Math.cos(a)*l,cy+Math.sin(a)*l);
    gr.addColorStop(0,`rgba(140,200,255,${.16*S.rays*(.3+hash(i+5))})`);gr.addColorStop(1,'rgba(140,200,255,0)');
    ctx.strokeStyle=gr;ctx.lineWidth=.6+hash(i+7)*2.2;
    ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);ctx.lineTo(cx+Math.cos(a)*l,cy+Math.sin(a)*l);ctx.stroke();
  }
  const fl=ctx.createRadialGradient(cx,H*.82,0,cx,H*.82,W*.6);
  fl.addColorStop(0,`rgba(70,150,255,${.4*S.rays})`);fl.addColorStop(1,'rgba(70,150,255,0)');
  ctx.fillStyle=fl;ctx.fillRect(0,H*.45,W,H*.55);
  ctx.fillStyle=`rgba(170,215,255,${.25*S.rays})`;ctx.fillRect(0,H*.44+70,W,1);
  ctx.restore();
}
function drawStreak(){
  if(S.streak<=.01)return;
  const cx=W*S.ox,cy=H*S.oy,R=Math.hypot(W,H);
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<140;i++){
    const a=hash(i)*6.283,r0=R*(.05+hash(i+1)*.3)*(1-S.streak*.5),len=R*(.15+hash(i+2)*.6)*S.streak;
    ctx.strokeStyle=`rgba(200,230,255,${.35*S.streak*hash(i+4)})`;ctx.lineWidth=.5+hash(i+6)*1.8;
    ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);ctx.lineTo(cx+Math.cos(a)*(r0+len),cy+Math.sin(a)*(r0+len));ctx.stroke();
  }
  const fl=ctx.createRadialGradient(cx,cy,0,cx,cy,R*.5);
  fl.addColorStop(0,`rgba(210,235,255,${.55*S.streak*S.streak})`);fl.addColorStop(1,'rgba(210,235,255,0)');
  ctx.fillStyle=fl;ctx.fillRect(0,0,W,H);
  ctx.restore();
}

/* ================= Carousel ================= */
const ring=$('#ring'),stage=$('#stage');
ring.innerHTML=MODULES.map((m,i)=>`<button class="mod" data-i="${i}" aria-label="${esc(m.full||m.name)}" tabindex="-1">${icon(m.id,1.6)}<span>${esc(m.name)}</span></button>`).join('');
const tiles=[...ring.children];
let pos=0,vel=0,snap=null,drag=null,lastSel=-1;
const wrapD=d=>((d%N)+N*1.5)%N-N/2;
const selIdx=()=>((Math.round(pos)%N)+N)%N;
function layoutRing(){
  const R=Math.min(innerWidth*.64,780),Dz=Math.min(innerWidth*.5,460),step=6.283/N;
  tiles.forEach((el,i)=>{
    const d=wrapD(i-pos),a=d*step,ad=Math.abs(d);
    if(ad>3.6){el.style.opacity=0;el.style.visibility='hidden';return}
    el.style.visibility='visible';
    const s=Math.max(0,1-ad*1.6);
    const x=Math.sin(a)*R,z=-Dz*(1-Math.cos(a))+s*90,ry=-a*.55*57.3;
    el.style.transform=`translate3d(${x.toFixed(1)}px,${(-s*6).toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg)`;
    el.style.opacity=Math.min(1,Math.max(0,3.6-ad)).toFixed(2);
    el.style.setProperty('--s',s.toFixed(3));
    el.style.zIndex=100-Math.round(ad*10);
  });
  const si=selIdx();
  if(si!==lastSel){lastSel=si;const m=MODULES[si];$('#selName').textContent=m.full||m.name;$('#selSub').textContent=subFor(m.id)}
}
function subFor(id){
  const ev=eventsOn(today()),nm=nowMin(),next=ev.find(e=>e.min>=nm);
  switch(id){
    case'today':return next?`Next: ${next.title} at ${fmtMin(next.min)}`:'Nothing else scheduled today';
    case'calendar':return `${ev.length} events today`;
    case'faith':{const n=openTasks().filter(t=>t.tag==='Faith').length;return n?`${n} reading${n>1?'s':''} open`:'All readings done'}
    case'school':{const n=openTasks().filter(t=>t.tag==='School').length;return `${n} assignment${n===1?'':'s'} open`}
    case'elevate':return 'Projects and follow-ups';
    case'money':return 'Budget overview';
    case'fitness':return 'Workout streak and plan';
    case'people':return 'Contacts and follow-ups';
    case'notes':return `${D.notes.length} note${D.notes.length===1?'':'s'}`;
    case'files':return 'Recent documents';
    case'ai':return 'Conversation history';
    case'settings':return 'Ambient and notifications';
  }
}
function goTo(i){const base=snap??Math.round(pos);snap=base+wrapD(i-base);vel=0}
function nudge(n){snap=(snap??Math.round(pos))+n;vel=0}
const unit=()=>Math.min(innerWidth*.64,780)*.5;
stage.addEventListener('pointerdown',e=>{if(busy)return;drag={x:e.clientX,p:pos,lx:e.clientX,lt:performance.now(),moved:0,el:e.target.closest('.mod')};vel=0;snap=null;stage.setPointerCapture(e.pointerId)});
stage.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;drag.moved=Math.max(drag.moved,Math.abs(dx));pos=drag.p-dx/unit();const now=performance.now(),dt=Math.max(1,now-drag.lt);vel=-(e.clientX-drag.lx)/unit()/dt*16;drag.lx=e.clientX;drag.lt=now});
const endDrag=e=>{if(!drag)return;const d=drag;drag=null;
  if(d.moved<6){vel=0;if(d.el){const i=+d.el.dataset.i;i===selIdx()?enter(MODULES[i].id):goTo(i)}else snap=Math.round(pos)}
  else if(Math.abs(vel)<.01)snap=Math.round(pos)};
stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
let wheelT;stage.addEventListener('wheel',e=>{e.preventDefault();if(busy)return;snap=null;vel=0;pos+=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)/260;clearTimeout(wheelT);wheelT=setTimeout(()=>snap=Math.round(pos),130)},{passive:false});
function physics(){
  if(drag)return;
  if(snap!==null){pos+=(snap-pos)*(RM?1:.16);if(Math.abs(snap-pos)<.001){pos=snap;snap=null}}
  else if(Math.abs(vel)>.003){pos+=vel;vel*=.93}
  else if(Math.abs(pos-Math.round(pos))>.001)snap=Math.round(pos);
}

/* ================= Mode machine ================= */
let mode='ambient',busy=false,current='today';
const show=(el,cls)=>{el.hidden=false;if(cls){el.classList.remove('arrive','arrive-back','leave-in','leave-out','ws-arrive');void el.offsetWidth;el.classList.add(cls)}};
const hide=el=>{el.hidden=true;el.classList.remove('arrive','arrive-back','leave-in','leave-out','ws-arrive')};
const later=(ms,f)=>setTimeout(f,RM?0:ms);

function dive(ox=.5,oy=.45){
  if(busy||mode!=='ambient')return;
  if(!AUTH.ok){showLogin();return}
  busy=true;
  S.ox=ox;S.oy=oy;
  tween('zoom',9,620,'in');tween('streak',1,520,'in');
  $('#ambient').style.opacity=0;$('#ambient').style.transition='opacity .3s';
  later(560,()=>{
    hide($('#ambient'));
    S.zoom=1;S.oy=.36;S.wave=0;
    tween('wave',.2,700,'out');tween('rays',1,700,'out');tween('streak',0,500,'out');
    mode='menu';layoutRing();show($('#menu'),'arrive');show($('#dock'));
    later(500,()=>{busy=false;maybeToast()});
  });
}
function toAmbient(){
  if(busy||mode!=='menu')return;busy=true;
  closeConsole();$('#ask').blur();
  show($('#menu'),'leave-out');hide($('#dock'));hide($('#toast'));
  S.ox=.5;S.oy=.45;S.zoom=3.2;S.wave=.2;
  tween('zoom',1,900,'out');tween('wave',1,900,'out');tween('rays',0,500,'out');
  later(380,()=>{hide($('#menu'));mode='ambient';const a=$('#ambient');a.hidden=false;a.style.opacity=1;busy=false;updateAmbient()});
}
function enter(id){
  if(busy)return;
  if(mode==='module'){current=id;renderWS(true);return}
  busy=true;current=id;
  S.ox=.5;S.oy=.44;
  show($('#menu'),'leave-in');tween('streak',.8,380,'in');tween('rays',.35,600,'out');tween('wave',.12,600);
  later(360,()=>{
    hide($('#menu'));mode='module';renderWS();show($('#ws'),'ws-arrive');$('#ws').scrollTop=0;
    tween('streak',0,480,'out');
    later(420,()=>busy=false);
  });
}
function backToMenu(){
  if(busy||mode!=='module')return;busy=true;
  show($('#ws'),'leave-out');tween('rays',1,600,'out');tween('wave',.2,600);
  const i=MODULES.findIndex(m=>m.id===current);pos=i;snap=null;vel=0;
  later(300,()=>{hide($('#ws'));mode='menu';layoutRing();show($('#menu'),'arrive-back');later(450,()=>busy=false)});
}

$('#ambient').addEventListener('click',e=>dive(e.clientX/innerWidth,e.clientY/innerHeight));
$('#ambient').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();dive()}});
addEventListener('keydown',e=>{
  const typing=document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName);
  if(e.key==='Escape'){
    if(typing){document.activeElement.blur();closeConsole();return}
    if(!$('#console').hidden){closeConsole();return}
    if(mode==='module')backToMenu();else if(mode==='menu')toAmbient();return;
  }
  if(typing)return;
  if(mode==='ambient'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();dive();return}
  if(mode==='menu'){
    if(e.key==='ArrowRight'){nudge(1)}else if(e.key==='ArrowLeft'){nudge(-1)}
    else if(e.key==='Enter'){enter(MODULES[selIdx()].id)}
  }
  if(e.key==='/'&&mode!=='ambient'){e.preventDefault();$('#ask').focus()}
});

/* ================= Workspace ================= */
const rail=$('#rail');
rail.innerHTML=`<button class="back" data-back aria-label="Back to modules">${icon('back',2)}<span>Modules</span></button>`+MODULES.map(m=>`<button data-mod="${m.id}">${icon(m.id)}<span>${esc(m.full||m.name)}</span></button>`).join('');
rail.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.back!==undefined)backToMenu();else if(b.dataset.mod&&b.dataset.mod!==current)enter(b.dataset.mod)});

const panel=(title,body,w='w3',extra='')=>`<section class="panel ${w}"><h2>${title}${extra?`<small>${extra}</small>`:''}</h2>${body}</section>`;
function schedList(evs,{live=true}={}){
  if(!evs.length)return'<p class="empty">Nothing scheduled.</p>';
  const nm=nowMin();let nextMarked=false;
  return '<ul class="sched">'+evs.map(e=>{
    let cls='',chip='';
    if(live){
      if(e.min<=nm&&nm<e.min+60){cls='now';chip='<span class="pill now">Now</span>'}
      else if(e.min+60<=nm)cls='past';
      else if(!nextMarked){nextMarked=true;chip='<span class="pill next">Next</span>'}
    }
    return `<li class="${cls}" data-ev="${e.id}"><span class="tm">${fmtMin(e.min)}</span><span class="dot"></span><span>${esc(e.title)}</span>${chip}</li>`}).join('')+'</ul>';
}
function taskList(ts){
  if(!ts.length)return'<p class="empty">All clear.</p>';
  return '<ul class="tasks">'+ts.map(t=>`<li class="${t.done?'done':''}" data-task="${t.id}"><button class="check" data-toggle="${t.id}" aria-label="${t.done?'Mark not done':'Mark done'}: ${esc(t.title)}">${icon('check',3)}</button><span class="tt">${esc(t.title)}${t.note?`<small>${esc(t.note)}</small>`:(t.due&&t.due!==today()?`<small>Due ${fmtDay(t.due)}</small>`:'')}</span><span class="tag ${t.tag}">${t.tag}</span><button class="del" data-del-task="${t.id}" aria-label="Delete ${esc(t.title)}">${icon('close',2)}</button></li>`).join('')+'</ul>';
}
const bars=hs=>'<div class="bars">'+hs.map(h=>`<div class="bar-row"><span>${esc(h.name)}${h.sub?` <small style="color:var(--muted)">${h.sub}</small>`:''}</span><b>${h.v}%</b><div class="track"><i class="${h.kind||''}" style="width:${h.v}%"></i></div></div>`).join('')+'</div>';
const evRows=(evs,withDay)=>evs.length?'<ul class="rows">'+evs.map(e=>`<li><span>${esc(e.title)}</span><span class="v">${withDay?fmtDay(e.day)+', ':''}${fmtMin(e.min)} <button class="del" data-del-ev="${e.id}" aria-label="Delete ${esc(e.title)}">${icon('close',2)}</button></span></li>`).join('')+'</ul>':'<p class="empty">Nothing yet. Try “Add dentist Tuesday at 3pm”.</p>';
const rows=items=>'<ul class="rows">'+items.map(([a,b])=>`<li><span>${a}</span><span class="v">${b}</span></li>`).join('')+'</ul>';
const notesBlock=(n=3)=>`<input class="field" id="quickNote" placeholder="Take a quick note, press Enter" aria-label="Quick note"><ul class="notes">${D.notes.slice(0,n).map(x=>`<li><button class="del" data-del-note="${x.id}" aria-label="Delete note">${icon('close',2)}</button>${esc(x.text)}<small>${new Date(x.at).toLocaleString(undefined,{weekday:'short',hour:'numeric',minute:'2-digit'})}</small></li>`).join('')}</ul>`;
const notifBlock=()=>{
  const t=preamble();
  if(!t||!D.settings.notify)return'<p class="empty">Nothing needs your attention.</p>';
  return `<div class="notif"><div class="n"><b>Constitution Preamble</b><span>Review scheduled for tonight.</span><div class="btns"><button class="btn primary" data-n="review">Review</button><button class="btn" data-n="done">Done</button><button class="btn" data-n="snooze">Snooze</button></div></div></div>`;
};
const quick=()=>`<div class="actions">
  <button class="act" data-fill="Remind me to "><i>${icon('task')}</i>New task</button>
  <button class="act" data-fill="Add "><i>${icon('event')}</i>New event</button>
  <button class="act" data-fill="Remember that "><i>${icon('note')}</i>Add note</button>
  <button class="act ai" data-fill=""><i>${icon('ai')}</i>Ask AI</button></div>`;

const VIEWS={
  today:()=>({sub:longDate(new Date()),html:
    panel('Upcoming',schedList(eventsOn(today())),'w3',fmtDay(today()))+
    panel('Tasks',taskList(tasksToday()),'w3',`${tasksToday().filter(t=>!t.done).length} open`)+
    panel('Habits',bars(D.habits),'w2','This week')+
    panel('Notes',notesBlock(2),'w2')+
    panel('Quick actions',quick(),'w2')+
    panel('Needs attention',notifBlock(),'w6')}),
  calendar:()=>{let h='';for(let i=0;i<7;i++){const d=addDays(i),ev=i===0?eventsOn(d):D.events.filter(e=>e.day===d).sort((a,b)=>a.min-b.min);h+=`<div class="day-h">${fmtDay(d)}</div>`+(i===0?schedList(ev):ev.length?schedList(ev,{live:false}):'<p class="empty">Daily routine only</p>')}
    const daily=D.events.filter(e=>e.day==='daily').sort((a,b)=>a.min-b.min);
    return{sub:'Next 7 days',html:panel('Week',h,'w4')+panel('Daily routine',evRows(daily),'w2','Repeats every day')+panel('Coming up',evRows(D.events.filter(e=>e.day!=='daily'&&e.day>=today()).sort((a,b)=>a.day.localeCompare(b.day)||a.min-b.min),true),'w6','One-time events')}},
  faith:()=>({sub:'Reading and devotion',html:panel('Today',taskList(D.tasks.filter(t=>t.tag==='Faith')),'w3')+panel('Reading plan',rows([['Genesis 4','Today'],['Genesis 5','Tomorrow'],['1 Peter 1:3–9','Devotion'],['1 Peter 1:10–21','Next']]),'w3','Sample plan')+panel('Bible time',bars([D.habits[0]]),'w3','This week')+panel('Mentor group',schedList(eventsOn(today()).filter(e=>/mentor/i.test(e.title)),{live:true}),'w3')}),
  school:()=>({sub:'Classes and assignments',html:panel('Assignments',taskList(D.tasks.filter(t=>t.tag==='School').sort((a,b)=>a.done-b.done||(a.due||'').localeCompare(b.due||''))),'w4')+panel('Class today',schedList(eventsOn(today()).filter(e=>e.tag==='School')),'w2')}),
  elevate:()=>({sample:true,sub:'elevatesystems.us',html:panel('Follow-ups',taskList(D.tasks.filter(t=>t.tag==='Elevate')),'w3')+panel('Projects',rows([['Website refresh','In progress'],['Client onboarding flow','Planning'],['Monthly report template','Done']]),'w3','Sample')+panel('Ask about this business','<div class="sugg"><button data-ask="Show me everything related to Elevate Systems">Show everything related to Elevate Systems</button><button data-fill="Remind me to ">Add an Elevate follow-up</button></div>','w6')}),
  money:()=>({sample:true,sub:'October',html:panel('Spending this month','<div class="big">$412</div><p class="empty">of $650 budget</p>'+bars([{name:'Food',v:58},{name:'Transport',v:34},{name:'Subscriptions',v:81,kind:'warn'}]),'w3','Sample')+panel('Upcoming',rows([['Phone bill','Oct 28'],['Gym membership','Nov 1'],['Savings transfer','Nov 1']]),'w3','Sample')}),
  fitness:()=>({sample:true,sub:'Training',html:panel('Today',schedList(eventsOn(today()).filter(e=>e.tag==='Fitness')),'w3')+panel('This week',bars([{name:'Workout',v:100,kind:'ok'},{name:'Cardio minutes',v:64},{name:'Sleep goal',v:72}]),'w3','Sample')}),
  people:()=>{const ppl=[['Hannah','Follow up'],['John','Lunch'],['Mentor group','Thursdays 7 PM']];
    return{sub:'Contacts and follow-ups',html:panel('Follow-ups',taskList(D.tasks.filter(t=>t.tag==='People')),'w3')+panel('People',rows(ppl.map(([a,b])=>[a,b])),'w3')}},
  notes:()=>({sub:`${D.notes.length} notes`,html:panel('All notes',notesBlock(50),'w6')}),
  files:()=>({sample:true,sub:'Recent',html:panel('Recent files',rows([['Constitution Preamble.pdf','School'],['Genesis study notes.docx','Faith'],['Elevate proposal draft.docx','Elevate'],['Workout plan.xlsx','Fitness']]),'w6','Sample')}),
  ai:()=>({sub:'Every request is routed to the system that handles it',html:panel('Conversation',D.log.length?'<div class="chat">'+D.log.slice(-12).map(l=>`<div class="u">${esc(l.q)}</div><div class="a">${l.a}</div>`).join('')+'</div>':'<p class="empty">No requests yet. Try one of these:</p>'+suggHTML(),'w4')+panel('Tools the assistant can use',rows([['calendar','list, create, move'],['tasks','create, complete, list'],['reminders','create'],['notes','create, search'],['search','across everything'],['navigate','open any module']]),'w2')}),
  settings:()=>({sub:'Phase 1',html:panel('Ambient mode',`<ul class="rows"><li><span>Show clock</span><button class="toggle" role="switch" aria-checked="${D.settings.clock}" data-set="clock" aria-label="Show clock"></button></li><li><span>Notifications</span><button class="toggle" role="switch" aria-checked="${D.settings.notify}" data-set="notify" aria-label="Notifications"></button></li></ul>`,'w3')+panel('Account',`<p class="empty">Your data is saved to your own database and syncs across every device you sign in on.</p><div class="btns"><button class="btn" id="logout">Sign out on this device</button></div>`,'w3')})
};
function renderWS(swap){
  const m=MODULES.find(x=>x.id===current),v=VIEWS[current]();
  $('#wsIcon').innerHTML=icon(current,1.7);$('#wsTitle').textContent=m.full||m.name;$('#wsSub').textContent=v.sub||'';
  $('#wsSample').hidden=!v.sample;
  $('#grid').innerHTML=v.html;
  rail.querySelectorAll('[data-mod]').forEach(b=>b.setAttribute('aria-current',b.dataset.mod===current));
  if(swap){const g=$('#grid');g.classList.remove('ws-arrive');void g.offsetWidth;g.classList.add('ws-arrive');$('#ws').scrollTop=0}
}
const refresh=()=>{if(mode==='module')renderWS();lastSel=-1;if(mode==='menu')layoutRing();updateAmbient()};

$('#ws').addEventListener('click',e=>{
  const t=e.target.closest('[data-toggle]');
  if(t){const k=D.tasks.find(x=>x.id===t.dataset.toggle);if(k){db.setTask(k,{done:!k.done});refresh()}return}
  const f=e.target.closest('[data-fill]');if(f){fillAsk(f.dataset.fill);return}
  const a=e.target.closest('[data-ask]');if(a){runAsk(a.dataset.ask);return}
  const n=e.target.closest('[data-n]');if(n){notifAction(n.dataset.n);return}
  const s=e.target.closest('[data-set]');if(s){D.settings[s.dataset.set]=!D.settings[s.dataset.set];db.saveSettings();refresh();return}
  const dt=e.target.closest('[data-del-task]');if(dt){const k=D.tasks.find(x=>x.id===dt.dataset.delTask);if(k){db.delTask(k);refresh()}return}
  const de=e.target.closest('[data-del-ev]');if(de){const k=D.events.find(x=>x.id===de.dataset.delEv);if(k){db.delEvent(k);refresh()}return}
  const dn=e.target.closest('[data-del-note]');if(dn){const k=D.notes.find(x=>x.id===dn.dataset.delNote);if(k){db.delNote(k);refresh()}return}
  if(e.target.id==='logout'){api('auth/logout',{method:'POST'}).finally(()=>{try{localStorage.removeItem('gabeos.cache')}catch(x){}location.reload()})}
});
$('#ws').addEventListener('keydown',e=>{if(e.target.id==='quickNote'&&e.key==='Enter'&&e.target.value.trim()){db.addNote(e.target.value.trim());renderWS();const q=$('#quickNote');q&&q.focus()}});

/* ================= Notifications ================= */
let toastShown=false,snoozeT;
function maybeToast(){
  if(toastShown||!D.settings.notify)return;const t=preamble();if(!t)return;
  toastShown=true;later(900,()=>{if(mode==='ambient')return;const el=$('#toast');
    el.innerHTML=`<div class="src"><span class="pulse"></span>Gabe OS</div><b>Constitution Preamble</b><p>Review scheduled for tonight.</p><div class="btns"><button class="btn primary" data-n="review">Review</button><button class="btn" data-n="done">Done</button><button class="btn" data-n="snooze">Snooze</button></div>`;
    show(el)});
}
$('#toast').addEventListener('click',e=>{const b=e.target.closest('[data-n]');if(b)notifAction(b.dataset.n)});
function notifAction(a){
  hide($('#toast'));const t=preamble();
  if(a==='done'&&t){db.setTask(t,{done:true});refresh()}
  if(a==='snooze'){clearTimeout(snoozeT);snoozeT=setTimeout(()=>{toastShown=false;maybeToast()},60000)}
  if(a==='review'){current='today';if(mode==='menu')enter('today');else renderWS(true);setTimeout(()=>{const p=D.tasks.find(x=>/constitution preamble/i.test(x.title)),li=p&&document.querySelector(`[data-task="${p.id}"]`);li&&li.classList.add('flash')},RM?50:650)}
}

/* ================= Assistant / tool router ================= */
const ask=$('#ask'),con=$('#console');
const SUGG=['What’s my schedule today?','Remind me to review the Constitution tomorrow','Add lunch with John Friday at noon','Move my workout to 6 AM','What homework do I still have?','Remember that I need to talk to Hannah','Show me everything related to Elevate Systems'];
const suggHTML=()=>'<div class="sugg">'+SUGG.map(s=>`<button data-ask="${esc(s)}">${esc(s)}</button>`).join('')+'</div>';
function fillAsk(s){ask.value=s;ask.focus();ask.setSelectionRange(s.length,s.length)}
function closeConsole(){con.hidden=true}
ask.addEventListener('focus',()=>{if(!ask.value&&con.hidden){con.innerHTML=`<button class="c-close" data-close aria-label="Close">${icon('close',2)}</button><div class="c-label">Try asking</div>${suggHTML()}`;con.hidden=false}});
con.addEventListener('mousedown',e=>e.preventDefault());
con.addEventListener('click',e=>{if(e.target.closest('[data-close]')){closeConsole();return}const a=e.target.closest('[data-ask]');if(a){runAsk(a.dataset.ask);return}const o=e.target.closest('[data-open]');if(o){closeConsole();enter(o.dataset.open)}});
$('#dock').addEventListener('submit',e=>{e.preventDefault();const q=ask.value.trim();if(q)runAsk(q)});
$('#grid').addEventListener('click',e=>{});

const TAGS=[[/\b(constitution|homework|class|essay|civics|study|exam|quiz|assignment|reading for)\b/i,'School'],[/\b(genesis|peter|bible|pray|prayer|devotion|church|scripture|mentor)\b/i,'Faith'],[/\b(elevate|client|proposal|invoice|website|business)\b/i,'Elevate'],[/\b(gym|workout|run|bike|lift|cardio)\b/i,'Fitness'],[/\b(hannah|john|call|text|follow up|talk to|meet)\b/i,'People']];
const guessTag=s=>{for(const[r,t]of TAGS)if(r.test(s))return t;return'Personal'};
const ALIAS={workout:'gym',gym:'gym',lift:'gym',breakfast:'breakfast',class:'class',lunch:'lunch',bike:'bike',ride:'bike',mentor:'mentor'};
const call=(fn,args)=>`<code>${fn}(${esc(JSON.stringify(args))})</code>`;
const cleanTitle=s=>cap(s.replace(/\s+/g,' ').replace(/[.!?]+$/,'').trim());

function route(qRaw){
  const q=qRaw.trim(),l=q.toLowerCase();
  let m;
  // navigation
  if((m=l.match(/^(?:open|go to|show)\s+(?:my\s+|the\s+)?(\w[\w ]*?)(?:\s+module)?$/))){
    const mod=MODULES.find(x=>m[1].includes(x.id)||m[1].includes(x.name.toLowerCase())||(x.full&&m[1].includes(x.full.toLowerCase())));
    if(mod)return{a:`Opening ${esc(mod.full||mod.name)}.`,calls:[call('navigate.open',{module:mod.id})],go:mod.id};
  }
  // schedule
  if(/\b(schedule|calendar|agenda)\b/.test(l)&&/\b(what|show|today|tomorrow|my)\b/.test(l)&&!/^(add|move|schedule\s+\w+\s)/.test(l)){
    const day=parseDay(l)||today(),ev=day===today()?eventsOn(day):eventsOn(day);
    const nm=nowMin(),list=ev.map(e=>`<li>${fmtMin(e.min)} — ${esc(e.title)}${day===today()&&e.min+60<=nm?' <span style="color:var(--muted)">(done)</span>':''}</li>`).join('');
    const next=day===today()?ev.find(e=>e.min>=nm):null;
    return{a:`${fmtDay(day)} you have ${ev.length} event${ev.length===1?'':'s'}${next?`. Next up is <b>${esc(next.title)}</b> at ${fmtMin(next.min)}`:''}.<ul>${list}</ul>`,calls:[call('calendar.list_events',{date:day})],openLink:'calendar'};
  }
  // move event
  if((m=l.match(/^(?:move|reschedule|push|shift|change)\s+(?:my\s+|the\s+)?(.+?)\s+(?:to|at)\s+(.+)$/))){
    const key=m[1].replace(/\b(today|tomorrow)\b/,'').trim(),k=ALIAS[key.split(' ')[0]]||key;
    const ev=D.events.find(e=>e.title.toLowerCase().includes(k));const t=parseTime(m[2]);
    if(ev&&t!==null){const old=ev.min;db.setEvent(ev,{min:t});refresh();
      return{a:`Moved <b>${esc(ev.title)}</b> from ${fmtMin(old)} to ${fmtMin(t)}${ev.day==='daily'?' (daily routine)':''}.`,calls:[call('calendar.find_event',{query:key}),call('calendar.update_event',{id:ev.id,start:fmtMin(t)})],flash:ev.id,openLink:'today'}}
    if(!ev)return{a:`I couldn't find an event called “${esc(key)}”. Your events today are ${eventsOn(today()).map(e=>esc(e.title)).join(', ')}.`,calls:[call('calendar.find_event',{query:key})]};
  }
  // add event
  if((m=q.match(/^(?:add|schedule|book|put)\s+(.+)$/i))&&(parseTime(m[1])!==null||parseDay(m[1]))){
    let rest=m[1];const day=parseDay(rest)||today();const t=parseTime(rest);
    let title=rest.replace(/\b(on\s+)?(this\s+|next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|tonight)\b/ig,'')
      .replace(/\b(at|@)\s*(noon|midnight|\d{1,2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)?)/ig,'').replace(/\b(noon|midnight)\b/ig,'')
      .replace(/\b(to|on|in)\s+(my\s+)?calendar\b/ig,'').replace(/\s+(on|at|for)\s*$/i,'');
    title=cleanTitle(title)||'New event';
    const ev=db.addEvent({title,min:t??720,day,tag:guessTag(title)});refresh();
    return{a:`Added <b>${esc(title)}</b> on ${fmtDay(day)} at ${fmtMin(ev.min)}.${t===null?' I put it at noon since no time was given.':''}`,calls:[call('calendar.create_event',{title,date:day,start:fmtMin(ev.min)})],openLink:'calendar'};
  }
  // reminder
  if((m=q.match(/^(?:remind me to|remind me|reminder to|add a task to|todo:?|to do:?)\s+(.+)$/i))){
    let rest=m[1];const day=parseDay(rest);const t=parseTime(rest.replace(/\b\d+(st|nd|rd|th)\b/g,''));const tonight=/\btonight\b/i.test(rest);
    let title=cleanTitle(rest.replace(/\b(on\s+)?(this\s+|next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|tonight|next week)\b/ig,'').replace(/\b(at|@)\s*(noon|\d{1,2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)?)/ig,''));
    const when=tonight?'Tonight':t!==null?`${fmtDay(day||today())}, ${fmtMin(t)}`:null;
    const task=db.addTask({title,tag:guessTag(title),due:day||today(),note:when?`Reminder: ${when}`:null});refresh();
    return{a:`Reminder set: <b>${esc(title)}</b>, ${when||fmtDay(task.due)}. Filed under ${task.tag}.`,calls:[call('tasks.create',{title,tag:task.tag,due:task.due}),call('reminders.create',{task:task.id,when:when||task.due+' 8:00 AM'})],openLink:task.due===today()?'today':(task.tag==='School'?'school':'calendar')};
  }
  // homework
  if(/\b(homework|assignments?|school work|due)\b/.test(l)){
    const ts=openTasks().filter(t=>t.tag==='School').sort((a,b)=>(a.due||'').localeCompare(b.due||''));
    return{a:ts.length?`You have ${ts.length} open:<ul>${ts.map(t=>`<li>${esc(t.title)} <span style="color:var(--muted)">— ${t.due?fmtDay(t.due):'no date'}</span></li>`).join('')}</ul>`:'No open homework. Nice.',calls:[call('school.list_assignments',{status:'open'})],openLink:'school'};
  }
  // note
  if((m=q.match(/^(?:remember(?: that)?|note(?: that)?|make a note(?: that)?|jot down)\s+(.+)$/i))){
    const text=cap(m[1].replace(/^i\b/,'I').trim());db.addNote(text);
    const person=(text.match(/\b(Hannah|John)\b/i)||[])[1];let extra='',calls=[call('notes.create',{text})];
    if(person&&/\b(talk|call|text|follow|ask|meet)\b/i.test(text)&&!D.tasks.some(t=>!t.done&&t.title.toLowerCase().includes(person.toLowerCase()))){
      db.addTask({title:`Talk to ${cap(person.toLowerCase())}`,tag:'People',due:today()});extra=` I also added a follow-up with ${cap(person.toLowerCase())} to today.`;calls.push(call('tasks.create',{title:`Talk to ${cap(person.toLowerCase())}`,tag:'People'}))}
    else if(person)extra=` It's linked to ${cap(person.toLowerCase())} in People.`;
    refresh();
    return{a:`Saved to Notes.${extra}`,calls,openLink:'notes'};
  }
  // complete
  if((m=l.match(/^(?:i\s+)?(?:finished|completed|done with|mark|check off)\s+(.+?)(?:\s+(?:as\s+)?done)?$/))){
    const t=openTasks().find(x=>x.title.toLowerCase().includes(m[1].replace(/^(the|my)\s+/,'')));
    if(t){db.setTask(t,{done:true});refresh();return{a:`Checked off <b>${esc(t.title)}</b>.`,calls:[call('tasks.complete',{id:t.id})]}}
  }
  // search
  if((m=l.match(/(?:everything|anything|all)\s+(?:related to|about|for|on)\s+(.+)$/))||(m=l.match(/^(?:search|find|look up)\s+(?:for\s+)?(.+)$/))){
    const term=m[1].replace(/[?.!]$/,'').replace(/\s+systems?$/,'').trim();const tl=term.toLowerCase();
    const ht=D.tasks.filter(t=>t.title.toLowerCase().includes(tl)||t.tag.toLowerCase()===tl);
    const he=D.events.filter(e=>e.title.toLowerCase().includes(tl)||e.tag.toLowerCase()===tl);
    const hn=D.notes.filter(n=>n.text.toLowerCase().includes(tl));
    const mod=MODULES.find(x=>x.id===tl||x.name.toLowerCase()===tl);
    const parts=[];
    if(ht.length)parts.push(`<b>Tasks</b><ul>${ht.map(t=>`<li>${esc(t.title)}${t.done?' (done)':''}</li>`).join('')}</ul>`);
    if(he.length)parts.push(`<b>Events</b><ul>${he.map(e=>`<li>${esc(e.title)} — ${e.day==='daily'?'daily':fmtDay(e.day)}, ${fmtMin(e.min)}</li>`).join('')}</ul>`);
    if(hn.length)parts.push(`<b>Notes</b><ul>${hn.map(n=>`<li>${esc(n.text)}</li>`).join('')}</ul>`);
    return{a:(parts.length?parts.join(''):`Nothing in tasks, events or notes mentions “${esc(term)}” yet.`)+(mod?`<p style="margin:8px 0 0"><button class="link" data-open="${mod.id}">Open ${esc(mod.full||mod.name)}</button></p>`:''),calls:[call('search.query',{q:term,scopes:['tasks','calendar','notes']})]};
  }
  return{a:`I can't route that one yet. In this prototype I handle schedules, reminders, events, notes, homework and search.`,calls:[call('router.no_match',{text:q})],sugg:true};
}
function runAsk(q){
  ask.value='';
  const r=route(q);
  db.log(q,r.a);
  con.innerHTML=`<button class="c-close" data-close aria-label="Close">${icon('close',2)}</button><div class="c-q">${esc(q)}</div><div class="c-a">${r.a}</div>${r.sugg?suggHTML():''}<div class="route">${r.calls.join('')}</div>${r.openLink&&!(mode==='module'&&current===r.openLink)?`<p style="margin:10px 0 0"><button class="link" data-open="${r.openLink}">Open ${esc((MODULES.find(x=>x.id===r.openLink).full)||MODULES.find(x=>x.id===r.openLink).name)}</button></p>`:''}`;
  con.hidden=false;
  if(r.go){closeConsole();enter(r.go)}
  if(r.flash)setTimeout(()=>{const li=document.querySelector(`[data-ev="${r.flash}"]`);li&&li.classList.add('flash')},60);
  if(mode==='module'&&current==='ai')renderWS();
}

/* ================= Clock + loop ================= */
function updateAmbient(){
  const d=new Date();
  $('#ambTime').textContent=d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}).replace(/\s?[AP]M$/i,'');
  $('#ambDate').textContent=longDate(d);
  $('#menuClock').textContent=d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})+'  ·  '+d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
  $('#ambInfo').style.opacity=D.settings.clock?1:0;
  const pending=D.settings.notify&&!!preamble();
  $('#ambNote').style.opacity=pending?1:0;
}
updateAmbient();setInterval(updateAmbient,15000);

/* ================= Sign-in ================= */
const AUTH={ok:false,setup:true};
const login=$('#login'),lf=$('#loginForm'),lp=$('#passcode'),lmsg=$('#loginMsg');
function showLogin(){
  AUTH.ok=false;
  $('#loginTitle').textContent=AUTH.setup?'Welcome back':'Create your passcode';
  $('#loginSub').textContent=AUTH.setup?'Enter your passcode to open Gabe OS.':'This locks Gabe OS to you. Use at least 6 characters.';
  $('#loginBtn').textContent=AUTH.setup?'Sign in':'Create passcode';
  lp.autocomplete=AUTH.setup?'current-password':'new-password';
  lmsg.textContent='';login.hidden=false;setTimeout(()=>lp.focus(),50);
}
lf.addEventListener('submit',async e=>{
  e.preventDefault();lmsg.textContent='';$('#loginBtn').disabled=true;
  try{
    const device=(navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||'device';
    await api(AUTH.setup?'auth/login':'auth/setup',{method:'POST',body:{passcode:lp.value,device}});
    AUTH.ok=true;AUTH.setup=true;lp.value='';login.hidden=true;await load();
  }catch(x){lmsg.textContent=x.message}
  finally{$('#loginBtn').disabled=false}
});
async function boot(){
  try{const s=await api('auth/status');AUTH.setup=s.setup;AUTH.ok=s.authed;
    if(s.authed)await load();else showLogin();
  }catch(e){
    // offline: run from the last synced copy
    if(D.events.length){AUTH.ok=true;toast2('Offline. Showing your last synced data.')}else{lmsg.textContent='Cannot reach Gabe OS right now. Check your connection.';login.hidden=false}
  }
}
boot();
addEventListener('focus',()=>{if(AUTH.ok)load()});
setInterval(()=>{if(AUTH.ok&&document.visibilityState==='visible')load()},120000);
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));

function loop(now){
  for(let i=tweens.length-1;i>=0;i--){const tw=tweens[i];if(now<tw.start)continue;if(tw.from===null)tw.from=S[tw.k];const p=Math.min(1,(now-tw.start)/tw.dur);S[tw.k]=tw.from+(tw.to-tw.from)*tw.e(p);if(p>=1)tweens.splice(i,1)}
  const t=now/1000*(RM?.25:1);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  drawBG(t);drawRays(t);drawWave(t);drawStreak();
  if(mode==='menu'){physics();layoutRing()}
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
