import './style.css';
import { SPORTS,createRun,info,type SportId,type SportRun,type Key,type Input } from './sports';
import { draw,drawCoast } from './render';
import { Meet,type Mode } from './session';
import { loadSave,writeSave,freshSave,type Save,type StoragePort } from './save';
const app=document.querySelector<HTMLDivElement>('#app')!;
const memoryStorage:StoragePort={getItem:()=>null,setItem:()=>{throw new Error('Storage unavailable');}};
let storage:StoragePort=memoryStorage;try{storage=localStorage;}catch{/* Browser may deny storage access. */}
let save:Save=loadSave(storage);let saveOK=true;let meet:Meet|null=null;let run:SportRun|null=null;let screen:'home'|'brief'|'play'|'result'|'final'='home';let paused=false;let accumulated=0;let last=0;let lastScore=0;
const held=new Set<Key>();const pressed=new Set<Key>();const released=new Set<Key>();const keys:Key[]=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyX'];
let audio:AudioContext|null=null;
function sound(frequency:number):void{if(!save.sound)return;try{audio??=new AudioContext();void audio.resume();const osc=audio.createOscillator();const gain=audio.createGain();osc.type='triangle';osc.frequency.setValueAtTime(frequency,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(frequency*.6,audio.currentTime+.12);gain.gain.setValueAtTime(.055,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.16);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.17);}catch{/* Audio is optional. */}}
function persist():void{saveOK=writeSave(storage,save);}
function clearKeys():void{held.clear();pressed.clear();released.clear();}
function shell(body:string):void{
 app.innerHTML=`<header class="topbar"><button class="wordmark" id="home" aria-label="Tideline Six home">TIDELINE <span>Ⅵ</span></button><div class="top-right"><span class="edition">COASTAL SPORTS CLUB / VOL. 01</span><button id="sound" class="quiet" aria-pressed="${save.sound}">Sound ${save.sound?'on':'off'}</button></div></header><main>${body}</main><footer><span>Six sports. One long summer.</span><span>Original art & code · Keyboard + touch</span></footer>`;
 document.querySelector('#home')!.addEventListener('click',()=>home());
 document.querySelector('#sound')!.addEventListener('click',()=>{save.sound=!save.sound;persist();sound(440);const b=document.querySelector<HTMLButtonElement>('#sound')!;b.textContent=`Sound ${save.sound?'on':'off'}`;b.setAttribute('aria-pressed',String(save.sound));});
}
function bind(id:string,callback:()=>void):void{document.getElementById(id)?.addEventListener('click',callback);}
function medalName(points:number):string{return points===5?'Gold':points===3?'Silver':points===1?'Bronze':'Unranked';}
function eventCard(id:SportId,index:number):string{const s=info(id);return `<button class="event-card" data-sport="${id}" style="--accent:${s.color}"><div class="card-head"><span>0${index+1}</span><span>${s.subtitle}</span><span>↗</span></div><canvas class="thumb" width="480" height="240" data-thumb="${id}" aria-hidden="true"></canvas><div class="card-bottom"><h3>${s.name}</h3><span>${s.duration}s ${id==='disc'?'limit · 3 throws':''}</span></div><div class="record">COMPETITION BEST <strong>${save.records[id]?.toLocaleString()??'—'}</strong></div></button>`;}
function home():void{
 screen='home';run=null;meet=null;paused=false;clearKeys();
 shell(`<section class="hero"><div class="hero-copy"><p class="eyebrow">THE TIDELINE INVITATIONAL</p><h1>A coast worth<br><em>playing.</em></h1><p class="intro">Chase the perfect line. Find your rhythm.<br>Six sun-soaked sports, from concrete to coastline.</p><button id="compete" class="primary">Enter the six-event meet <span>↗</span></button><p class="micro">SOLO COMPETITION · ABOUT 4 MINUTES · BEST MEET ${save.bestMeet}/30</p></div><div class="hero-art"><canvas id="coast" width="960" height="480" aria-label="Original illustrated coastline with a skater, palms, ocean and sunset"></canvas><div class="stamp">STAY<br>OUTSIDE<span>✳</span></div><div class="art-caption"><span>36° NORTH / EVERYWHERE COASTAL</span><span>EST. THIS SUMMER</span></div></div></section><section class="events"><div class="section-title"><div><p class="eyebrow">LEARN A LINE, THEN LINK THEM ALL</p><h2>Choose your practice.</h2></div><p>Every sport has its own rhythm.<br>Practice freely. Records count in the meet.</p></div><div class="event-grid">${SPORTS.map((s,i)=>eventCard(s.id,i)).join('')}</div></section><details class="about"><summary>About the game & accessibility</summary><p>An original tribute to six-event coastal sports games. Shortened rounds, fixed medal targets, solo play, and simplified tricks. No licensed characters, art or audio. Arrow keys, Space and X; P pauses, Esc returns home. Touch buttons support simultaneous presses. Audio starts off. Motion is intrinsic to play; pause at any time. Scores and instructions are available as HTML text. Competition records are stored only in this browser.</p><button class="quiet" id="reset">Reset this game's records</button><span id="reset-note"></span></details>${saveOK?'':'<p role="status">Records cannot be saved in this browser. You can still play.</p>'}`);
 bind('compete',()=>start('competition','pipe'));bind('reset',()=>{save={...freshSave(),sound:save.sound};persist();home();document.querySelector<HTMLDetailsElement>('details')!.open=true;document.querySelector('#reset-note')!.textContent=' This game’s records were reset.';});
 document.querySelectorAll<HTMLButtonElement>('[data-sport]').forEach(b=>b.addEventListener('click',()=>start('practice',b.dataset.sport as SportId)));
 const c=document.querySelector<HTMLCanvasElement>('#coast')!;drawCoast(c.getContext('2d')!);
 document.querySelectorAll<HTMLCanvasElement>('[data-thumb]').forEach(c=>{const ctx=c.getContext('2d')!;ctx.scale(.5,.5);draw(ctx,createRun(c.dataset.thumb as SportId));});
}
function start(mode:Mode,id:SportId):void{meet=new Meet(mode,id);brief();}
function brief():void{
 if(!meet)return;screen='brief';run=createRun(meet.current);paused=false;clearKeys();const s=info(run.id);const [b,si,g]=s.targets;
 shell(`<section class="brief"><div class="brief-art"><canvas id="brief-art" width="960" height="480" aria-label="${s.subtitle} course preview"></canvas></div><div class="brief-copy"><p class="eyebrow">${meet.mode==='practice'?'PRACTICE':`MEET / EVENT ${meet.results.length+1} OF 6`} · ${s.location}</p><h1>${s.name}</h1><p class="discipline">${s.subtitle}</p><ul class="controls">${s.controls.map(x=>`<li>${x}</li>`).join('')}</ul><p class="tip">${s.tip}</p><div class="targets"><span>BRONZE ${b}</span><span>SILVER ${si}</span><span>GOLD ${g}</span></div><p class="small">${s.duration} second limit${run.id==='disc'?' / three throws':run.id==='bag'?' / drops cost time':' / three falls'} · ${meet.mode==='practice'?'practice scores are not saved':'competition records are saved'}</p><button id="begin" class="primary">Start ${s.subtitle.toLowerCase()} <span>↗</span></button><p class="micro">ENTER TO START · P TO PAUSE · ESC TO LEAVE</p></div></section>`);
 draw(document.querySelector<HTMLCanvasElement>('#brief-art')!.getContext('2d')!,run);bind('begin',play);
}
function play():void{
 if(!run||!meet)return;screen='play';paused=false;lastScore=0;accumulated=0;clearKeys();const s=info(run.id);
 shell(`<section class="arena"><div class="arena-title"><div><p class="eyebrow">${meet.mode.toUpperCase()} / ${s.location}</p><h1>${s.name} <span>${s.subtitle}</span></h1></div><button id="pause" class="quiet">Pause [P]</button></div><div class="hud"><div><small>SCORE</small><strong id="score">0</strong></div><div><small>REMAINING</small><strong id="time">${s.duration}s</strong></div><div><small>${run.id==='disc'?'THROWS':run.id==='bag'?'CHAIN':'FALLS'}</small><strong id="attempts">0</strong></div><div class="hud-status"><small>FIND YOUR RHYTHM</small><span id="sport-status"></span></div></div><div class="canvas-wrap"><canvas id="game" width="960" height="480" tabindex="0" aria-label="${s.subtitle} playable course. Controls listed below."></canvas><div id="pause-overlay" hidden><h2>Take a breather.</h2><p>Your clock is stopped.</p><button id="resume" class="primary">Keep going</button><button id="restart" class="quiet">Restart ${meet.mode==='competition'?'meet':'practice'}</button><button id="leave" class="quiet">Return to coast</button></div></div><div class="feedback" id="feedback" role="status" aria-live="polite">${s.tip}</div><div class="play-help"><div>${s.controls.map(x=>`<span>${x}</span>`).join('')}</div><p>P pause · Esc coast</p></div><div class="touch-controls" aria-label="Touch game controls">${[['ArrowLeft','←'],['ArrowRight','→'],['ArrowUp','↑'],['ArrowDown','↓'],['Space','Space'],['KeyX','X']].map(([key,label])=>`<button data-key="${key}" aria-label="${key}">${label}</button>`).join('')}</div></section>`);
 bind('pause',togglePause);bind('resume',togglePause);bind('restart',()=>{if(meet)start(meet.mode,meet.first);});bind('leave',home);
 document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(b=>{const key=b.dataset.key as Key;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held.add(key);pressed.add(key);});const up=()=>{held.delete(key);released.add(key);};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);});
 document.querySelector<HTMLCanvasElement>('#game')!.focus();refresh();
}
function togglePause():void{if(screen!=='play')return;paused=!paused;clearKeys();document.querySelector<HTMLElement>('#pause-overlay')!.hidden=!paused;document.querySelector('#pause')!.textContent=paused?'Resume [P]':'Pause [P]';if(!paused)document.querySelector<HTMLCanvasElement>('#game')!.focus();}
function refresh():void{
 if(!run)return;document.querySelector('#score')!.textContent=run.score.toLocaleString();document.querySelector('#time')!.textContent=`${Math.max(0,Math.ceil(info(run.id).duration-run.time))}s`;
 document.querySelector('#attempts')!.textContent=run.id==='disc'?`${run.throws}/3`:run.id==='bag'?`${run.combo}`:`${run.falls}/3`;
 document.querySelector('#sport-status')!.textContent=run.status;const feedback=document.querySelector('#feedback')!;const msg=run.messageTime>0?run.message:info(run.id).tip;if(feedback.textContent!==msg)feedback.textContent=msg;
 draw(document.querySelector<HTMLCanvasElement>('#game')!.getContext('2d')!,run);
}
function result():void{
 if(!run||!meet)return;screen='result';clearKeys();const r=meet.complete(run.id,run.score,run.falls);const s=info(r.id);
 if(meet.mode==='competition'){save.records[r.id]=Math.max(save.records[r.id]??0,r.score);if(meet.done)save.bestMeet=Math.max(save.bestMeet,meet.total);persist();}
 shell(`<section class="result"><p class="eyebrow">${s.subtitle} / RUN COMPLETE</p><div class="medallion">${r.medal===5?'✹':r.medal===3?'✧':r.medal===1?'✦':'≈'}</div><h1>${medalName(r.medal)} ${r.medal?'on the coast.':'— keep exploring.'}</h1><div class="result-score">${r.score.toLocaleString()}<small>EVENT POINTS</small></div><p>${run.message} · ${r.falls} falls${r.id==='bag'?` · ${run.id==='bag'?run.contacts:0} contacts`:''}</p><p class="tip">${meet.mode==='competition'?`+${r.medal} medal points · meet total ${meet.total}/30`:'Practice complete. Competition records are unchanged.'}</p>${saveOK?'':'<p role="status">Storage unavailable — this result could not be saved.</p>'}<div class="result-actions"><button id="continue" class="primary">${meet.mode==='competition'?(meet.done?'View meet results':'Next event'):'Practice again'} <span>↗</span></button><button id="back" class="quiet">Return to coast</button></div></section>`);
 bind('continue',()=>{if(!meet)return;if(meet.mode==='practice'){start('practice',meet.first);}else if(meet.done)final();else brief();});bind('back',home);
}
function final():void{
 if(!meet)return;screen='final';shell(`<section class="meet-result"><p class="eyebrow">THE TIDELINE INVITATIONAL / FINAL RESULTS</p><h1>One coast.<br><em>Six stories.</em></h1><p class="meet-total">${meet.total}<span>/30 MEDAL POINTS</span></p><div class="scoreboard">${meet.results.map(r=>`<div><span>${info(r.id).subtitle}</span><strong>${r.score.toLocaleString()}</strong><span>${medalName(r.medal)}</span><b>+${r.medal}</b></div>`).join('')}</div><p>Personal best meet: ${save.bestMeet}/30. Gold 5 · Silver 3 · Bronze 1.</p><button class="primary" id="again">Enter another meet <span>↗</span></button><button class="quiet" id="back">Return to coast</button></section>`);bind('again',()=>start('competition','pipe'));bind('back',home);
}
window.addEventListener('keydown',e=>{
 if(e.code==='Escape'){home();return;}
 if(e.code==='KeyP'&&screen==='play'){if(!e.repeat)togglePause();return;}
 if(e.code==='Enter'&&screen==='brief'){e.preventDefault();play();return;}
 if(keys.includes(e.code as Key)&&screen==='play'&&!paused){e.preventDefault();const key=e.code as Key;if(!held.has(key))pressed.add(key);held.add(key);}
});
window.addEventListener('keyup',e=>{const key=e.code as Key;if(held.has(key))released.add(key);held.delete(key);});
window.addEventListener('blur',()=>{if(screen==='play'&&!paused)togglePause();clearKeys();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&screen==='play'&&!paused)togglePause();});
function frame(timestamp:number):void{
 const elapsed=Math.min(.1,(timestamp-last)/1000);last=timestamp;
 if(screen==='play'&&run&&!paused){accumulated+=elapsed;let first=true;while(accumulated>=1/60){const input:Input={held,pressed:first?pressed:new Set(),released:first?released:new Set()};run.step(1/60,input);if(first){pressed.clear();released.clear();first=false;}accumulated-=1/60;if(run.done)break;}if(run.score>lastScore){sound(330+Math.min(500,run.score%500));lastScore=run.score;}refresh();if(run.done)result();}
 requestAnimationFrame(frame);
}
home();requestAnimationFrame(frame);
