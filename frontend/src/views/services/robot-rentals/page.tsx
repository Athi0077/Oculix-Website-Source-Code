import {Heading} from '@frontend/components/shared';

export const metadata={title:'Robot Rentals for Events',description:'Explore Unitree R1 humanoid, Unitree Go2 robot dog and photobooth robot rentals for events with Humatrix by Oculix.'};
const robots=[
 {name:'Unitree R1 Humanoid Robot',image:'/assets/rental-unitree-r1.jpg',alt:'Unitree R1 humanoid robot',text:'Create memorable moments through guest welcomes, humanoid demonstrations and promotional appearances.',tag:'Humanoid robotics'},
 {name:'Unitree Go2 Robot Dog',image:'/assets/rental-unitree-go2.png',alt:'Unitree Go2 quadruped robot dog',text:'Engage audiences with quadruped robotics demonstrations and event appearances.',tag:'Quadruped robotics'},
 {name:'Photobooth Robot',image:'/assets/rental-photobooth.jpg',alt:'Photobooth robot with a front-mounted screen',text:'Capture event memories with a mobile photo experience designed for guest engagement.',tag:'Guest experiences'}
];
const enquiry='https://wa.me/919843496461?text='+encodeURIComponent('Hello Oculix, I would like to enquire about robot rentals. Event date: \nLocation: \nRobot of interest: \nEvent requirements: ');

export default function Page(){return <main>
 <Heading label="Oculix services / Humatrix" title="Robot Rentals for Events">
  <p>Powered by Humatrix — A Product of Oculix</p>
  <p>Bring robotics to your event with Oculix. We offer robot rentals for corporate events, exhibitions, product launches, school and college programmes, and celebrations.</p>
  <a className="button" href={enquiry} target="_blank" rel="noreferrer">Enquire About Robot Rentals</a>
 </Heading>
 <section className="section alt"><div className="wrap">
  <span className="eyebrow">Meet the robots</span><h2>A new experience for your audience.</h2>
  <div className="grid3">{robots.map(robot=><article className="rental-card" key={robot.name}>
   <div className="rental-visual"><img src={robot.image} alt={robot.alt}/></div>
   <div className="rental-info"><span className="eyebrow">{robot.tag}</span><h3>{robot.name}</h3><p>{robot.text}</p></div>
  </article>)}</div>
 </div></section>
 <section className="section"><div className="wrap split">
  <div><span className="eyebrow">Built around your event</span><h2>From your idea to the event floor.</h2><p>Our team helps coordinate robot selection, event requirements and deployment arrangements. Activities and bookings are subject to suitability and availability.</p><a className="button" href={enquiry} target="_blank" rel="noreferrer">Discuss Your Event</a></div>
  <ul className="list"><li>Share your event date, location and audience</li><li>Choose the robot experience you have in mind</li><li>Discuss available demonstrations and venue requirements</li><li>Confirm deployment and event arrangements with Oculix</li></ul>
 </div></section>
 <section className="section alt"><div className="wrap"><span className="eyebrow">A closer look</span><h2>Explore the robots.</h2><div className="grid2 rental-gallery">
  <figure><img src="/assets/rental-r1-detail.jpg" alt="Additional view of the Unitree R1 humanoid robot" loading="lazy"/><figcaption>Unitree R1 humanoid robot</figcaption></figure>
  <figure><img src="/assets/rental-go2-detail.jpg" alt="Additional view of the Unitree Go2 robot dog" loading="lazy"/><figcaption>Unitree Go2 robot dog</figcaption></figure>
 </div></div></section>
 </main>}
