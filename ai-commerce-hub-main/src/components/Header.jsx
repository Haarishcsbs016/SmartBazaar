import { ShoppingCart, Search, Menu, X, UserRound, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { toggleCart, itemCount } = useCartStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const count = itemCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-foreground">
          Market<span className="text-gradient">Sphere</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</Link>
          <Link to="/categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Categories</Link>
          <Link to="/deals" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Deals</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="h-5 w-5" />
          </Button>
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-3 rounded-full border border-border bg-secondary/70 px-4 py-2 text-sm">
              <UserRound className="h-4 w-4 text-accent" />
              <span className="max-w-28 truncate">{currentUser.name}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" onClick={toggleCart}>
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-accent text-accent-foreground border-0">
                {count}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-3 animate-fade-in">
          <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">Home</Link>
          <Link to="/products" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">Products</Link>
          <Link to="/categories" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">Categories</Link>
          <Link to="/deals" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">Deals</Link>
          {currentUser ? (
            <button type="button" onClick={handleLogout} className="text-left text-sm font-medium py-2 text-muted-foreground">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">Login</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">Sign up</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
