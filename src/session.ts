import { SPORTS, info, type SportId } from './sports';
export type Mode='practice'|'competition';
export interface Result { id:SportId; score:number; falls:number; medal:number }
export function medal(id:SportId,score:number):number{const [bronze,silver,gold]=info(id).targets;return score>=gold?5:score>=silver?3:score>=bronze?1:0;}
export class Meet {
  readonly results:Result[]=[];
  constructor(readonly mode:Mode,readonly first:SportId='pipe'){}
  get current():SportId{return this.mode==='practice'?this.first:SPORTS[this.results.length]?.id??'disc';}
  get done():boolean{return this.results.length===(this.mode==='practice'?1:6);}
  get total():number{return this.results.reduce((sum,r)=>sum+r.medal,0);}
  complete(id:SportId,score:number,falls:number):Result{
    if(this.done||id!==this.current)throw new Error('Event completed out of order');
    const result={id,score:Math.max(0,Math.floor(score)),falls,medal:medal(id,score)};this.results.push(result);return result;
  }
}
