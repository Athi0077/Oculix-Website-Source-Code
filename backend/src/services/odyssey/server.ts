import {db,admin} from '@backend/services/platform';
import {getChatGPTUser} from '@backend/middleware/auth';
import {allLessons,LESSON_PASS} from '@backend/services/odyssey/course';
export async function courseAccess(){const user=await getChatGPTUser();if(!user)return{user:null,isAdmin:false,allowed:false};const isAdmin=await admin();const enrol=await db().prepare("SELECT email FROM odyssey_enrolments WHERE email=? AND status='active'").bind(user.email.toLowerCase()).first();return{user,isAdmin,allowed:isAdmin||!!enrol};}
export async function progressFor(userId:string){return (await db().prepare('SELECT lesson_id,best_score,attempts,updated_at FROM odyssey_progress WHERE user_id=?').bind(userId).all<{lesson_id:string;best_score:number;attempts:number;updated_at:string}>()).results;}
export async function completedFor(userId:string){return(await progressFor(userId)).filter(p=>p.best_score>=LESSON_PASS).map(p=>p.lesson_id);}
export async function canOpenLesson(userId:string,lessonId:string,isAdmin:boolean){const l=allLessons.find(l=>l.id===lessonId);if(!l)return false;if(isAdmin||l.unit===1)return true;const done=await completedFor(userId);return allLessons.filter(p=>p.unit<l.unit).every(p=>done.includes(p.id));}
export const noStore={'Cache-Control':'private, no-store'};
