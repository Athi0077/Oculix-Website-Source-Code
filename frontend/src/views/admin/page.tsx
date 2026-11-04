import AdminAccess from '@frontend/components/admin/access';
import {getChatGPTUser,chatGPTSignInPath} from '@backend/middleware/auth';
import {admin,adminIdentity,db,ADMIN_EMAIL} from '@backend/services/platform';
import {Heading} from '@frontend/components/shared';
import Dashboard from '@frontend/components/dashboard';
export const dynamic='force-dynamic';
export const metadata={title:'Administration'};
export default async function Page(){const u=await getChatGPTUser();if(!u)return <main><Heading label="Oculix administration" title="Team access."><p>Sign in with the Google account oculixofficial@gmail.com, then enter your administrator passcode.</p><a className="button" href={chatGPTSignInPath('/admin')} target="_top">Continue with Google</a></Heading></main>;if(!await adminIdentity())return <main><Heading label="Restricted access" title="Administrator access required."><p>This account does not have access to Oculix administration.</p><a className="button" href="/portal">Go to client portal</a></Heading></main>;if(!await admin()){const configured=await db().prepare('SELECT email FROM admin_security WHERE email=?').bind(ADMIN_EMAIL).first();return <main><Heading label="Oculix administration" title="Secure team access."><p>Signed in as {u.email}</p></Heading><AdminAccess setup={!configured}/></main>;}return <Dashboard name={u.displayName} email={u.email} isAdmin/>}
