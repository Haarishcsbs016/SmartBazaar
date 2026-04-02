import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, PackageCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSheet from '@/components/CartSheet';
import { Button } from '@/components/ui/button';
import { formatPriceINR } from '@/lib/utils';

const PaymentSuccess = () => {
  const location = useLocation();
  const gateway = location.state?.gateway || 'gateway';
  const method = location.state?.method || 'payment method';
  const orderRef = location.state?.orderRef || `ORD-${Date.now().toString().slice(-8)}`;
  const amount = Number(location.state?.amount || 0);
  const items = location.state?.items || [];
  const address = location.state?.address || {};
  const paidAt = location.state?.paidAt ? new Date(location.state.paidAt) : new Date();

  const handleDownloadInvoice = () => {
    const itemLines = items.length
      ? items.map((item) => `- ${item.name} x ${item.quantity} = ${formatPriceINR(item.price * item.quantity)}`).join('\n')
      : '- No line items available';

    const invoiceText = [
      'Market Sphere Invoice',
      '--------------------',
      `Order Ref: ${orderRef}`,
      `Gateway: ${gateway}`,
      `Method: ${method}`,
      `Paid At: ${paidAt.toLocaleString()}`,
      `Total: ${formatPriceINR(amount)}`,
      '',
      'Items:',
      itemLines,
      '',
      'Delivery Address:',
      `${address.fullName || ''}`,
      `${address.line1 || ''}`,
      `${address.city || ''} ${address.state || ''}`,
      `${address.phone || ''}`,
    ].join('\n');

    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${orderRef}-invoice.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_hsl(145_70%_45%_/0.12),_transparent_40%),linear-gradient(180deg,_hsl(40_20%_98%),_hsl(40_20%_96%))]">
      <Header />
      <CartSheet />
      <main className="flex-1 py-12">
        <div className="container max-w-2xl">
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="font-display text-3xl font-bold">Payment Successful</h1>
            <p className="text-muted-foreground">
              Your order has been placed successfully.
            </p>

            <div className="rounded-2xl border border-border bg-secondary/60 p-4 text-left text-sm">
              <p><span className="font-medium">Order Ref:</span> {orderRef}</p>
              <p><span className="font-medium">Gateway:</span> {gateway}</p>
              <p><span className="font-medium">Method:</span> {method}</p>
              <p><span className="font-medium">Paid At:</span> {paidAt.toLocaleString()}</p>
              <p><span className="font-medium">Total:</span> {formatPriceINR(amount)}</p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4 text-left text-sm space-y-2">
              <p className="font-medium">Invoice</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {items.length > 0 ? (
                  items.map((item) => (
                    <p key={item.id}>{item.name} x {item.quantity} - {formatPriceINR(item.price * item.quantity)}</p>
                  ))
                ) : (
                  <p>No line items available.</p>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <PackageCheck className="h-10 w-10 text-accent" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleDownloadInvoice} variant="secondary">
                Download Invoice
              </Button>
              <Button asChild>
                <Link to="/products">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Go to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;