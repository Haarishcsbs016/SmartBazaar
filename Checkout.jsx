import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Smartphone } from 'lucide-react';
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
import { paymentsAPI } from '@/lib/apiService';
import { formatPriceINR } from '@/lib/utils';
import { toast } from 'sonner';

const paymentMethodOptions = ['UPI', 'Credit Card', 'Debit Card', 'NetBanking', 'Wallet'];

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const Checkout = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const currentUser = useAuthStore((state) => state.currentUser);
  const token = useAuthStore((state) => state.token);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    line1: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
  });

  const subtotal = useMemo(() => total(), [items, total]);

  const handlePay = async () => {
    if (!token) {
      toast.error('Please login first');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (!items.length) {
      toast.error('Your cart is empty');
      return;
    }

    if (!address.line1 || !address.city || !address.state || !address.phone) {
      toast.error('Please complete shipping details');
      return;
    }

    setProcessing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Unable to load Razorpay checkout');
        return;
      }

      const createResponse = await paymentsAPI.createRazorpayOrder(
        {
          shippingAddress: address,
          paymentMethod,
        },
        token
      );

      if (createResponse?.data?.mockPayment) {
        await fetchCart();

        const mockOrder = createResponse.data.order;

        toast.success('Order placed (development mode)');
        navigate('/payment-success', {
          replace: true,
          state: {
            gateway: 'Development Mock',
            method: paymentMethod,
            orderRef: mockOrder._id,
            amount: mockOrder.totalPrice,
            items: (mockOrder.items || []).map((item) => ({
              id: item.productId?._id || item.productId,
              name: item.productName,
              quantity: item.quantity,
              price: item.price,
            })),
            address: {
              fullName: address.fullName,
              line1: address.line1,
              city: address.city,
              state: address.state,
              phone: address.phone,
            },
            paidAt: Date.now(),
          },
        });
        return;
      }

      const { orderId, amount, currency, razorpayOrderId, razorpayKeyId } = createResponse.data;

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        amount,
        currency,
        name: 'AI Commerce Hub',
        description: 'Secure order payment',
        order_id: razorpayOrderId,
        prefill: {
          name: address.fullName || currentUser?.name || '',
          email: currentUser?.email || '',
          contact: address.phone,
        },
        theme: {
          color: '#e86d1f',
        },
        handler: async (response) => {
          const verifyResponse = await paymentsAPI.verifyRazorpayPayment(
            {
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            token
          );

          await fetchCart();

          toast.success('Payment verified and order placed');
          navigate('/payment-success', {
            replace: true,
            state: {
              gateway: 'Razorpay',
              method: paymentMethod,
              orderRef: verifyResponse.data._id,
              amount: verifyResponse.data.totalPrice,
              items: verifyResponse.data.items.map((item) => ({
                id: item.productId?._id || item.productId,
                name: item.productName,
                quantity: item.quantity,
                price: item.price,
              })),
              address: {
                fullName: address.fullName,
                line1: address.line1,
                city: address.city,
                state: address.state,
                phone: address.phone,
              },
              paidAt: Date.now(),
            },
          });
        },
      });

      razorpay.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
      });

      razorpay.open();
    } catch (error) {
      toast.error(error.message || 'Unable to start payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_hsl(32_95%_52%_/0.08),_transparent_38%),linear-gradient(180deg,_hsl(40_20%_98%),_hsl(40_20%_96%))]">
      <Header />
      <CartSheet />
      <main className="flex-1 py-8">
        <div className="container space-y-6">
           <Button variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-foreground animate-fade-in-left" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

           <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
             <Card className="checkout-form border-border bg-card shadow-card animate-fade-in-up">
               <CardHeader>
                 <CardTitle className="font-display text-2xl animate-fade-in-down">Secure checkout</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="grid gap-4 sm:grid-cols-2">
                   <div className="form-group space-y-2 sm:col-span-2">
                     <Label htmlFor="fullName">Full name</Label>
                     <Input className="form-input" id="fullName" value={address.fullName} onChange={(event) => setAddress((current) => ({ ...current, fullName: event.target.value }))} />
                   </div>
                   <div className="form-group space-y-2 sm:col-span-2">
                     <Label htmlFor="line1">Address</Label>
                     <Input className="form-input" id="line1" value={address.line1} onChange={(event) => setAddress((current) => ({ ...current, line1: event.target.value }))} placeholder="Street address, apartment, landmark" />
                   </div>
                   <div className="form-group space-y-2">
                     <Label htmlFor="city">City</Label>
                     <Input className="form-input" id="city" value={address.city} onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))} />
                   </div>
                   <div className="form-group space-y-2">
                     <Label htmlFor="state">State</Label>
                     <Input className="form-input" id="state" value={address.state} onChange={(event) => setAddress((current) => ({ ...current, state: event.target.value }))} />
                   </div>
                   <div className="form-group space-y-2">
                     <Label htmlFor="zipCode">Zip code</Label>
                     <Input className="form-input" id="zipCode" value={address.zipCode} onChange={(event) => setAddress((current) => ({ ...current, zipCode: event.target.value }))} />
                   </div>
                   <div className="form-group space-y-2">
                     <Label htmlFor="phone">Phone number</Label>
                     <Input className="form-input" id="phone" value={address.phone} onChange={(event) => setAddress((current) => ({ ...current, phone: event.target.value }))} />
                   </div>
                 </div>

                <Separator />

                <div className="space-y-3">
                   <h3 className="flex items-center gap-2 font-semibold animate-fade-in-up"><Lock className="h-4 w-4 text-accent" /> Payment method</h3>
                  <div className="flex flex-wrap gap-2">
                    {paymentMethodOptions.map((method) => (
                      <Button
                        key={method}
                        type="button"
                         className="payment-method-card transition-all duration-300"
                         variant={paymentMethod === method ? 'default' : 'outline'}
                         onClick={() => setPaymentMethod(method)}
                      >
                        <Smartphone className="mr-2 h-4 w-4" /> {method}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-secondary/60 p-4 text-sm text-muted-foreground">
                  This uses Razorpay Checkout with server-side signature verification for real payment confirmation.
                </div>

                 <Button onClick={handlePay} disabled={processing} className="h-12 w-full btn btn-primary bg-accent text-accent-foreground hover:bg-accent/90">
                  {processing ? 'Starting payment...' : `Pay ${formatPriceINR(subtotal)} with Razorpay`}
                </Button>
              </CardContent>
            </Card>

             <Card className="cart-summary border-border bg-card shadow-card h-fit sticky top-24 animate-fade-in-right">
               <CardHeader>
                 <CardTitle className="font-display text-2xl animate-fade-in-down">Order summary</CardTitle>
               </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {items.map((item) => (
                     <div key={item.id} className="cart-summary-item flex gap-3 rounded-2xl border border-border p-3 transition-all duration-300">
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
                   <div className="cart-summary-item flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPriceINR(subtotal)}</span>
                  </div>
                   <div className="cart-summary-item flex justify-between text-muted-foreground">
                    <span>Tax (10%)</span>
                    <span>{formatPriceINR(Math.round(subtotal * 0.1 * 100) / 100)}</span>
                  </div>
                   <div className="cart-summary-item flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span>{subtotal > 500 ? 'Free' : formatPriceINR(50)}</span>
                  </div>
                   <div className="price-total flex justify-between text-base font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatPriceINR(subtotal + Math.round(subtotal * 0.1 * 100) / 100 + (subtotal > 500 ? 0 : 50))}</span>
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
