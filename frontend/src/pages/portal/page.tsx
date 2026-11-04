import {getChatGPTUser,chatGPTSignInPath} from '@backend/middleware/auth';
import {Heading} from '@frontend/components/shared';
import Dashboard from '@frontend/components/dashboard';
export const dynamic='force-dynamic';
export const metadata={title:'Client Portal'};
export default async function Page(){const u=await getChatGPTUser();return u?<Dashboard name={u.displayName} email={u.email}/>:<main><Heading label="Oculix client portal" title="Your projects. One place."><p>Track enquiries, view proposals, follow installation progress and request support.</p><a className="button" href={chatGPTSignInPath('/portal')} target="_top">Continue with Google</a></Heading></main>}
