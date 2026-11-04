import raw from '@backend/services/odyssey/course.json';
export type Question={id:string;type:'choice'|'match'|'order';prompt:string;options?:string[];answer?:number;pairs?:string[][];items?:string[];explanation:string};
export type Lesson={id:string;unit:number;title:string;sub:string;icon:string;concept:string;sections?:{title:string;text:string;example:string;pitfall:string}[];tip:string;activity:string;questions:Question[]};
export type Unit={id:number;title:string;description:string;lessons:Lesson[]};
export const course=raw as unknown as {version:string;title:string;subtitle:string;price:number;currency:string;units:Unit[];sources:{title:string;url:string}[]};
export const allLessons=course.units.flatMap(u=>u.lessons);
export const questions=new Map(allLessons.flatMap(l=>l.questions.map(q=>[q.id,q] as const)));
export const LESSON_PASS=8,EXAM_COUNT=25,EXAM_PASS=18;
export type Answer=number|number[];
export function grade(q:Question,a:unknown){if(q.type==='choice')return Number.isInteger(a)&&a===q.answer;if(!Array.isArray(a)||a.some(x=>!Number.isInteger(x)))return false;const n=q.type==='match'?q.pairs!.length:q.items!.length;return a.length===n&&a.every((v,i)=>v===i);}
export function correctAnswer(q:Question):Answer{return q.type==='choice'?q.answer!:Array.from({length:q.type==='match'?q.pairs!.length:q.items!.length},(_,i)=>i);}
export function publicQuestion(q:Question){const {answer,explanation,...rest}=q;return rest;}
export function shuffle<T>(items:T[]):T[]{const a=[...items];for(let i=a.length-1;i>0;i--){const random=new Uint32Array(1);crypto.getRandomValues(random);const j=random[0]%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a;}
export const syllabus=course.units.map(u=>({id:u.id,title:u.title,description:u.description,lessons:u.lessons.map(({id,title,sub})=>({id,title,sub}))}));
export function certificateEligible(completed:string[],examScore:number){return allLessons.every(l=>completed.includes(l.id))&&examScore>=EXAM_PASS;}
