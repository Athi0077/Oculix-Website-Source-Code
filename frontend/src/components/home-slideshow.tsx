'use client';
import {useEffect,useState} from 'react';

export const homeSlides=[
 {title:'Humatrix',label:'Humanoid robotics',text:'Robot sourcing, deployment, training and maintenance.',image:'/assets/g1.webp',alt:'Unitree humanoid robot',href:'/products/humatrix',button:'Explore Humatrix'},
 {title:'VirVerse',label:'Immersive learning',text:'VR headset installations and lab setups for your institution.',image:'/assets/quest3.webp',alt:'Meta Quest VR headset',href:'/products/virverse',button:'Explore VirVerse'},
 {title:'Robot Rentals for Events',label:'Powered by Humatrix',text:'Humanoid, robot dog and photobooth experiences for your event.',image:'/assets/rental-unitree-r1.jpg',alt:'Unitree R1 humanoid robot for event rentals',href:'/services/robot-rentals',button:'Explore Robot Rentals'},
 {title:'VR Solutions',label:'Custom virtual experiences',text:'Virtual tours, training and immersive experiences built around your goals.',image:'/assets/quest3s.webp',alt:'VR headset for custom virtual experiences',href:'/services/vr-solutions',button:'Explore VR Solutions'},
 {title:'VR Education Carnival',label:'Experience beyond the classroom',text:'Guided virtual reality learning for schools, colleges and organisations.',image:'/assets/carnival.jpg',alt:'Oculix VR educational carnival',href:'/services/vr-carnival',button:'Explore the Carnival'},
 {title:'AI to ASI Workshop',label:'The Next Era of Intelligence',text:'Explore artificial intelligence through explanations and demonstrations.',image:'/assets/workshop.webp',alt:'AI to ASI workshop artwork',href:'/services/ai-workshop',button:'Explore the Workshop'},
 {title:'Advertisement Production',label:'Oculix × Sivan Films',text:'Creative advertisement production shaped around your brand and audience.',image:'/assets/oculix-eye-logo.png',alt:'Oculix eye logo',href:'/services/advertisements',button:'Explore Advertisement Production'},
 {title:'Oculix Education',label:'Live AI Lab · ₹199',text:'14 November 2026 · 60-minute live AI webinar with Mithun S. Certificate awarded after passing the online exam.',image:'/assets/ai-future-experience.webp',alt:'Oculix educational programme artwork',href:'/education/live-ai-lab',button:'Register Now'},
 {title:'OITS',label:'A Unit of Oculix',text:'Custom websites, AI chatbots, voice assistants and planning tools.',image:'/assets/oits-logo.png',alt:'OITS logo',href:'/oits',button:'Explore OITS'}
];
export default function HomeSlideshow(){
 const [index,setIndex]=useState(0);
 const [paused,setPaused]=useState(false);
 const [focused,setFocused]=useState(false);
 useEffect(()=>{if(paused||focused)return;const timer=setTimeout(()=>setIndex(i=>(i+1)%homeSlides.length),5000);return()=>clearTimeout(timer)},[index,paused,focused]);
 const slide=homeSlides[index];
 const move=(delta:number)=>setIndex(i=>(i+delta+homeSlides.length)%homeSlides.length);
 return <section className="home-slideshow" aria-label="Oculix products and services slideshow" aria-roledescription="carousel" onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setFocused(false)}} onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}if(e.key==='ArrowRight'){e.preventDefault();move(1)}}}>
  <div className="home-slide-media" role="group" aria-roledescription="slide" aria-label={`${index+1} of ${homeSlides.length}: ${slide.title}`}>
   <img key={slide.image} src={slide.image} alt={slide.alt}/>
   <span className="home-slide-badge">{slide.label}</span>
   <div className="home-slide-copy"><h2>{slide.title}</h2><p>{slide.text}</p><a className="button" href={slide.href}>{slide.button}</a></div>
  </div>
  <button className="home-slide-arrow prev" type="button" aria-label="Previous slide" onClick={()=>move(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>
  <button className="home-slide-arrow next" type="button" aria-label="Next slide" onClick={()=>move(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
  <div className="home-slide-controls"><div className="home-slide-dots">{homeSlides.map((s,i)=><button key={s.href} type="button" aria-label={`Show ${s.title}`} aria-current={i===index?'true':undefined} onClick={()=>setIndex(i)}/>)}</div><button className="home-slide-pause" type="button" onClick={()=>setPaused(v=>!v)} aria-label={paused?'Resume slideshow':'Pause slideshow'}>{paused?'Play':'Pause'}</button><span>{index+1} / {homeSlides.length}</span></div>
 </section>
}
