import Exam from '@frontend/components/education/live-ai-lab/exam/exam';
import '@frontend/assets/styles/education/live-ai-lab/exam/exam.css';
export const metadata={title:'Live AI Lab Assessment | Oculix Education',robots:{index:false,follow:false}};
export default function Page(){return <main className="section"><div className="wrap lab-exam"><a className="textlink" href="/portal">← Back to my panel</a><span className="eyebrow" style={{display:'block',marginTop:28}}>OCULIX EDUCATION · LIVE AI LAB</span><h1>Your learning, put into practice.</h1><p className="muted">Post-webinar assessment · 15 questions · 20 marks</p><Exam/></div></main>}
