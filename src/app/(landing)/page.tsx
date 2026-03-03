import { Navbar } from "./_components/Navbar";
import { Hero } from "./_components/Hero";
import { Authority } from "./_components/Authority";
import { SpecialtiesSlider } from "./_components/SpecialtiesSlider";
import { MethodGrid } from "./_components/MethodGrid";
import { Locations } from "./_components/Locations";
import { PremiumCTA } from "./_components/PremiumCTA";
import { Footer } from "./_components/Footer";

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <div id="autoridade">
        <Authority />
      </div>
      <div id="especialidades">
        <SpecialtiesSlider />
      </div>
      <div id="metodo">
        <MethodGrid />
      </div>
      <div id="locais">
        <Locations />
      </div>
      <PremiumCTA />
      <Footer />
    </main>
  );
}
