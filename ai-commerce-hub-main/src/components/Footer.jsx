import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div>
        <h4 className="font-display text-lg font-bold text-card-foreground mb-3">
          Market<span className="text-gradient">Sphere</span>
        </h4>
        <p className="text-sm text-muted-foreground">AI-powered e-commerce for the modern shopper.</p>
      </div>
      <div>
        <h5 className="font-semibold text-sm text-card-foreground mb-3">Shop</h5>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
          <li><Link to="/categories" className="hover:text-foreground transition-colors">Categories</Link></li>
          <li><Link to="/deals" className="hover:text-foreground transition-colors">Deals</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="font-semibold text-sm text-card-foreground mb-3">Support</h5>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
          <li><a href="#" className="hover:text-foreground transition-colors">Shipping Info</a></li>
          <li><a href="#" className="hover:text-foreground transition-colors">Returns</a></li>
        </ul>
      </div>
      <div>
        <h5 className="font-semibold text-sm text-card-foreground mb-3">Company</h5>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
          <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
          <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
        </ul>
      </div>
    </div>
    <div className="container mt-8 pt-6 border-t border-border">
      <p className="text-xs text-muted-foreground text-center">© 2026 MarketSphere. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
