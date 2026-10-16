import { Pipe,Bag,Surf,Skate,BMX,Disc, clamp, type SportRun } from './sports';
type C=CanvasRenderingContext2D;
const ink='#163b46', cream='#fcf2d8', coral='#e97758', gold='#e7bd59', teal='#4d9c9c';
function line(c:C,points:number[][],color=ink,width=3):void{c.beginPath();points.forEach((p,i)=>{if(i===0)c.moveTo(p[0]!,p[1]!);else c.lineTo(p[0]!,p[1]!);});c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function circle(c:C,x:number,y:number,r:number,color:string):void{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
function rect(c:C,x:number,y:number,w:number,h:number,color:string):void{c.fillStyle=color;c.fillRect(x,y,w,h);}
function text(c:C,t:string,x:number,y:number,size=14,color=ink):void{c.fillStyle=color;c.font=`600 ${size}px monospace`;c.fillText(t,x,y);}
function palm(c:C,x:number,y:number,s=1):void{c.save();c.translate(x,y);c.scale(s,s);line(c,[[0,0],[-7,-65],[4,-137]],ink,7);for(const [dx,dy]of ([[-65,-22],[-54,-54],[2,-59],[55,-49],[68,-9]] as const)){c.beginPath();c.moveTo(4,-137);c.quadraticCurveTo(dx*.7,-177+dy*.3,dx,-137+dy);c.quadraticCurveTo(dx*.6,-142+dy*.3,4,-137);c.fillStyle=ink;c.fill();}c.restore();}
function bird(c:C,x:number,y:number):void{line(c,[[x-10,y],[x-5,y-4],[x,y],[x+5,y-4],[x+10,y]],ink,2);}
function sky(c:C,t:number,theme='sea'):void{
  rect(c,0,0,960,480,cream);circle(c,770,86,58,theme==='dirt'?'#e7aa77':gold);
  for(let j=0;j<5;j++)rect(c,710,63+j*15,120,3,cream);
  c.fillStyle=theme==='dirt'?'#d3a27c':'#b3c9bc';c.beginPath();c.moveTo(0,220);c.bezierCurveTo(180,110,220,210,390,175);c.bezierCurveTo(520,142,610,240,960,185);c.lineTo(960,310);c.lineTo(0,310);c.fill();
  if(theme!=='dirt'){rect(c,0,235,960,115,'#7bb6b0');for(let j=0;j<6;j++){const off=Math.sin(t*.3+j)*22;line(c,[[50+off,251+j*15],[240+off,251+j*15]],'#c4dfc9',2);line(c,[[600-off,259+j*14],[820-off,259+j*14]],'#c4dfc9',2);}}
  bird(c,400+Math.sin(t*.3)*30,75);bird(c,435+Math.sin(t*.3)*30,95);
}
function person(c:C,x:number,y:number,opts:{scale?:number;tilt?:number;pose?:string;facing?:number;shirt?:string}={}):void{
 c.save();c.translate(x,y);c.scale(opts.facing??1,1);c.rotate(opts.tilt??0);c.scale(opts.scale??1,opts.scale??1);
 const pose=opts.pose??'ride';const squat=pose==='squat';const headY=squat?-35:-66;
 // Shadowed limbs and a contrasting block shirt keep the figure readable at play scale.
 line(c,[[0,squat?-23:-48],[-9,-24],[-20,-4]],ink,8);line(c,[[0,squat?-23:-48],[14,-22],[25,-3]],ink,8);
 line(c,[[-2,headY+18],[-8,headY+38]],opts.shirt??coral,18);
 if(pose==='catch') {line(c,[[0,headY+22],[-16,headY-5],[-8,headY-25]],ink,6);line(c,[[3,headY+22],[18,headY-4],[9,headY-26]],ink,6);}
 else if(pose==='kick'){line(c,[[0,headY+22],[-24,headY+31]],ink,6);line(c,[[0,-24],[22,-22],[38,-34]],ink,8);}
 else{line(c,[[0,headY+22],[21,headY+30],[32,headY+17]],ink,6);line(c,[[-5,headY+20],[-22,headY+29]],ink,6);}
 circle(c,0,headY,12,'#c58967');c.fillStyle=ink;c.beginPath();c.arc(-2,headY-4,12,Math.PI,Math.PI*2.1);c.fill();rect(c,1,headY-3,13,4,ink);line(c,[[-23,-2],[-10,-2]],cream,5);line(c,[[19,-1],[32,-1]],cream,5);c.restore();
}
function board(c:C,x:number,y:number,angle=0):void{c.save();c.translate(x,y);c.rotate(angle);line(c,[[-32,-4],[-24,0],[26,0],[32,-5]],ink,5);circle(c,-20,7,5,ink);circle(c,20,7,5,ink);c.restore();}
export function drawCoast(c:C,t=0):void{
 sky(c,t);rect(c,0,345,960,135,'#dfb879');c.fillStyle='#e97859';c.beginPath();c.moveTo(0,402);c.bezierCurveTo(310,310,390,480,960,340);c.lineTo(960,390);c.bezierCurveTo(390,520,290,380,0,452);c.fill();
 for(let j=0;j<9;j++)line(c,[[j*120-50,421],[j*120-20,418]],cream,3);
 palm(c,90,360,1.5);palm(c,890,390,1.9);palm(c,185,320,.7);
 person(c,465,369,{scale:1.15,tilt:.16});board(c,465,373,.07);
 person(c,650,313,{scale:.6,pose:'catch',shirt:teal});circle(c,650,247,5,coral);
 text(c,'THE COAST IS YOUR PLAYGROUND',290,450,18);
}
export function draw(c:C,r:SportRun):void{
 c.clearRect(0,0,960,480);
 if(r instanceof Pipe)drawPipe(c,r);
 else if(r instanceof Bag)drawBag(c,r);
 else if(r instanceof Surf)drawSurf(c,r);
 else if(r instanceof Skate)drawSkate(c,r);
 else if(r instanceof BMX)drawBMX(c,r);
 else if(r instanceof Disc)drawDisc(c,r);
 // Printed grain, generated deterministically, with no external texture assets.
 c.fillStyle='#163b4607';for(let i=0;i<160;i++)c.fillRect((i*317)%960,(i*137)%480,2,2);
 if(r.cooldown>0&&!(r instanceof Bag)){c.fillStyle='#fcf2d880';c.fillRect(0,0,960,480);text(c,'BAIL — FIND YOUR FEET',350,225,20);}
}
function drawPipe(c:C,r:Pipe):void{
 sky(c,r.time);palm(c,70,285,.85);palm(c,900,285,1.2);rect(c,0,300,960,180,'#c6b99e');
 // The fixed side camera shows both coping edges and the full U-shaped surface.
 c.beginPath();c.moveTo(110,190);c.lineTo(170,190);c.bezierCurveTo(170,405,290,421,480,421);c.bezierCurveTo(670,421,790,405,790,190);c.lineTo(850,190);c.lineTo(850,468);c.lineTo(110,468);c.closePath();c.fillStyle='#df9772';c.fill();c.strokeStyle=ink;c.lineWidth=4;c.stroke();
 c.beginPath();c.moveTo(170,190);c.bezierCurveTo(170,405,290,421,480,421);c.bezierCurveTo(670,421,790,405,790,190);c.strokeStyle=cream;c.lineWidth=5;c.stroke();
 line(c,[[110,185],[177,185]],ink,6);line(c,[[783,185],[850,185]],ink,6);
 line(c,[[480,410],[480,450]],cream,2);
 const pos=r.position;const x=480+pos*305;const y=416-Math.pow(Math.min(1.1,Math.abs(pos)),2)*230;
 const tilt=clamp(pos*-.8,-1,1);c.save();c.translate(x,y);c.rotate(tilt);if(r.plant>=0){c.rotate(Math.PI);person(c,0,55,{scale:.78});}else person(c,0,-8,{scale:.8,pose:'ride'});board(c,0,0);c.restore();
 text(c,'LIP',190,180);text(c,'LIP',740,180);text(c,'PUMP THROUGH THE TRANSITION',330,465,13);
 // Momentum meter and live pump cue.
 rect(c,30,30,180,10,'#163b4620');rect(c,30,30,180*Math.min(1,r.energy),10,coral);text(c,r.ascending?'↑ PUMP UP':'↓ PUMP DOWN',30,65,17);
}
function drawBag(c:C,r:Bag):void{
 sky(c,r.time);rect(c,0,350,960,130,'#d4c9ac');for(let k=0;k<5;k++)line(c,[[0,360+k*28],[960,360+k*28]],'#b2b19b',2);
 // Harbor cranes and a railing establish a stationary, full body juggling view.
 for(let x=70;x<960;x+=130){line(c,[[x,270],[x,343]],ink,3);}line(c,[[0,270],[960,270]],ink,4);
 line(c,[[190,235],[190,140],[300,140],[245,195]],ink,4);line(c,[[245,140],[245,227]],ink,2);
 c.fillStyle='#163b4618';c.beginPath();c.ellipse(r.player,432,44,7,0,0,Math.PI*2);c.fill();
 person(c,r.player,425,{scale:1.4,facing:r.facing,pose:r.messageTime>1.4?'kick':'ride',shirt:teal});
 if(r.reset<=0){circle(c,r.x,r.y,9,coral);line(c,[[r.x-5,r.y-2],[r.x+5,r.y+2]],cream,2);circle(c,r.x,434,3,'#163b4644');}
 text(c,'HEADER ZONE',35,325,12);text(c,'KICK ZONE',35,405,12);line(c,[[170,345],[790,345]],'#163b4618',1);text(c,`CHAIN ${r.combo.toString().padStart(2,'0')}`,725,65,24);
}
function drawSurf(c:C,r:Surf):void{
 sky(c,r.time);rect(c,0,175,960,305,'#4d9c9c');
 // Broad side-on wave face, curled left edge; board heading is drawn explicitly.
 c.fillStyle='#2c767e';c.beginPath();c.moveTo(0,170);c.bezierCurveTo(170,115,310,160,310,240);c.bezierCurveTo(310,300,245,340,150,300);c.lineTo(0,480);c.fill();
 c.strokeStyle=cream;c.lineWidth=17;c.beginPath();c.moveTo(0,176);c.bezierCurveTo(168,118,310,157,310,238);c.bezierCurveTo(310,294,240,320,180,288);c.stroke();
 for(let row=0;row<9;row++){const yy=220+row*29;const off=Math.sin(r.time+row)*30;line(c,[[300+off,yy],[530+off,yy-14],[920,yy-23]],'#9dccc2',2);}
 const x=r.x;const y=175+r.depth*265-(r.air>0?Math.sin(r.air*Math.PI)*85:0);
 c.save();c.translate(x,y);c.rotate(r.heading);c.fillStyle=gold;c.beginPath();c.ellipse(0,0,42,12,0,0,Math.PI*2);c.fill();line(c,[[-25,0],[30,0]],cream,2);c.restore();person(c,x,y-6,{scale:.8,tilt:Math.sin(r.heading)*.5,shirt:coral});
 text(c,'LIP / AERIAL LINE',650,164,12);text(c,'FLATS — KEEP ABOVE',650,471,12,cream);text(c,'CURL ×3',35,382,16,cream);
}
function drawSkate(c:C,r:Skate):void{
 sky(c,r.time);rect(c,0,275,960,205,'#d5c6ab');
 for(let n=0;n<3;n++)line(c,[[0,315+n*57],[960,315+n*57]],cream,3);
 for(let n=0;n<12;n++){const x=((n*130-r.distance*.8)%1560+1560)%1560-200;line(c,[[x,280],[x,480]],'#b8b09a',1);}
 for(let n=0;n<5;n++){const x=((n*270-r.distance*.4)%1350+1350)%1350-160;palm(c,x,278,.8);}
 const py=310+r.lane*57;
 for(const o of r.obstacles){const x=250+(o.at-r.distance)*1.1;if(x<-50||x>1020||o.passed)continue;const y=o.lane<0?0:310+o.lane*57;
  if(o.kind==='crack'){for(let lane=0;lane<3;lane++)line(c,[[x,292+lane*57],[x-8,310+lane*57],[x+7,327+lane*57]],ink,7);}
  else if(o.kind==='ball'){circle(c,x,y-27,21,coral);line(c,[[x-20,y-27],[x+20,y-27]],cream,3);line(c,[[x,y-47],[x,y-7]],gold,4);}
  else{c.fillStyle=coral;c.beginPath();c.moveTo(x,y-36);c.lineTo(x-20,y);c.lineTo(x+20,y);c.fill();rect(c,x-10,y-18,20,7,cream);}}
 const lift=r.jump>0?Math.sin(r.jump/.85*Math.PI)*68:0;
 person(c,250,py-lift,{scale:.85,pose:r.squat?'squat':'ride',shirt:teal});for(const xx of [-17,25]){rect(c,250+xx-9,py-lift,22,5,coral);circle(c,250+xx-4,py-lift+8,4,ink);circle(c,250+xx+8,py-lift+8,4,ink);}
 text(c,'FINISH →',805,260,18);progress(c,r.distance/2100);
}
function terrain(x:number):number{return 375+Math.sin(x*.009)*18+Math.sin(x*.021)*9;}
function drawBMX(c:C,r:BMX):void{
 sky(c,r.time,'dirt');c.fillStyle='#b97851';c.beginPath();c.moveTo(0,480);for(let x=0;x<=960;x+=8)c.lineTo(x,terrain(r.distance+x-260));c.lineTo(960,480);c.fill();
 for(let n=0;n<7;n++){const x=((n*180-r.distance*.35)%1260+1260)%1260-100;line(c,[[x,300],[x,238],[x-15,246],[x-15,265]],'#647c62',8);line(c,[[x,267],[x+15,257],[x+15,248]],'#647c62',7);}
 for(let ramp=650;ramp<=1950;ramp+=650){const x=260+ramp-r.distance;if(x>-100&&x<1050){c.fillStyle=gold;c.beginPath();c.moveTo(x-80,terrain(ramp));c.lineTo(x,terrain(ramp)-48);c.lineTo(x+12,terrain(ramp));c.fill();line(c,[[x-80,terrain(ramp)],[x,terrain(ramp)-48]],ink,3);}}
 for(let rock=380;rock<=2400;rock+=540){const x=260+rock-r.distance;if(x>-30&&x<1000){c.fillStyle='#634f43';c.beginPath();c.moveTo(x-20,terrain(rock));c.lineTo(x-12,terrain(rock)-25);c.lineTo(x+10,terrain(rock)-32);c.lineTo(x+24,terrain(rock));c.fill();}}
 c.save();c.translate(260,terrain(r.distance)-r.height);c.rotate(r.angle);for(const x of [-31,31]){circle(c,x,-13,21,ink);circle(c,x,-13,16,cream);line(c,[[x-14,-13],[x+14,-13]],ink,1);}
 line(c,[[-31,-13],[-11,-44],[7,-13],[-31,-13],[21,-40],[31,-13],[7,-13]],coral,5);line(c,[[21,-40],[17,-52],[33,-52]],ink,4);person(c,-6,-31,{scale:.8,tilt:.4,shirt:teal});c.restore();progress(c,r.distance/2400);text(c,'LEVEL YOUR WHEELS BEFORE LANDING',280,455,14,cream);
}
function drawDisc(c:C,r:Disc):void{
 sky(c,r.time);rect(c,0,330,960,150,'#a6b79a');for(let k=0;k<12;k++)line(c,[[k*90,480],[k*90+110,330]],'#c7cfab',2);
 line(c,[[80,365],[890,365]],cream,2);for(let k=0;k<9;k++)text(c,`${k*10}`,120+k*90,390,12);
 person(c,150,350,{scale:.9,pose:r.stage==='ready'?'ride':'kick'});
 if(r.stage==='flight'||r.stage==='between'){
  line(c,[[r.target,325],[r.target,359]],coral,3);c.strokeStyle=coral;c.lineWidth=3;c.beginPath();c.ellipse(r.target,360,27,8,0,0,Math.PI*2);c.stroke();
  person(c,r.catcher,r.dive>0?365:350,{scale:1,pose:'catch',tilt:r.dive>0?1.2:0,shirt:teal});
  if(r.stage==='flight'){c.fillStyle=gold;c.beginPath();c.ellipse(r.x,r.y,18,5,Math.sin(r.flight*12)*.15,0,Math.PI*2);c.fill();line(c,[[r.x-12,r.y],[r.x+12,r.y]],cream,1);}
 }else person(c,r.catcher,350,{scale:1,shirt:teal});
 if(r.stage==='backswing'||r.stage==='release'){
  text(c,r.stage==='backswing'?'01 / SET POWER':'02 / RELEASE',290,50,20);rect(c,280,75,400,24,'#d5b09a');rect(c,280+400*.6,75,400*.24,24,'#7fa68b');line(c,[[280+r.meter*400,68],[280+r.meter*400,107]],ink,5);text(c,'SPACE IN GREEN',388,130,16);
 }else text(c,r.stage==='flight'?'CHASE THE MARKER · MEET IT WITH YOUR HANDS':'THREE THROWS. MAKE THEM COUNT.',260,65,18);
}
function progress(c:C,value:number):void{rect(c,30,30,240,6,'#163b4620');rect(c,30,30,240*clamp(value,0,1),6,ink);}
