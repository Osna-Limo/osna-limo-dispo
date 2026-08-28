const resources=[
{id:'bierbike',num:'1',name:'Bierbike',plate:'',color:'#7CB342',order:1},
{id:'chrysler-black',num:'3',name:'Chrysler Black',plate:'OS NA 3333',color:'#616161',order:2},
{id:'chrysler-pink',num:'3.1',name:'Chrysler Pink',plate:'OS NA 971',color:'#D81B60',order:3},
{id:'chrysler-deluxe',num:'3.2',name:'Chrysler Deluxe',plate:'OS NA 3044',color:'#8E24AA',order:4},
{id:'hummer-h3',num:'5',name:'Hummer H3',plate:'OS PR 993',color:'#F6BF26',order:5},
{id:'hummer-h2-2',num:'6.2',name:'Hummer H2 (2)',plate:'OS NA 3036',color:'#039BE5',order:6},
{id:'hummer-h2-3',num:'6.2',name:'Hummer H2 (3)',plate:'MI YJ 729',color:'#3F51B5',order:7},
{id:'sprinter',num:'90',name:'Sprinter',plate:'OS NA 3014',color:'#33B679',order:8},
{id:'salitos',num:'90.1',name:'Salitos Bus',plate:'OS NA 3080',color:'#EF6C00',order:9},
{id:'partybus-1',num:'91',name:'Partybus 1',plate:'OS NA 194',color:'#7986CB',order:10},
{id:'partybus-2',num:'92',name:'Partybus 2',plate:'OS NA 3555',color:'#0B8043',order:11},
{id:'partybus-3',num:'93',name:'Partybus 3',plate:'OS PR 3449',color:'#E67C73',order:12},
{id:'partybus-4',num:'93.2',name:'Partybus 4',plate:'OS NA 967',color:'#F4511E',order:13},
{id:'partyliner',num:'94',name:'Partyliner',plate:'MI YM 358',color:'#A79B8E',order:14},
{id:'partybus-vip',num:'95',name:'Partybus VIP',plate:'OS NA 8765',color:'#8E24AA',order:15}
];

// Snapshot vom 05.04.2025 – nur Anzeige. Später werden diese Daten live aus Google Calendar gelesen.
let events=[
{id:1,res:'chrysler-deluxe',start:'16:00',end:'18:00',title:'#100211 Bielefeld'},
{id:2,res:'chrysler-deluxe',start:'20:00',end:'21:15',title:'(I) #100246 Münster - Legden'},
{id:3,res:'hummer-h2-2',start:'12:45',end:'14:45',title:'(B) #300060 Bad Iburg - Bielefeld'},
{id:4,res:'hummer-h2-2',start:'15:00',end:'17:00',title:'Bielefeld - Münster (OL)'},
{id:5,res:'hummer-h2-2',start:'19:30',end:'20:30',title:'(V) #100198 Osnabrück - Recke'},
{id:6,res:'hummer-h2-2',start:'22:00',end:'00:30',title:'#300122 Osnabrück - Bersenbrück'},
{id:7,res:'hummer-h2-3',start:'13:30',end:'14:30',title:'(B) #10325 Oldenburg'},
{id:8,res:'sprinter',start:'15:00',end:'17:00',title:'(B)(V) #12543 Münster'},
{id:9,res:'sprinter',start:'18:30',end:'19:30',title:'#300089 Dortmund'},
{id:10,res:'sprinter',start:'21:00',end:'22:00',title:'#300291 Münster'},
{id:11,res:'partybus-2',start:'14:00',end:'17:00',title:'(OB) #300166 Wildeshausen - Bremen'},
{id:12,res:'partybus-2',start:'19:30',end:'20:30',title:'(OB) #100070 Dissen - Osnabrück'},
{id:13,res:'partybus-2',start:'21:30',end:'23:30',title:'(OB) Hollage - Osnabrück (PR)'},
{id:14,res:'partybus-3',start:'12:30',end:'13:45',title:'(OB) #300339 Salzbergen - Osnabrück'},
{id:15,res:'partybus-3',start:'15:30',end:'17:30',title:'#300131 Roxel - Bochum'},
{id:16,res:'partybus-3',start:'20:00',end:'22:00',title:'#100191 Bielefeld'},
{id:17,res:'partybus-4',start:'17:00',end:'19:00',title:'(B) (OB) #100058 Lingen (Rechnung minus 10%)'},
{id:18,res:'partybus-4',start:'21:30',end:'23:30',title:'(OB) #300422 Wagenfeld - Osnabrück 30 min früher wenn es geht.'},
{id:19,res:'partyliner',start:'12:00',end:'14:00',title:'(OB) #100203 Bramsche - Osnabrück'},
{id:20,res:'partyliner',start:'15:25',end:'18:00',title:'(B)(V) #10335 SEKT!!! Altenberge'},
{id:21,res:'partyliner',start:'19:30',end:'21:30',title:'(OB) Meppen - Münster (OL)'},
{id:22,res:'partybus-vip',start:'14:45',end:'16:45',title:'(B) Tarmstedt - Bremen (LE)'},
{id:23,res:'partybus-vip',start:'19:00',end:'21:30',title:'#300097 Bad Laer - Melle'}
];

