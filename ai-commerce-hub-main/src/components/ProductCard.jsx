import { Star, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPriceINR } from '@/lib/utils';
import { toast } from 'sonner';

const ProductCard = ({ product }) => {
  const addItem = useCartStore((s) => s.addItem);
  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!currentUser) {
      toast.error('Login required to add items to cart');
      navigate('/login', { state: { from: `/product/${product.id}` } });
      return;
    }

    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover">
      <Link to={`/product/${product.id}`} className="block w-full text-left">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.badge && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground border-0 text-xs font-semibold">
              {product.badge}
            </Badge>
          )}
          {discount && (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground border-0 text-xs">
              -{discount}%
            </Badge>
          )}
        </div>

        <div className="space-y-2 p-4 text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{product.category}</p>
          <h3 className="line-clamp-1 font-semibold text-sm text-card-foreground">{product.name}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>

          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span className="text-xs font-medium text-foreground">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between px-4 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">{formatPriceINR(product.price)}</span>
          {product.originalPrice && <span className="text-sm text-muted-foreground line-through">{formatPriceINR(product.originalPrice)}</span>}
        </div>
        <Button size="sm" onClick={handleAdd} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent-glow">
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
