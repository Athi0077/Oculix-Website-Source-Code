import {admin} from '@backend/services/platform';
import {Heading} from '@frontend/components/shared';
import CourseAdmin from '@frontend/components/admin/courses/panel';
import '@frontend/assets/styles/education/ai-odyssey/odyssey.css';
export const dynamic='force-dynamic';
export const metadata={title:'AI Odyssey — Course Administration'};
export default async function Page(){if(!await admin())return <main><Heading label="ADMINISTRATION" title="Unlock your admin panel first."><p>AI Odyssey’s full course is available at no cost after you open Oculix administration.</p><a className="button" href="/admin11122010">Open admin panel →</a></Heading></main>;return <main className="wrap odyssey ao-app"><span className="eyebrow">OCULIX EDUCATION · ADMINISTRATION</span><h1>AI Odyssey</h1><p>10 units · 60 subtopics · 600 practice questions · ₹199 course price</p><div className="notice"><strong>Your full-course access is free.</strong><p>Explore every unit and lesson without checkout. Certificate eligibility still requires completion and a passing final assessment.</p><a className="button" href="/education/ai-odyssey/learn">Open the complete course →</a></div><CourseAdmin/><a className="textlink" href="/admin11122010">← Main admin panel</a></main>}
