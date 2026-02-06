import HeroSection from "@/components/HeroSection";
import DashboardGallery from "@/components/DashboardGallery";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <DashboardGallery />
      <Footer />
    </div>
  );
};

export default Index;
