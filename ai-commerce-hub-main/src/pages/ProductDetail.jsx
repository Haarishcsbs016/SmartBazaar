import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Heart, ShieldCheck, Star, Truck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSheet from '@/components/CartSheet';
import { getProductImages, products } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth';
import { formatPriceINR } from '@/lib/utils';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = useMemo(() => products.find((item) => item.id === productId), [productId]);
  const addItem = useCartStore((state) => state.addItem);
  const currentUser = useAuthStore((state) => state.currentUser);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Product not found</h1>
          <Button asChild>
            <Link to="/products">Back to products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;
  const productImages = getProductImages(product);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  useEffect(() => {
    if (productImages.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % productImages.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [productImages]);

  const handlePreviousImage = () => {
    setActiveImageIndex((current) => (current - 1 + productImages.length) % productImages.length);
  };

  const handleNextImage = () => {
    setActiveImageIndex((current) => (current + 1) % productImages.length);
  };

  const handleRequireLogin = (nextPath) => {
    navigate('/login', { state: { from: nextPath } });
  };

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error('Login required to add items to cart');
      handleRequireLogin(`/product/${product.id}`);
      return;
    }

    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!currentUser) {
      toast.error('Login required to buy now');
      handleRequireLogin(`/product/${product.id}`);
      return;
    }

    addItem(product);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_hsl(32_95%_52%_/0.08),_transparent_38%),linear-gradient(180deg,_hsl(40_20%_98%),_hsl(40_20%_96%))]">
      <Header />
      <CartSheet />
      <main className="flex-1 py-8">
        <div className="container space-y-6">
          <Button asChild variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-foreground">
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to products
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-3xl border border-border bg-card shadow-card overflow-hidden">
              <div className="grid gap-4 p-5 md:grid-cols-[88px_1fr]">
                <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
                  {productImages.map((image, index) => (
                    <button
                      key={`${product.id}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`aspect-square w-20 shrink-0 overflow-hidden rounded-2xl border bg-secondary transition ${activeImageIndex === index ? 'border-accent shadow-[0_0_0_1px_hsl(var(--accent))]' : 'border-border'}`}
                    >
                      <img src={image} alt={product.name} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="relative overflow-hidden rounded-3xl border border-border bg-secondary">
                  {product.badge && <Badge className="absolute left-4 top-4 z-10 bg-accent text-accent-foreground">{product.badge}</Badge>}
                  {discount && <Badge className="absolute right-4 top-4 z-10 bg-destructive text-destructive-foreground">-{discount}%</Badge>}
                  <img src={productImages[activeImageIndex]} alt={product.name} className="aspect-square h-full w-full object-cover" />
                  {productImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePreviousImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur hover:bg-background"
                        aria-label="Previous product image"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur hover:bg-background"
                        aria-label="Next product image"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground">
                        {activeImageIndex + 1} / {productImages.length}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
                <h1 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">{product.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-foreground">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {product.rating} rating
                  </span>
                  <span>{product.reviews.toLocaleString()} reviews</span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> In stock
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/60 p-4">
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-foreground">{formatPriceINR(product.price)}</span>
                  {product.originalPrice && <span className="pb-1 text-base text-muted-foreground line-through">{formatPriceINR(product.originalPrice)}</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Inclusive of all taxes and secure checkout handling.</p>
              </div>

              <p className="text-sm leading-7 text-muted-foreground">{product.description}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Truck, text: 'Fast delivery with tracking updates' },
                  { icon: ShieldCheck, text: 'Protected purchase and secure payment flow' },
                  { icon: Clock3, text: 'Quick checkout after login' },
                  { icon: Heart, text: 'Save for later from the cart screen' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
                    <Icon className="h-4 w-4 text-accent" />
                    {text}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-12 border-border text-foreground hover:bg-secondary"
                  onClick={handleAddToCart}
                >
                  Add to cart
                </Button>
                <Button className="h-12 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleBuyNow}>
                  Buy now
                </Button>
              </div>

              {!currentUser && <p className="text-sm text-muted-foreground">Login or signup is required before cart and checkout actions will work.</p>}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;