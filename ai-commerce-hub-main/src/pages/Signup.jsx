import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/auth';
import { toast } from 'sonner';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((state) => state.currentUser);
  const signup = useAuthStore((state) => state.signup);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const destination = location.state?.from || '/';

  useEffect(() => {
    if (currentUser) {
      navigate(destination, { replace: true });
    }
  }, [currentUser, destination, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      signup(name, email, password);
      toast.success('Account created');
      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(32_95%_52%_/0.14),_transparent_42%),linear-gradient(180deg,_hsl(40_20%_98%),_hsl(40_20%_95%))] flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/70 shadow-card order-2 lg:order-1">
          <CardHeader className="space-y-2">
            <CardTitle className="font-display text-2xl">Create your account</CardTitle>
            <CardDescription>Sign up once and keep your cart, checkout, and payment flow protected.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Choose a password" required />
              </div>

              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Create account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-foreground hover:text-accent">
                Login instead
              </Link>
            </p>
          </CardContent>
        </Card>

        <section className="rounded-3xl border border-border/70 bg-primary text-primary-foreground p-8 shadow-card overflow-hidden relative order-1 lg:order-2">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_50%)]" />
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-sm">
              <ShieldCheck className="h-4 w-4" /> New customer account
            </div>
            <div className="space-y-4 max-w-md">
              <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">Build your secure shopping profile.</h1>
              <p className="text-primary-foreground/75">
                Once signed in, the product detail page unlocks add-to-cart and buy-now actions, then routes into the checkout and payment screen.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-primary-foreground/75 sm:grid-cols-2">
              {['Product detail page', 'Persistent login session', 'Cart + checkout access', 'Wallet and card options'].map((item) => (
                <div key={item} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/8 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Signup;