import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, QrCode, Smartphone, Timer, WalletCards } from 'lucide-react';
import QRCode from 'qrcode';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSheet from '@/components/CartSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth';
import { formatPriceINR } from '@/lib/utils';
import { createPaymentSession, getPaymentSession } from '@/lib/paymentSessions';
import { toast } from 'sonner';

const gatewayOptions = [
  { id: 'razorpay', name: 'Razorpay', description: 'UPI, cards, and netbanking style checkout' },
  { id: 'stripe', name: 'Stripe', description: 'Card and wallet checkout flow' },
];

const upiOptions = ['GPay', 'Paytm', 'PhonePe', 'Super Money'];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartStore((state) => state.total);
  const currentUser = useAuthStore((state) => state.currentUser);
  const [selectedGateway, setSelectedGateway] = useState('razorpay');
  const [selectedUpi, setSelectedUpi] = useState('GPay');
  const [processing, setProcessing] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [upiLink, setUpiLink] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [address, setAddress] = useState({ fullName: '', phone: '', line1: '', city: '', state: '' });

  const subtotal = useMemo(() => total(), [items, total]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true, state: { from: '/checkout' } });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (items.length === 0 && !location.state?.buyNow) {
      navigate('/products', { replace: true });
    }
  }, [items.length, location.state, navigate]);

  useEffect(() => {
    if (currentUser) {
      setAddress((current) => ({
        ...current,
        fullName: current.fullName || currentUser.name,
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (!expiresAt) {
      return undefined;
    }

    const updateSeconds = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        setQrCodeDataUrl('');
      }
    };

    updateSeconds();
    const intervalId = window.setInterval(updateSeconds, 1000);
    return () => window.clearInterval(intervalId);
  }, [expiresAt]);

  useEffect(() => {
    if (!sessionId) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const session = getPaymentSession(sessionId);
      if (!session) {
        return;
      }

      if (session.status === 'paid') {
        clearCart();
        navigate('/payment-success', {
          replace: true,
          state: {
            gateway: session.gateway,
            method: session.method,
            orderRef: session.orderRef,
            amount: session.amount,
            items: session.items,
            address: session.address,
            paidAt: session.paidAt || Date.now(),
          },
        });
      }
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [sessionId, navigate, clearCart]);

  const stripePaymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
  const razorpayPaymentLink = import.meta.env.VITE_RAZORPAY_PAYMENT_LINK;
  const merchantUpiId = import.meta.env.VITE_UPI_ID;
  const merchantName = import.meta.env.VITE_UPI_NAME || 'Market Sphere';

  const completePayment = (methodName) => {
    clearCart();
    toast.success('Payment successful. Order placed.');
    navigate('/payment-success', {
      replace: true,
      state: {
        gateway: selectedGateway,
        method: methodName,
        orderRef: orderRef || `ORD-${Date.now()}`,
        amount: subtotal,
        items,
        address,
        paidAt: Date.now(),
      },
    });
  };

  const createUpiQrCode = async () => {
    if (!merchantUpiId) {
      toast.error('Add VITE_UPI_ID in .env to enable real UPI payments.');
      return;
    }

    const nextOrderRef = `ORD-${Date.now().toString().slice(-8)}`;
    const nextExpiresAt = Date.now() + 300000;
    const upiPaymentLink = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${subtotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(nextOrderRef)}`;
    const session = createPaymentSession({
      gateway: 'razorpay',
      method: selectedUpi,
      orderRef: nextOrderRef,
      amount: subtotal,
      items,
      address,
      upiLink: upiPaymentLink,
      expiresAt: nextExpiresAt,
    });
    const mobilePayUrl = `${window.location.origin}/upi-pay?session=${encodeURIComponent(session.id)}`;
    const qrDataUrl = await QRCode.toDataURL(mobilePayUrl, { width: 280, margin: 1 });

    setSessionId(session.id);
    setOrderRef(nextOrderRef);
    setUpiLink(upiPaymentLink);
    setQrCodeDataUrl(qrDataUrl);
    setExpiresAt(nextExpiresAt);
    setSecondsLeft(300);
  };

  const handlePay = async () => {
    if (!items.length) {
      toast.error('Add at least one item before paying');
      return;
    }

    if (!address.line1 || !address.city || !address.state || !address.phone) {
      toast.error('Please complete the delivery address');
      return;
    }

    setProcessing(true);

    try {
      if (selectedGateway === 'stripe') {
        if (!stripePaymentLink) {
          toast.error('Add VITE_STRIPE_PAYMENT_LINK in .env to enable real Stripe checkout.');
          return;
        }

        window.location.href = stripePaymentLink;
        return;
      }

      if (selectedGateway === 'razorpay') {
        if (selectedUpi === 'GPay') {
          await createUpiQrCode();
          toast.success('QR generated. Complete the payment within 3 minutes.');
          return;
        }

        if (!razorpayPaymentLink) {
          toast.error('Add VITE_RAZORPAY_PAYMENT_LINK in .env to enable real Razorpay checkout.');
          return;
        }

        window.location.href = razorpayPaymentLink;
      }
    } finally {
      setProcessing(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_hsl(32_95%_52%_/0.08),_transparent_38%),linear-gradient(180deg,_hsl(40_20%_98%),_hsl(40_20%_96%))]">
      <Header />
      <CartSheet />
      <main className="flex-1 py-8">
        <div className="container space-y-6">
          <Button variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {qrCodeDataUrl && (
            <div className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Payment QR active</p>
                <p className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                  <Timer className="h-3.5 w-3.5" /> {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="border-border bg-card shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Secure checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" value={address.fullName} onChange={(event) => setAddress((current) => ({ ...current, fullName: event.target.value }))} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="line1">Address</Label>
                    <Input id="line1" value={address.line1} onChange={(event) => setAddress((current) => ({ ...current, line1: event.target.value }))} placeholder="Street address, apartment, landmark" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={address.city} onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={address.state} onChange={(event) => setAddress((current) => ({ ...current, state: event.target.value }))} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" value={address.phone} onChange={(event) => setAddress((current) => ({ ...current, phone: event.target.value }))} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4 text-accent" /> Payment gateway</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {gatewayOptions.map((gateway) => (
                      <button
                        key={gateway.id}
                        type="button"
                        onClick={() => setSelectedGateway(gateway.id)}
                        className={`rounded-2xl border p-4 text-left transition ${selectedGateway === gateway.id ? 'border-accent bg-accent/10 shadow-[0_0_0_1px_hsl(var(--accent))]' : 'border-border bg-background hover:bg-secondary/50'}`}
                      >
                        <div className="flex items-center gap-3">
                          {gateway.id === 'stripe' ? <CreditCard className="h-5 w-5 text-accent" /> : <WalletCards className="h-5 w-5 text-accent" />}
                          <div>
                            <div className="font-medium">{gateway.name}</div>
                            <div className="text-sm text-muted-foreground">{gateway.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 font-semibold"><Smartphone className="h-4 w-4 text-accent" /> UPI wallets</h3>
                  <div className="flex flex-wrap gap-2">
                    {upiOptions.map((wallet) => (
                      <Button
                        key={wallet}
                        type="button"
                        variant={selectedUpi === wallet ? 'default' : 'outline'}
                        onClick={() => setSelectedUpi(wallet)}
                        className={selectedUpi === wallet ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}
                      >
                        {wallet}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-secondary/60 p-4 text-sm text-muted-foreground">
                  Real gateway handoff is enabled through environment links. For live UPI QR, set VITE_UPI_ID and VITE_UPI_NAME in your .env file.
                </div>

                <Button onClick={handlePay} disabled={processing} className="h-12 w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {processing ? 'Processing payment...' : `Pay with ${selectedGateway === 'stripe' ? 'Stripe' : 'Razorpay'} using ${selectedUpi}`}
                </Button>

                {qrCodeDataUrl && (
                  <div className="space-y-4 rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="flex items-center gap-2 font-semibold"><QrCode className="h-4 w-4 text-accent" /> Scan QR in {selectedUpi}</h4>
                      <div className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs">
                        <Timer className="h-3.5 w-3.5" /> {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="flex justify-center rounded-xl border border-border bg-white p-4">
                      <img src={qrCodeDataUrl} alt="UPI QR code" className="h-56 w-56" />
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Order reference: <span className="font-medium text-foreground">{orderRef}</span></p>
                      <p>QR is valid for 5 minutes. Scan from mobile, tap pay, and then return to this page.</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <a href={upiLink} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        Open in {selectedUpi}
                      </a>
                      <Button type="button" disabled={secondsLeft === 0} onClick={() => completePayment(selectedUpi)}>
                        I completed payment
                      </Button>
                    </div>
                    {secondsLeft === 0 && <p className="text-sm text-destructive">QR expired. Click pay again to generate a new QR.</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-card h-fit sticky top-24">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-2xl border border-border p-3">
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                          <span className="text-sm font-semibold">{formatPriceINR(item.price * item.quantity)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPriceINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatPriceINR(subtotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;