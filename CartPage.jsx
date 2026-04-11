import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSheet from '@/components/CartSheet';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { formatPriceINR } from '@/lib/utils';

const CartPage = () => {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartSheet />
      <main className="flex-1 py-8">
        <div className="container space-y-6">
           <h1 className="font-display text-3xl font-bold animate-fade-in-down">Cart</h1>

          {items.length === 0 ? (
             <div className="empty-state rounded-2xl border border-border bg-card p-8 text-center space-y-4">
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button asChild>
                <Link to="/products">Browse products</Link>
              </Button>
            </div>
          ) : (
             <div className="space-y-4 animate-stagger-in">
              {items.map((item) => (
                 <div key={item.id} className="cart-item flex gap-4 rounded-2xl border border-border bg-card p-4">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
                    <p className="text-sm font-semibold mt-1">{formatPriceINR(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}

               <div className="cart-summary rounded-2xl border border-border bg-card p-4 flex items-center justify-between animate-fade-in-up">
                 <p className="price-total font-semibold">Total: {formatPriceINR(total())}</p>
                 <Button asChild className="btn btn-primary bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/checkout">Proceed to checkout</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;