let date=new Date(2025,3,5);date.setHours(0,0,0,0);
const startHour=8,endHour=25,slotMinutes=30,COLLAPSED_WIDTH=18;
let collapsedResources=new Set(JSON.parse(localStorage.getItem('osna_collapsed_resources')||'[]'));

function mins(t){const[h,m]=t.split(':').map(Number);return h*60+m}
function spanMins(s,e){let a=mins(s),b=mins(e);if(b<=a)b+=1440;return b-a}
function yFor(t){return(mins(t)-startHour*60)/slotMinutes*getSlotPx()}
function hFor(s,e){return Math.max(document.body.classList.contains('compact-mode')?20:28,spanMins(s,e)/slotMinutes*getSlotPx()-4)}
function getSlotPx(){return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slot'))||34}
function formatDate(d){return new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}).format(d)}
function hexToRgba(hex,alpha){const x=hex.replace('#','');const n=parseInt(x,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`}
function sortedResources(){const active=new Set(events.map(e=>e.res));return[...resources].sort((a,b)=>active.has(a.id)!==active.has(b.id)?(active.has(a.id)?-1:1):a.order-b.order)}
function columnTemplate(list){return `var(--timew) ${list.map(r=>collapsedResources.has(r.id)?`${COLLAPSED_WIDTH}px`:'var(--colw)').join(' ')}`}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.style.display='block';clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.style.display='none',2200)}

function render(){
  document.getElementById('dateLabel').textContent=formatDate(date);
  const scheduler=document.getElementById('scheduler');scheduler.innerHTML='';
  const visible=sortedResources();scheduler.style.gridTemplateColumns=columnTemplate(visible);
  const corner=document.createElement('div');corner.className='corner';corner.innerHTML='<div style="padding:14px 8px;color:#9ca3af;font-size:11px">ZEIT</div>';scheduler.appendChild(corner);
  visible.forEach(r=>{
    const h=document.createElement('div');h.className='resource-head';h.style.setProperty('--resource-color',r.color);
    if(!events.some(e=>e.res===r.id))h.classList.add('empty');if(collapsedResources.has(r.id))h.classList.add('collapsed');
    h.innerHTML=`<div class="num">Fahrzeug ${r.num}</div><div class="name">${r.name}</div><div class="plate">${r.plate||'&nbsp;'}</div>`;
    const btn=document.createElement('button');btn.type='button';btn.className='collapse-btn';btn.textContent=collapsedResources.has(r.id)?'›':'‹';btn.title=collapsedResources.has(r.id)?`${r.name} aufklappen`:`${r.name} minimieren`;
    btn.addEventListener('click',()=>{collapsedResources.has(r.id)?collapsedResources.delete(r.id):collapsedResources.add(r.id);localStorage.setItem('osna_collapsed_resources',JSON.stringify([...collapsedResources]));render()});h.appendChild(btn);scheduler.appendChild(h);
  });
  const tc=document.createElement('div');tc.className='time-col';for(let h=startHour;h<endHour;h++){for(let half=0;half<2;half++){const x=document.createElement('div');x.className='time-label';x.textContent=half===0?(h===24?'00:00 +1':`${String(h).padStart(2,'0')}:00`):'';tc.appendChild(x)}}scheduler.appendChild(tc);
  visible.forEach(r=>{
    const c=document.createElement('div');c.className='resource-col';if(collapsedResources.has(r.id))c.classList.add('collapsed-col');
    events.filter(e=>e.res===r.id).forEach(ev=>{const d=document.createElement('div');d.className='event';d.style.top=`${yFor(ev.start)}px`;d.style.height=`${hFor(ev.start,ev.end)}px`;d.style.borderColor=hexToRgba(r.color,.7);d.style.background=hexToRgba(r.color,collapsedResources.has(r.id)?.8:.42);d.innerHTML=`<div class="t">${ev.start}–${ev.end}</div><div class="title">${ev.title}</div>`;c.appendChild(d)});scheduler.appendChild(c);
  });
}

const widthInput=document.getElementById('colWidth'),widthValue=document.getElementById('colWidthValue');const rowHeightInput=document.getElementById('rowHeight'),rowHeightValue=document.getElementById('rowHeightValue');const eventFontInput=document.getElementById('eventFont'),eventFontValue=document.getElementById('eventFontValue');const compactMode=document.getElementById('compactMode');
function restore(){const w=localStorage.getItem('osna_col_width')||115,h=localStorage.getItem('osna_row_height')||34,f=localStorage.getItem('osna_event_font')||10.5,c=localStorage.getItem('osna_compact_mode')==='1';document.documentElement.style.setProperty('--colw',`${w}px`);document.documentElement.style.setProperty('--slot',`${h}px`);document.documentElement.style.setProperty('--eventfont',`${f}px`);widthInput.value=w;widthValue.textContent=w;rowHeightInput.value=h;rowHeightValue.textContent=h;eventFontInput.value=f;eventFontValue.textContent=f;compactMode.checked=c;document.body.classList.toggle('compact-mode',c)}
widthInput.addEventListener('input',e=>{document.documentElement.style.setProperty('--colw',`${e.target.value}px`);widthValue.textContent=e.target.value;localStorage.setItem('osna_col_width',e.target.value);render()});rowHeightInput.addEventListener('input',e=>{document.documentElement.style.setProperty('--slot',`${e.target.value}px`);rowHeightValue.textContent=e.target.value;localStorage.setItem('osna_row_height',e.target.value);render()});eventFontInput.addEventListener('input',e=>{document.documentElement.style.setProperty('--eventfont',`${e.target.value}px`);eventFontValue.textContent=e.target.value;localStorage.setItem('osna_event_font',e.target.value);render()});compactMode.addEventListener('change',e=>{document.body.classList.toggle('compact-mode',e.target.checked);localStorage.setItem('osna_compact_mode',e.target.checked?'1':'0');render()});
document.getElementById('resetView').addEventListener('click',()=>{['osna_col_width','osna_row_height','osna_event_font','osna_compact_mode','osna_collapsed_resources'].forEach(k=>localStorage.removeItem(k));collapsedResources.clear();restore();render()});
document.getElementById('prev').addEventListener('click',()=>showToast('Live-Datumsnavigation folgt mit Google Calendar.'));document.getElementById('next').addEventListener('click',()=>showToast('Live-Datumsnavigation folgt mit Google Calendar.'));document.getElementById('today').addEventListener('click',()=>showToast('Aktuell ist der Snapshot vom 05.04.2025 geladen.'));
restore();render();
