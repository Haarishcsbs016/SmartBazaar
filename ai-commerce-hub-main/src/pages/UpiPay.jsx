import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, ShieldCheck, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPaymentSession, updatePaymentSession } from '@/lib/paymentSessions';
import { formatPriceINR } from '@/lib/utils';

const UpiPay = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session') || '';
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    setSession(getPaymentSession(sessionId));
  }, [sessionId]);

  useEffect(() => {
    if (!session?.expiresAt || session.status === 'paid') {
      return undefined;
    }

    const updateTimer = () => {
      const left = Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
    };

    updateTimer();
    const intervalId = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(intervalId);
  }, [session]);

  const isExpired = useMemo(() => !session || (session.expiresAt ? Date.now() > session.expiresAt : true), [session]);

  const handlePayNow = () => {
    if (!session || isExpired) {
      return;
    }

    const paidSession = updatePaymentSession(session.id, { status: 'paid', paidAt: Date.now() });

    if (session.upiLink) {
      window.location.href = session.upiLink;
    }

    navigate('/payment-success', {
      replace: true,
      state: {
        gateway: paidSession.gateway,
        method: paidSession.method,
        orderRef: paidSession.orderRef,
        amount: paidSession.amount,
        items: paidSession.items,
        address: paidSession.address,
        paidAt: paidSession.paidAt,
      },
    });
  };

  if (!sessionId || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Invalid payment link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This payment session does not exist or has expired.</p>
            <Button asChild className="mt-4">
              <Link to="/checkout">Back to checkout</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(32_95%_52%_/0.08),_transparent_38%),linear-gradient(180deg,_hsl(40_20%_98%),_hsl(40_20%_96%))] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border bg-card shadow-card">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-display">UPI Payment</CardTitle>
          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/60 px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure session</span>
            <span className="inline-flex items-center gap-1 font-semibold"><Timer className="h-4 w-4" /> {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-border bg-background p-4 text-sm">
            <p><span className="font-medium">Order:</span> {session.orderRef}</p>
            <p><span className="font-medium">Method:</span> {session.method}</p>
            <p><span className="font-medium">Amount:</span> {formatPriceINR(session.amount)}</p>
          </div>

          {isExpired ? (
            <p className="text-sm text-destructive">This payment link has expired. Please generate a new QR from checkout.</p>
          ) : (
            <Button onClick={handlePayNow} className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90">
              <CreditCard className="mr-2 h-4 w-4" /> Pay Now
            </Button>
          )}

          <Button variant="outline" asChild className="w-full">
            <Link to="/checkout">Back to checkout</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpiPay;