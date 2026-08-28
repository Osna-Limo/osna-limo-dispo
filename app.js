const TIME_ZONE='Europe/Berlin';
const READONLY_SCOPE='https://www.googleapis.com/auth/calendar.readonly';
const API_BASE='https://www.googleapis.com/calendar/v3';

const resources=[
{id:'bierbike',num:'1',name:'Bierbike',plate:'',calendarName:'1 - Bierbike',color:'#7CB342',order:1},
{id:'chrysler-black',num:'3',name:'Chrysler Black',plate:'OS NA 3333',calendarName:'3 - Chrysler Black OS NA 3333',color:'#616161',order:2},
{id:'chrysler-pink',num:'3.1',name:'Chrysler Pink',plate:'OS NA 971',calendarName:'3.1 - Chrysler Pink OS NA 971',color:'#D81B60',order:3},
{id:'chrysler-deluxe',num:'3.2',name:'Chrysler Deluxe',plate:'OS NA 3044',calendarName:'3.2 - Chrysler Deluxe OS NA 3044',color:'#8E24AA',order:4},
{id:'hummer-h3',num:'5',name:'Hummer H3',plate:'OS PR 993',calendarName:'5 - Hummer H3 OS PR 993',color:'#F6BF26',order:5},
{id:'hummer-h2-2',num:'6.2',name:'Hummer H2 (2)',plate:'OS NA 3036',calendarName:'6.2 - Hummer H2 (2) OS NA3036',color:'#039BE5',order:6},
{id:'hummer-h2-3',num:'6.2',name:'Hummer H2 (3)',plate:'MI YJ 729',calendarName:'6.2 - Hummer H2 (3) MI YJ 729',color:'#3F51B5',order:7},
{id:'sprinter',num:'90',name:'Sprinter',plate:'OS NA 3014',calendarName:'90 - Sprinter OS NA 3014',color:'#33B679',order:8},
{id:'salitos',num:'90.1',name:'Salitos Bus',plate:'OS NA 3080',calendarName:'90.1 - Salitos Bus OS NA 3080',color:'#EF6C00',order:9},
{id:'partybus-1',num:'91',name:'Partybus 1',plate:'OS NA 194',calendarName:'91 - Partybus 1 OSNA194',color:'#7986CB',order:10},
{id:'partybus-2',num:'92',name:'Partybus 2',plate:'OS NA 3555',calendarName:'92 - Partybus 2 OS NA 3555',color:'#0B8043',order:11},
{id:'partybus-3',num:'93',name:'Partybus 3',plate:'OS PR 3449',calendarName:'93 - Partybus 3 OS PR 3449',color:'#E67C73',order:12},
{id:'partybus-4',num:'93.2',name:'Partybus 4',plate:'OS NA 967',calendarName:'93.2 - Partybus 4 OS NA 967',color:'#F4511E',order:13},
{id:'partyliner',num:'94',name:'Partyliner',plate:'MI YM 358',calendarName:'94 - Partyliner MI YM 358',color:'#A79B8E',order:14},
{id:'partybus-vip',num:'95',name:'Partybus VIP',plate:'OS NA 8765',calendarName:'95 - Partybus VIP OS NA 8765',color:'#8E24AA',order:15}
];

let events=[];
let date=new Date();date.setHours(0,0,0,0);
let accessToken='';
let tokenClient=null;
let calendarMapReady=false;
let loadSequence=0;

const DEFAULT_START_HOUR=8,END_HOUR=25,slotMinutes=30,COLLAPSED_WIDTH=18;
let timelineStartHour=DEFAULT_START_HOUR;
let collapsedResources=new Set(JSON.parse(localStorage.getItem('osna_collapsed_resources')||'[]'));

function mins(t){const[h,m]=t.split(':').map(Number);return h*60+m}
function spanMins(s,e){let a=mins(s),b=mins(e);if(b<=a)b+=1440;return b-a}
function yFor(t){return(mins(t)-timelineStartHour*60)/slotMinutes*getSlotPx()}
function hFor(s,e){return Math.max(document.body.classList.contains('compact-mode')?20:28,spanMins(s,e)/slotMinutes*getSlotPx()-4)}
function getSlotPx(){return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slot'))||34}
function formatDate(d){return new Intl.DateTimeFormat('de-DE',{timeZone:TIME_ZONE,weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}).format(d)}
function dateKey(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function hexToRgba(hex,alpha){const x=(hex||'#777777').replace('#','');const n=parseInt(x,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`}
function sortedResources(){const active=new Set(events.map(e=>e.res));return[...resources].sort((a,b)=>active.has(a.id)!==active.has(b.id)?(active.has(a.id)?-1:1):a.order-b.order)}
function columnTemplate(list){return `var(--timew) ${list.map(r=>collapsedResources.has(r.id)?`${COLLAPSED_WIDTH}px`:'var(--colw)').join(' ')}`}
function showToast(msg,ms=2600){const t=document.getElementById('toast');t.textContent=msg;t.style.display='block';clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.style.display='none',ms)}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function setStatus(text,state=''){const pill=document.getElementById('statusPill');pill.textContent=text;pill.className=`sync-pill ${state}`.trim()}
function berlinTime(iso){return new Intl.DateTimeFormat('de-DE',{timeZone:TIME_ZONE,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(iso))}
function updateTimelineStart(){timelineStartHour=events.some(e=>e.carryIn||mins(e.start)<DEFAULT_START_HOUR*60)?0:DEFAULT_START_HOUR}

function dayBounds(d){
  // Die Dispo wird in Deutschland eingesetzt. Der Browser erstellt damit die lokalen
  // Tagesgrenzen inklusive Sommer-/Winterzeit korrekt und sendet sie als UTC an Google.
  const start=new Date(d);start.setHours(0,0,0,0);
  const end=new Date(start);end.setDate(end.getDate()+1);
  return{timeMin:start.toISOString(),timeMax:end.toISOString()};
}

async function googleGet(url){
  const response=await fetch(url,{headers:{Authorization:`Bearer ${accessToken}`}});
  if(response.status===401){
    accessToken='';calendarMapReady=false;setStatus('● Verbindung abgelaufen','error');
    document.getElementById('authButton').textContent='Google neu verbinden';
    throw new Error('Google-Anmeldung ist abgelaufen. Bitte neu verbinden.');
  }
  if(!response.ok){
    let detail='';try{const body=await response.json();detail=body?.error?.message||''}catch{}
    throw new Error(detail||`Google API Fehler ${response.status}`);
  }
  return response.json();
}

async function listAllCalendars(){
  const result=[];let pageToken='';
  do{
    const params=new URLSearchParams({maxResults:'250',showHidden:'true'});
    if(pageToken)params.set('pageToken',pageToken);
    const data=await googleGet(`${API_BASE}/users/me/calendarList?${params}`);
    result.push(...(data.items||[]));pageToken=data.nextPageToken||'';
  }while(pageToken);
  return result;
}

async function mapVehicleCalendars(){
  const calendars=await listAllCalendars();
  const byName=new Map(calendars.map(c=>[String(c.summary||'').trim(),c]));
  let matched=0;
  resources.forEach(r=>{
    const cal=byName.get(r.calendarName);
    r.calendarId=cal?.id||'';
    if(cal){
      matched++;
      if(cal.backgroundColor)r.color=cal.backgroundColor;
      r.calendarForeground=cal.foregroundColor||'#ffffff';
    }
  });
  calendarMapReady=true;
  return matched;
}

async function fetchCalendarEvents(resource,d){
  if(!resource.calendarId)return[];
  const {timeMin,timeMax}=dayBounds(d);
  const dayStart=new Date(timeMin),dayEnd=new Date(timeMax);
  const params=new URLSearchParams({
    singleEvents:'true',orderBy:'startTime',maxResults:'2500',timeMin,timeMax,timeZone:TIME_ZONE
  });
  const url=`${API_BASE}/calendars/${encodeURIComponent(resource.calendarId)}/events?${params}`;
  const data=await googleGet(url);
  return(data.items||[])
    .filter(item=>item.status!=='cancelled'&&item.start?.dateTime&&item.end?.dateTime)
    .map(item=>{
      const originalStart=new Date(item.start.dateTime);
      const originalEnd=new Date(item.end.dateTime);
      if(!(originalStart<dayEnd&&originalEnd>dayStart))return null;
      const displayStart=originalStart<dayStart?dayStart:originalStart;
      const displayEnd=originalEnd>dayEnd?dayEnd:originalEnd;
      return{
        id:item.id,
        res:resource.id,
        start:berlinTime(displayStart.toISOString()),
        end:berlinTime(displayEnd.toISOString()),
        title:item.summary||'(Ohne Titel)',
        carryIn:originalStart<dayStart,
        carryOut:originalEnd>dayEnd
      };
    })
    .filter(Boolean);
}

async function loadDay(){
  if(!accessToken){events=[];render();return}
  const seq=++loadSequence;
  setStatus('● Google wird geladen…','loading');
  try{
    if(!calendarMapReady){
      const matched=await mapVehicleCalendars();
      if(matched!==resources.length)showToast(`${matched} von ${resources.length} Fahrzeugkalendern erkannt.`,4000);
    }
    const batches=await Promise.all(resources.map(r=>fetchCalendarEvents(r,date)));
    if(seq!==loadSequence)return;
    events=batches.flat();
    render();
    const active=new Set(events.map(e=>e.res)).size;
    setStatus(`● ${events.length} Termine · ${active} Fahrzeuge`,'connected');
  }catch(err){
    console.error(err);events=[];render();setStatus('● Fehler beim Auslesen','error');showToast(err.message||'Google Calendar konnte nicht gelesen werden.',5000);
  }
}

function render(){
  updateTimelineStart();
  document.getElementById('dateLabel').textContent=formatDate(date);
  document.getElementById('datePicker').value=dateKey(date);
  const scheduler=document.getElementById('scheduler');scheduler.innerHTML='';
  const visible=sortedResources();scheduler.style.gridTemplateColumns=columnTemplate(visible);
  const corner=document.createElement('div');corner.className='corner';corner.innerHTML='<div class="corner-label">ZEIT</div>';scheduler.appendChild(corner);
  visible.forEach(r=>{
    const h=document.createElement('div');h.className='resource-head';h.style.setProperty('--resource-color',r.color);
    if(!events.some(e=>e.res===r.id))h.classList.add('empty');if(collapsedResources.has(r.id))h.classList.add('collapsed');
    h.innerHTML=`<div class="num">Fahrzeug ${escapeHtml(r.num)}</div><div class="name">${escapeHtml(r.name)}</div><div class="plate">${r.plate?escapeHtml(r.plate):'&nbsp;'}</div>`;
    const btn=document.createElement('button');btn.type='button';btn.className='collapse-btn';btn.textContent=collapsedResources.has(r.id)?'›':'‹';btn.title=collapsedResources.has(r.id)?`${r.name} aufklappen`:`${r.name} minimieren`;
    btn.addEventListener('click',()=>{collapsedResources.has(r.id)?collapsedResources.delete(r.id):collapsedResources.add(r.id);localStorage.setItem('osna_collapsed_resources',JSON.stringify([...collapsedResources]));render()});h.appendChild(btn);scheduler.appendChild(h);
  });
  const tc=document.createElement('div');tc.className='time-col';
  for(let h=timelineStartHour;h<END_HOUR;h++){
    for(let half=0;half<2;half++){
      const x=document.createElement('div');x.className='time-label';
      x.textContent=half===0?(h===24?'00:00 +1':`${String(h).padStart(2,'0')}:00`):'';
      tc.appendChild(x)
    }
  }
  scheduler.appendChild(tc);
  const timelineSlots=(END_HOUR-timelineStartHour)*2;
  visible.forEach(r=>{
    const c=document.createElement('div');c.className='resource-col';c.style.height=`calc(var(--slot) * ${timelineSlots})`;if(collapsedResources.has(r.id))c.classList.add('collapsed-col');
    events.filter(e=>e.res===r.id).forEach(ev=>{
      const d=document.createElement('div');d.className='event';d.style.top=`${yFor(ev.start)}px`;d.style.height=`${hFor(ev.start,ev.end)}px`;d.style.borderColor=hexToRgba(r.color,.72);d.style.background=hexToRgba(r.color,collapsedResources.has(r.id)?.82:.44);
      const continuation=ev.carryIn?'Fortsetzung vom Vortag · ':'';
      d.title=`${continuation}${ev.start}–${ev.end} · ${ev.title}`;
      d.innerHTML=`<div class="t">${escapeHtml(ev.start)}–${escapeHtml(ev.end)}</div><div class="title">${escapeHtml(ev.title)}</div>`;c.appendChild(d)
    });scheduler.appendChild(c);
  });
}

function initGoogleAuth(){
  const clientId=window.OSNA_DISPO_CONFIG?.googleClientId?.trim()||'';
  const authButton=document.getElementById('authButton');
  if(!clientId){
    authButton.textContent='Google einrichten';setStatus('● Client-ID fehlt','error');
    authButton.addEventListener('click',()=>showToast('Zuerst muss einmalig die Google OAuth Client-ID eingetragen werden.',4500));
    return;
  }
  if(!window.google?.accounts?.oauth2){
    setStatus('● Google Login nicht geladen','error');authButton.disabled=true;return;
  }
  tokenClient=google.accounts.oauth2.initTokenClient({
    client_id:clientId,
    scope:READONLY_SCOPE,
    callback:async response=>{
      if(response.error){setStatus('● Anmeldung abgebrochen','error');showToast(response.error_description||response.error,4500);return}
      accessToken=response.access_token||'';
      calendarMapReady=false;
      authButton.textContent='Google neu verbinden';
      await loadDay();
    },
    error_callback:error=>{console.error(error);setStatus('● Google Login fehlgeschlagen','error');showToast('Google-Anmeldung konnte nicht geöffnet werden.',4500)}
  });
  authButton.addEventListener('click',()=>tokenClient.requestAccessToken());
  setStatus('● Bereit zum Verbinden');
}

const widthInput=document.getElementById('colWidth'),widthValue=document.getElementById('colWidthValue');
const rowHeightInput=document.getElementById('rowHeight'),rowHeightValue=document.getElementById('rowHeightValue');
const eventFontInput=document.getElementById('eventFont'),eventFontValue=document.getElementById('eventFontValue');
const compactMode=document.getElementById('compactMode');
function restore(){const w=localStorage.getItem('osna_col_width')||115,h=localStorage.getItem('osna_row_height')||34,f=localStorage.getItem('osna_event_font')||10.5,c=localStorage.getItem('osna_compact_mode')==='1';document.documentElement.style.setProperty('--colw',`${w}px`);document.documentElement.style.setProperty('--slot',`${h}px`);document.documentElement.style.setProperty('--eventfont',`${f}px`);widthInput.value=w;widthValue.textContent=w;rowHeightInput.value=h;rowHeightValue.textContent=h;eventFontInput.value=f;eventFontValue.textContent=f;compactMode.checked=c;document.body.classList.toggle('compact-mode',c)}
widthInput.addEventListener('input',e=>{document.documentElement.style.setProperty('--colw',`${e.target.value}px`);widthValue.textContent=e.target.value;localStorage.setItem('osna_col_width',e.target.value);render()});
rowHeightInput.addEventListener('input',e=>{document.documentElement.style.setProperty('--slot',`${e.target.value}px`);rowHeightValue.textContent=e.target.value;localStorage.setItem('osna_row_height',e.target.value);render()});
eventFontInput.addEventListener('input',e=>{document.documentElement.style.setProperty('--eventfont',`${e.target.value}px`);eventFontValue.textContent=e.target.value;localStorage.setItem('osna_event_font',e.target.value);render()});
compactMode.addEventListener('change',e=>{document.body.classList.toggle('compact-mode',e.target.checked);localStorage.setItem('osna_compact_mode',e.target.checked?'1':'0');render()});
document.getElementById('resetView').addEventListener('click',()=>{['osna_col_width','osna_row_height','osna_event_font','osna_compact_mode','osna_collapsed_resources'].forEach(k=>localStorage.removeItem(k));collapsedResources.clear();restore();render()});

document.getElementById('prev').addEventListener('click',()=>{date.setDate(date.getDate()-1);loadDay()});
document.getElementById('next').addEventListener('click',()=>{date.setDate(date.getDate()+1);loadDay()});
document.getElementById('today').addEventListener('click',()=>{date=new Date();date.setHours(0,0,0,0);loadDay()});
const datePicker=document.getElementById('datePicker');
document.getElementById('dateButton').addEventListener('click',()=>{if(datePicker.showPicker)datePicker.showPicker();else datePicker.click()});
datePicker.addEventListener('change',()=>{if(!datePicker.value)return;const[y,m,d]=datePicker.value.split('-').map(Number);date=new Date(y,m-1,d);date.setHours(0,0,0,0);loadDay()});

restore();render();initGoogleAuth();