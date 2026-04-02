import { Sparkles, ShieldCheck, Truck, HeadphonesIcon } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'AI Recommendations', desc: 'Personalized picks powered by smart algorithms' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: 'Encrypted checkout with Stripe & Razorpay' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Free shipping on orders over $50' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'AI chatbot + human agents always ready' },
];

const FeaturesSection = () => (
  <section className="py-16 bg-secondary">
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="flex items-start gap-4 p-6 rounded-lg bg-card shadow-card"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <f.icon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-card-foreground">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
