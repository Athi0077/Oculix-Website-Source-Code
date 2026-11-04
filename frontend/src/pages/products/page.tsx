import {Heading,Products,CTA} from '@frontend/components/shared';
export const metadata={title:'Products'};
export default function Page(){return <main><Heading label="The Oculix portfolio" title="Technology you can experience."><p>Discover VirVerse and Humatrix: immersive environments and humanoid robotics, supported by Oculix.</p></Heading><div className="wrap"><Products/></div><CTA/></main>}
