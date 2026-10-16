import { test,expect,type Page } from '@playwright/test';
async function open(page:Page):Promise<void>{await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.clock.pauseAt(new Date('2026-01-01T00:00:00.100Z'));await page.goto('/');await expect(page.getByRole('heading',{name:'A coast worth playing.'})).toBeVisible();}
async function practice(page:Page,id:string):Promise<void>{await page.locator(`[data-sport="${id}"]`).click();await page.getByRole('button',{name:/^Start /}).click();await expect(page.locator('#game')).toBeVisible();}
async function tick(page:Page,ms:number):Promise<void>{await page.clock.runFor(ms);}
async function tap(page:Page,key:string):Promise<void>{await page.keyboard.down(key);await tick(page,35);await page.keyboard.up(key);await tick(page,35);}
async function end(page:Page):Promise<void>{for(let n=0;n<65&&await page.locator('#game').count();n++)await tick(page,1000);await expect(page.getByText(/EVENT POINTS/)).toBeVisible();}
function monitor(page:Page):string[]{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));return errors;}
test('home renders six original event previews; responsive layout stays within viewport',async({page})=>{const errors=monitor(page);await open(page);await expect(page.locator('.event-card')).toHaveCount(6);await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await expect(page.locator('.event-card')).toHaveCount(6);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});expect(errors).toEqual([]);});
test('footbag: timed contacts, turn combo, pause, result and practice retry',async({page})=>{const errors=monitor(page);await open(page);await practice(page,'bag');await tick(page,1100);await tap(page,'Space');await tick(page,250);await tap(page,'ArrowDown');await page.keyboard.down('ArrowRight');await tick(page,160);await page.keyboard.up('ArrowRight');await tick(page,1180);await tap(page,'Space');await expect(page.locator('#feedback')).toContainText('turn combo');expect(Number((await page.locator('#score').innerText()).replaceAll(',',''))).toBeGreaterThanOrEqual(150);await page.keyboard.press('KeyP');const time=await page.locator('#time').innerText();await tick(page,5000);expect(await page.locator('#time').innerText()).toBe(time);await page.getByRole('button',{name:'Keep going'}).click();await end(page);await page.getByRole('button',{name:'Practice again'}).click();await page.keyboard.press('Enter');await end(page);expect(await page.evaluate(()=>localStorage.getItem('tideline-six:v1'))).toBeNull();expect(errors).toEqual([]);});
test('half-pipe: pumping enables lip scoring; low tricks consume falls',async({page})=>{
 const errors=monitor(page);await open(page);await practice(page,'pipe');let key='ArrowDown';await page.keyboard.down(key);let scored=false;
 for(let n=0;n<120;n++){
  const status=await page.locator('#sport-status').innerText();const next=status.includes('PUMP UP')?'ArrowUp':'ArrowDown';
  if(next!==key){await page.keyboard.up(key);key=next;await page.keyboard.down(key);}
  if(status.includes('WINDOW')){await tap(page,'Space');await expect(page.locator('#feedback')).toContainText(/kick turn|aerial turn/);scored=true;break;}
  await tick(page,100);
 }
 await page.keyboard.up(key);expect(scored).toBe(true);expect(Number(await page.locator('#score').innerText())).toBeGreaterThan(0);
 for(let n=0;n<150&&await page.locator('#game').count();n++){await tap(page,'Space');await tick(page,300);}
 await end(page);await expect(page.getByText('Three falls — run complete · 3 falls')).toBeVisible();expect(errors).toEqual([]);
});
test('surfing: cutback, aerial re-entry and wipeout are visible outcomes',async({page})=>{
 const errors=monitor(page);await open(page);await practice(page,'surf');
 await page.keyboard.down('ArrowLeft');await tick(page,700);await page.keyboard.up('ArrowLeft');await expect(page.locator('#feedback')).toContainText('cutback');
 await tick(page,1100);await expect(page.locator('#sport-status')).toContainText('AIR');
 await page.keyboard.down('ArrowRight');await tick(page,950);await page.keyboard.up('ArrowRight');await tick(page,150);
 await expect(page.locator('#feedback')).toContainText('aerial re-entry');expect(Number(await page.locator('#score').innerText())).toBeGreaterThan(300);
 await page.keyboard.down('ArrowRight');await tick(page,400);await page.keyboard.up('ArrowRight');await tick(page,4000);
 expect(parseInt(await page.locator('#attempts').innerText())).toBeGreaterThan(0);await end(page);expect(errors).toEqual([]);
});
test('skating: alternating strides, release jump, low roll and collisions',async({page})=>{
 const errors=monitor(page);await open(page);await practice(page,'skate');
 for(let n=0;n<6;n++){await tap(page,n%2?'ArrowDown':'ArrowUp');await tick(page,100);}
 while(parseInt(await page.locator('#sport-status').innerText())<220)await tick(page,50);
 await page.keyboard.down('Space');await tick(page,50);await page.keyboard.up('Space');await tick(page,450);
 await expect(page.locator('#feedback')).toContainText('cleared obstacle');expect(Number(await page.locator('#score').innerText())).toBe(80);
 await page.keyboard.down('Space');while(parseInt(await page.locator('#sport-status').innerText())<500)await tick(page,100);
 await expect(page.locator('#feedback')).toContainText('low roll');expect(Number(await page.locator('#score').innerText())).toBe(120);
 await page.keyboard.up('Space');await end(page);await expect(page.getByText(/3 falls/)).toBeVisible();expect(errors).toEqual([]);
});
test('BMX: pedal, obstacle hop, full ramp flip, bad landing and result',async({page})=>{
 const errors=monitor(page);await open(page);await practice(page,'bmx');
 for(let n=0;n<5;n++){await tap(page,'ArrowRight');await tick(page,100);}
 while(parseInt(await page.locator('#sport-status').innerText())<330)await tick(page,50);
 await tap(page,'Space');await tick(page,500);await expect(page.locator('#feedback')).toContainText('rock cleared');
 while(parseInt(await page.locator('#sport-status').innerText())<655)await tick(page,50);
 await page.keyboard.down('ArrowDown');await tick(page,1400);await page.keyboard.up('ArrowDown');await tick(page,1150);
 await expect(page.locator('#feedback')).toContainText('full flip landed');expect(Number((await page.locator('#score').innerText()).replaceAll(',',''))).toBeGreaterThanOrEqual(600);
 await tap(page,'Space');await page.keyboard.down('ArrowUp');await tick(page,300);await page.keyboard.up('ArrowUp');await tick(page,1000);
 expect(parseInt(await page.locator('#attempts').innerText())).toBeGreaterThan(0);await end(page);expect(errors).toEqual([]);
});
test('disc: green-meter throw, catcher movement and overhead catch, three attempts',async({page})=>{const errors=monitor(page);await open(page);await practice(page,'disc');await tap(page,'Space');await tick(page,1020);await tap(page,'Space');await tick(page,1020);await tap(page,'Space');await page.keyboard.down('ArrowRight');await tick(page,190);await page.keyboard.up('ArrowRight');await page.keyboard.down('ArrowUp');await tick(page,3300);await page.keyboard.up('ArrowUp');expect(Number((await page.locator('#score').innerText()).replaceAll(',',''))).toBeGreaterThan(0);for(let n=0;n<2;n++){await tick(page,1300);await tap(page,'Space');await tap(page,'Space');await tap(page,'Space');await tick(page,4600);}await end(page);expect(errors).toEqual([]);});
test('full meet progresses six events, saves records, reloads, restarts and isolates other saves',async({page})=>{const errors=monitor(page);await open(page);await page.evaluate(()=>localStorage.setItem('another-project:save','keep me'));await page.getByRole('button',{name:'Enter the six-event meet'}).click();for(let n=0;n<6;n++){await page.keyboard.press('Enter');await end(page);await page.getByRole('button',{name:n===5?'View meet results':'Next event'}).click();}await expect(page.getByText('One coast.Six stories.')).toBeVisible();await expect(page.locator('.scoreboard>div')).toHaveCount(6);const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tideline-six:v1')!));expect(Object.keys(saved.records)).toHaveLength(6);expect(saved.records.surf).toBeGreaterThan(0);await page.getByRole('button',{name:'Enter another meet'}).click();await expect(page.getByText(/MEET \/ EVENT 1 OF 6/)).toBeVisible();await page.reload();await expect(page.locator('[data-sport="surf"] .record strong')).not.toHaveText('—');await page.getByText('About the game & accessibility').click();await page.getByRole('button',{name:"Reset this game's records"}).click();expect(await page.evaluate(()=>localStorage.getItem('another-project:save'))).toBe('keep me');expect(errors).toEqual([]);});
