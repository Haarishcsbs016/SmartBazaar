import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import ProductCard from '@/components/ProductCard';
import CartSheet from '@/components/CartSheet';
import Footer from '@/components/Footer';
import { productsAPI } from '@/lib/apiService';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      const data = await productsAPI.getAll();
      setFeatured(data.slice(0, 4));
    };

    loadFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartSheet />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />

        <section className="py-16">
          <div className="container">
             <div className="flex items-center justify-between mb-8 animate-fade-in-down">
               <div>
                 <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Trending Products</h2>
                 <p className="text-sm text-muted-foreground mt-1">Hand-picked just for you</p>
               </div>
               <Button asChild variant="ghost" className="nav-link-animated text-accent hover:text-accent/80">
                 <Link to="/products">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
               </Button>
             </div>
             <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary">
          <div className="container text-center space-y-4">
             <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground animate-fade-in-down">Get 20% Off Your First Order</h2>
             <p className="text-primary-foreground/70 max-w-md mx-auto text-sm animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              Sign up today and receive an exclusive discount on your first purchase.
            </p>
             <div className="flex justify-center gap-3 mt-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
               <input
                 type="email"
                 placeholder="Enter your email"
                 className="input-focus rounded-lg border-0 bg-primary-foreground/10 px-4 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent w-64"
               />
               <Button className="btn btn-primary bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent-glow">Subscribe</Button>
             </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
