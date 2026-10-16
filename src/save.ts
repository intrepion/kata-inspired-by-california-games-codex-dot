import { SPORTS, type SportId } from './sports';
export const SAVE_KEY='tideline-six:v1';
export interface Save { version:1; records:Partial<Record<SportId,number>>; bestMeet:number; sound:boolean }
export interface StoragePort { getItem(key:string):string|null;setItem(key:string,value:string):void }
export const freshSave=():Save=>({version:1,records:{},bestMeet:0,sound:false});
export function loadSave(storage:StoragePort):Save{
  try{const raw:unknown=JSON.parse(storage.getItem(SAVE_KEY)??'null');if(!raw||typeof raw!=='object')return freshSave();
    const r=raw as Record<string,unknown>;if(r.version!==1)return freshSave();const out=freshSave();
    if(r.records&&typeof r.records==='object')for(const sport of SPORTS){const v=(r.records as Record<string,unknown>)[sport.id];if(typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1_000_000)out.records[sport.id]=Math.floor(v);}
    if(typeof r.bestMeet==='number'&&Number.isInteger(r.bestMeet)&&r.bestMeet>=0&&r.bestMeet<=30)out.bestMeet=r.bestMeet;
    if(typeof r.sound==='boolean')out.sound=r.sound;return out;
  }catch{return freshSave();}
}
export function writeSave(storage:StoragePort,save:Save):boolean{try{storage.setItem(SAVE_KEY,JSON.stringify(save));return true;}catch{return false;}}
