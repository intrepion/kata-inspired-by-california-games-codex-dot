export type SportId = 'pipe' | 'bag' | 'surf' | 'skate' | 'bmx' | 'disc';
export type Key = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Space' | 'KeyX';
export interface Input { held: ReadonlySet<Key>; pressed: ReadonlySet<Key>; released: ReadonlySet<Key> }
export const idle: Input = { held: new Set(), pressed: new Set(), released: new Set() };
export const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
export interface SportInfo { id: SportId; name: string; subtitle: string; location: string; controls: string[]; tip: string; duration: number; targets: readonly [number, number, number]; color: string }
export const SPORTS: readonly SportInfo[] = [
  { id:'pipe', name:'Concrete Crescent', subtitle:'HALF-PIPE', location:'01 / SUNSET PARK', controls:['↑ uphill / ↓ downhill — pump','Space at the lip — kick turn','Hold X at lip, release after 0.2–0.7s — handplant','Space above lip at full speed — aerial'], tip:'Build speed with the slope. A mistimed trick costs a fall.', duration:35, targets:[400,1000,1800], color:'#ef9b77' },
  { id:'bag', name:'Pocket Gravity', subtitle:'FOOTBAG', location:'02 / HARBOR STEPS', controls:['← → — move under the bag','Space as bag reaches feet — kick','↑ near head — header','↓ while bag is high — turn; then kick'], tip:'Wait for the bag to fall. Turning between contacts adds a combo bonus.', duration:35, targets:[250,600,1100], color:'#e2b94f' },
  { id:'surf', name:'Glasswater', subtitle:'SURFING', location:'03 / CRESCENT BREAK', controls:['← → — rotate board heading','Hold Space + turn — sharper carve','Ride over the lip; turn downhill before landing'], tip:'Use the whole face. Score more near the curl, but stay ahead of the foam.', duration:35, targets:[350,800,1400], color:'#75c4c0' },
  { id:'skate', name:'Boardwalk Beat', subtitle:'ROLLER SKATING', location:'04 / PALM PROMENADE', controls:['Alternate ↑ ↓ — push with each foot','← → — change lane','Hold Space — squat under beach balls','Release Space — jump cracks / cones'], tip:'Three lanes, three falls. A jump earns twice the avoidance score.', duration:40, targets:[150,350,650], color:'#b0b590' },
  { id:'bmx', name:'Dustline', subtitle:'BMX', location:'05 / OCHRE RIDGE', controls:['Tap → repeatedly — pedal','← — brake','Space — hop; ramps launch automatically','Hold ↑ / ↓ in air — rotate; release level'], tip:'Land within 35° of level. Ramp airtime is enough for a full flip.', duration:40, targets:[300,850,1600], color:'#d9a771' },
  { id:'disc', name:'Last Light', subtitle:'FLYING DISC', location:'06 / DUNE FIELD', controls:['Space — start backswing','Space in green — set power; Space again — release','← → — run catcher under the landing marker','↑ — overhead catch / Space — dive near disc'], tip:'Three throws. Time both meters, then meet the falling disc with your hands.', duration:60, targets:[300,750,1250], color:'#b3a6c8' },
];
export const info = (id: SportId): SportInfo => SPORTS.find(s => s.id === id)!;
export abstract class Run {
  abstract readonly id: SportId;
  time = 0; score = 0; falls = 0; done = false; message = 'Find your rhythm.'; messageTime = 0; cooldown = 0;
  readonly maxFalls = 3;
  abstract update(dt: number, input: Input): void;
  abstract get status(): string;
  step(dt: number, input: Input): void {
    if (this.done) return;
    this.time += dt; this.messageTime = Math.max(0, this.messageTime-dt); this.cooldown = Math.max(0,this.cooldown-dt);
    this.update(dt,input);
    if (this.time >= info(this.id).duration) { this.time = info(this.id).duration; this.finish('Time is up'); }
  }
  points(amount: number, label: string): void { this.score += Math.round(amount); this.say(`+${Math.round(amount)} ${label}`); }
  say(label: string): void { this.message=label; this.messageTime=1.8; }
  bail(label: string): void { if(this.cooldown>0 || this.done) return; this.falls++; this.cooldown=1; this.say(label); if(this.falls>=this.maxFalls) this.finish('Three falls — run complete'); }
  finish(label: string): void { this.done=true; this.say(label); }
}
export class Pipe extends Run {
  readonly id='pipe'; phase=-Math.PI/2; energy=.64; plant=-1; lipScored=false;
  get position(): number { return Math.sin(this.phase)*this.energy; }
  get ascending(): boolean { return Math.sin(this.phase)*Math.cos(this.phase)>0; }
  get status(): string { return `${Math.round(this.energy*100)}% momentum · ${this.ascending?'↑ PUMP UP':'↓ PUMP DOWN'}`; }
  update(dt:number,i:Input):void {
    const pump=i.held.has(this.ascending?'ArrowUp':'ArrowDown');
    this.energy=clamp(this.energy+(pump?.12:-.022)*dt,.4,1.12);
    this.phase+=dt*(1.5+this.energy*.6);
    const lip=Math.abs(this.position)>.82;
    if(Math.abs(this.position)<.65) this.lipScored=false;
    if(this.cooldown>0) { this.plant=-1; return; }
    if(i.pressed.has('KeyX')) { if(lip&&!this.lipScored) {this.plant=this.time;this.say('Handplant… release X in 0.2–0.7s');} else this.bail('Missed the coping'); }
    if(this.plant>=0 && (i.released.has('KeyX')||this.time-this.plant>.7)) {
      const held=this.time-this.plant; this.plant=-1;
      if(held>=.2&&held<=.7) {this.points(300+held*300,'handplant');this.lipScored=true;} else this.bail('Handplant lost balance');
    }
    if(i.pressed.has('Space')&&!this.lipScored) {
      if(lip) {this.points(Math.abs(this.position)>1?450:180,Math.abs(this.position)>1?'aerial turn':'kick turn');this.lipScored=true;}
      else {this.bail('Too low — wait for the lip'); this.energy=.64;}
    }
  }
}
export class Bag extends Run {
  readonly id='bag'; player=480; x=480; y=310; vy=-160; vx=0; combo=0; turned=false; facing=1; contacts=0; reset=0;
  get status():string{return `Chain ${this.combo} · ${this.contacts} contacts · ${this.facing===1?'front':'back'} facing`;}
  update(dt:number,i:Input):void {
    this.player=clamp(this.player+((i.held.has('ArrowRight')?1:0)-(i.held.has('ArrowLeft')?1:0))*250*dt,90,870);
    if(this.reset>0){this.reset-=dt;if(this.reset<=0){this.x=this.player;this.y=300;this.vy=-180;this.vx=0;}return;}
    this.vy+=360*dt;this.y+=this.vy*dt;this.x+=this.vx*dt;
    if(this.x<80||this.x>880)this.vx*=-1;
    if(i.pressed.has('ArrowDown')&&this.y<300&&!this.turned){this.turned=true;this.facing*=-1;this.say('Half turn — complete the next contact');}
    const near=Math.abs(this.x-this.player)<58;
    const kick=i.pressed.has('Space')&&this.y>345&&this.y<425&&this.vy>0&&near;
    const header=i.pressed.has('ArrowUp')&&this.y>300&&this.y<345&&this.vy>0&&near;
    if(kick||header){this.combo++;this.contacts++;this.points((header?45:20)+Math.min(10,this.combo)*5+(this.turned?100:0),this.turned?'turn combo':header?'header':'clean kick');this.vy=header?-250:-310;this.vx=(this.contacts%2?1:-1)*35;this.turned=false;}
    else if(i.pressed.has('Space'))this.say('Wait until the bag is near your feet');
    if(this.y>438){this.combo=0;this.turned=false;this.reset=.75;this.time+=1;this.say('Dropped — chain reset, 1 second lost');}
  }
}
export class Surf extends Run {
  readonly id='surf'; x=490; depth=.55; heading=0; air=0; carve=0; lastTurn=0; floatScore=0;
  get status():string{return `${this.air>0?'AIR — TURN DOWN':this.x<300?'NEAR THE CURL · ×3':'OPEN FACE'} · heading ${Math.round(this.heading*180/Math.PI)}°`;}
  update(dt:number,i:Input):void {
    if(this.cooldown>0)return;
    const turn=(i.held.has('ArrowRight')?1:0)-(i.held.has('ArrowLeft')?1:0);
    const sharp=i.held.has('Space');this.heading+=turn*dt*(sharp?2.8:1.6);
    this.heading=((this.heading+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
    if(this.air>0){this.air-=dt;if(this.air<=0){if(Math.sin(this.heading)>.15){this.depth=.15;this.points(300,'aerial re-entry');}else this.wipe('Bad re-entry angle');}return;}
    this.depth+=Math.sin(this.heading)*dt*(sharp?.28:.38);
    this.x+=((Math.cos(this.heading)*65-49)*(sharp?.7:1))*dt;this.x=Math.min(820,this.x);
    this.floatScore+=dt*(this.x<300?30:6);
    if(this.floatScore>=1){const whole=Math.floor(this.floatScore);this.score+=whole;this.floatScore-=whole;}
    if(turn!==0){this.carve+=dt;if(this.carve>.65&&turn!==this.lastTurn){this.points(this.x<300?150:60,'cutback');this.lastTurn=turn;this.carve=0;}}
    if(this.depth<.08){this.air=1;this.depth=.08;this.say('Above the lip — steer downhill to re-enter');}
    if(this.depth>1||this.x<150)this.wipe(this.x<150?'Caught by the curl':'Too far into the flats');
  }
  wipe(label:string):void{this.bail(label);this.x=490;this.depth=.55;this.heading=0;this.air=0;this.carve=0;this.lastTurn=0;}
}
export interface Obstacle { at:number; lane:number; kind:'crack'|'cone'|'ball'; passed:boolean }
export class Skate extends Run {
  readonly id='skate'; distance=0; speed=65; lane=1; jump=0; squat=false; lastStride='';
  obstacles:Obstacle[]=[{at:260,lane:-1,kind:'crack',passed:false},{at:490,lane:1,kind:'ball',passed:false},{at:720,lane:0,kind:'cone',passed:false},{at:940,lane:-1,kind:'crack',passed:false},{at:1170,lane:2,kind:'ball',passed:false},{at:1420,lane:1,kind:'cone',passed:false},{at:1650,lane:-1,kind:'crack',passed:false},{at:1870,lane:0,kind:'ball',passed:false}];
  get status():string{return `${Math.round(this.distance)} / 2100 m · ${Math.round(this.speed)} speed · ${this.jump>0?'JUMP':this.squat?'SQUAT':'ROLL'}`;}
  update(dt:number,i:Input):void {
    for(const key of ['ArrowUp','ArrowDown'] as const)if(i.pressed.has(key)&&key!==this.lastStride){this.speed=Math.min(140,this.speed+14);this.lastStride=key;}
    this.speed=Math.max(45,this.speed-5*dt);
    this.lane=clamp(this.lane+((i.held.has('ArrowRight')?1:0)-(i.held.has('ArrowLeft')?1:0))*dt*3,0,2);
    if(i.released.has('Space')&&this.squat&&this.jump<=0){this.jump=.85;this.say('Jump!');}
    this.squat=i.held.has('Space')&&this.jump<=0;this.jump=Math.max(0,this.jump-dt);
    if(this.cooldown>0)return;
    this.distance+=this.speed*dt;
    for(const o of this.obstacles)if(!o.passed&&this.distance>=o.at){o.passed=true;const same=o.lane<0||Math.abs(this.lane-o.lane)<.48;const high=this.jump>.1&&this.jump<.75;
      const safe=!same||(o.kind==='ball'?this.squat:high);
      if(safe)this.points(!same?20:high?80:40,!same?'lane dodge':o.kind==='ball'?'low roll':'cleared obstacle');else {this.bail(o.kind==='ball'?'Beach ball — squat under it':'Obstacle — release Space to jump');this.speed=50;}}
    if(this.distance>=2100){this.points(Math.max(0,40-this.time)*12,'finish bonus');this.finish('Promenade complete');}
  }
}
export class BMX extends Run {
  readonly id='bmx'; distance=0; speed=75; height=0; vy=0; angle=0; rotation=0; hops=0; nextRock=380; nextRamp=650;
  get status():string{return `${Math.round(this.distance)} / 2400 m · ${Math.round(this.speed)} speed · ${this.height>0?`${Math.round(this.angle*180/Math.PI)}° pitch`:'ON DIRT'}`;}
  update(dt:number,i:Input):void {
    if(this.cooldown>0)return;
    if(i.pressed.has('ArrowRight'))this.speed=Math.min(155,this.speed+17);
    this.speed=clamp(this.speed+(i.held.has('ArrowLeft')?-90:-4)*dt,35,155);
    const old=this.distance;this.distance+=this.speed*dt;
    if(this.height<=0&&i.pressed.has('Space')){this.vy=180;this.height=.1;this.rotation=0;this.angle=0;this.hops++;}
    if(old<this.nextRamp&&this.distance>=this.nextRamp){this.vy=370;this.height=Math.max(this.height,.1);this.rotation=0;this.angle=0;this.nextRamp+=650;this.say('Ramp launch — ↑ or ↓ to rotate');}
    if(this.height>0){const spin=(i.held.has('ArrowDown')?1:0)-(i.held.has('ArrowUp')?1:0);this.angle+=spin*dt*4.5;this.rotation+=Math.abs(spin)*dt*4.5;this.vy-=300*dt;this.height+=this.vy*dt;
      if(this.height<=0){this.height=0;const level=Math.abs(Math.atan2(Math.sin(this.angle),Math.cos(this.angle)))<.61;
        if(level){this.points(this.rotation>5.7?500:this.rotation>.6?150:60,this.rotation>5.7?'full flip landed':'level landing');}else{this.bail('Off balance landing — release level');this.speed=55;}this.angle=0;}}
    if(this.distance>=this.nextRock){if(this.height>22)this.points(100,'rock cleared');else {this.bail('Rock strike — hop earlier');this.speed=55;}this.nextRock+=540;}
    if(this.distance>=2400){this.points(Math.max(0,40-this.time)*18,'finish bonus');this.finish('Ridge complete');}
  }
}
export type DiscStage='ready'|'backswing'|'release'|'flight'|'between';
export class Disc extends Run {
  readonly id='disc'; stage:DiscStage='ready'; meter=0; power=.5; accuracy=.5; throws=0; flight=0; x=150; y=350; target=690; catcher=690; dive=0; wait=0; catches=0;
  get status():string{return `Throw ${Math.min(3,this.throws+1)} / 3 · ${this.stage==='flight'?'CHASE THE LANDING MARKER':this.stage==='backswing'?'SPACE IN GREEN → POWER':this.stage==='release'?'SPACE IN GREEN → RELEASE':this.stage==='between'?'NEXT THROW…':'SPACE TO BEGIN'}`;}
  update(dt:number,i:Input):void {
    if(this.stage==='between'){this.wait-=dt;if(this.wait<=0){if(this.throws>=3)this.finish('Three throws complete');else{this.stage='ready';this.meter=0;this.catcher=690;}}return;}
    if(this.stage==='backswing'||this.stage==='release')this.meter=(this.meter+dt*.65)%1;
    if(this.stage==='flight'){
      this.flight+=dt;this.catcher=clamp(this.catcher+((i.held.has('ArrowRight')?1:0)-(i.held.has('ArrowLeft')?1:0))*260*dt,80,890);
      this.dive=Math.max(0,this.dive-dt);if(i.pressed.has('Space'))this.dive=.5;
      const u=clamp(this.flight/3.2,0,1);this.x=150+(this.target-150)*u;this.y=350-Math.sin(u*Math.PI)*210;
      const overhead=i.held.has('ArrowUp')&&this.y>270&&this.y<350;
      const diving=this.dive>0&&this.y>330;
      if(u>.65&&Math.abs(this.x-this.catcher)<(diving?65:38)&&(overhead||diving)){
        this.catches++;this.points((diving?300:220)+Math.round(this.power*150)+Math.round(this.accuracy*100),diving?'diving catch':'overhead catch');this.endThrow();
      }else if(u>=1){this.say('Missed — meet the disc with ↑ or a dive');this.endThrow();}return;
    }
    if(i.pressed.has('Space')){
      if(this.stage==='ready'){this.stage='backswing';this.meter=0;this.say('Set power in the green band');}
      else if(this.stage==='backswing'){this.power=clamp(1-Math.abs(this.meter-.72)*1.6,.15,1);this.stage='release';this.meter=0;this.say('Now release in the green band');}
      else if(this.stage==='release'){this.accuracy=clamp(1-Math.abs(this.meter-.72)*2,0,1);this.target=clamp(400+this.power*340+(this.accuracy-.8)*160,360,850);this.stage='flight';this.flight=0;this.x=150;this.y=350;this.say('Run to marker; ↑ to reach or Space to dive');}
    }
  }
  endThrow():void{this.throws++;this.stage='between';this.wait=1.2;}
}
export type SportRun=Pipe|Bag|Surf|Skate|BMX|Disc;
export function createRun(id:SportId):SportRun{switch(id){case'pipe':return new Pipe();case'bag':return new Bag();case'surf':return new Surf();case'skate':return new Skate();case'bmx':return new BMX();case'disc':return new Disc();}}
