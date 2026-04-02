import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heroBanner from '@/assets/hero-banner.jpg';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBanner} alt="MarketSphere hero" className="h-full w-full object-cover" width={1920} height={800} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30" />
      </div>

      <div className="container relative z-10 flex min-h-[520px] items-center py-20">
        <div className="max-w-xl space-y-6 animate-fade-up">
          <span className="inline-block rounded-full bg-accent/20 px-4 py-1.5 text-xs font-semibold text-accent">
            AI-Powered Shopping ✨
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-primary-foreground">
            Discover Your <br />Perfect Style
          </h1>
          <p className="text-base sm:text-lg text-primary-foreground/80 max-w-md">
            Smart recommendations, curated collections, and unbeatable deals — all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent-glow font-semibold">
              <Link to="/products">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/categories">Explore Categories</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
