import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import FlashSales from "@/components/FlashSales";
import PromotionalBanners from "@/components/PromotionalBanners";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <div style={{ paddingBottom: '80px' }}>
        <Hero />
        <Categories />
        <FlashSales />
        <PromotionalBanners />
        <FeaturedProducts />
        <Footer />
      </div>
    </>
  );
}
