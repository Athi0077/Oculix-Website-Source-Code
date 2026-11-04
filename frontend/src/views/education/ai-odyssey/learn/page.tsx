import {getChatGPTUser,chatGPTSignInPath} from '@backend/middleware/auth';
import {Heading} from '@frontend/components/shared';
import Learning from '@frontend/components/education/ai-odyssey/learning';
import '@frontend/assets/styles/education/ai-odyssey/odyssey.css';
export const dynamic='force-dynamic';
export const metadata={title:'AI Odyssey — My Learning'};
export default async function Page(){const u=await getChatGPTUser();if(!u)return <main><Heading label="AI ODYSSEY" title="Your learning journey starts here."><p>Sign in to save your progress. The course price is ₹199; payment is available on the course page after sign-in, with access activated after verification.</p><a className="button" href={chatGPTSignInPath('/education/ai-odyssey/learn')} target="_top">Sign in to your learning account</a><a className="button outline" href="/education/ai-odyssey">View syllabus</a></Heading></main>;return <Learning/>}
