import type { Metadata } from 'next';
import '@frontend/assets/styles/globals.css';
import OculixChat from '@frontend/components/oculix-chat';
import VisitTracker from '@frontend/components/visit-tracker';
import GoogleSessionRefresh from '@frontend/components/google-session-refresh';
import { Header, Footer } from '@frontend/components/shared';
export const metadata:Metadata={title:{default:'Oculix — Step into the future with us',template:'%s | Oculix'},description:'Immersive VR experiences, VirVerse VR labs, Humatrix humanoid robotics, AI workshops and creative production. Based in Salem, Tamil Nadu.',icons:{icon:'/oculix-original-icon.svg',shortcut:'/oculix-original-icon.svg',apple:'/oculix-original-icon.png'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><GoogleSessionRefresh/><VisitTracker/><Header/>{children}<Footer/><OculixChat/></body></html>}
