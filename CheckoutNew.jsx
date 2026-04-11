import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Smartphone, Truck, MapPin, Calendar, Check, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
import './CheckoutNew.css';

const paymentMethodOptions = [
  { value: 'UPI', label: 'UPI', icon: '📱', banks: ['Google Pay', 'PhonePe', 'Paytm'] },
  { value: 'Credit Card', label: 'Credit Card', icon: '💳', banks: ['Visa', 'Mastercard', 'Amex'] },
  { value: 'Debit Card', label: 'Debit Card', icon: '💳', banks: ['All Banks'] },
  { value: 'NetBanking', label: 'Net Banking', icon: '🏦', banks: ['HDFC', 'ICICI', 'Axis'] },
  { value: 'Wallet', label: 'Amazon Pay Balance', icon: '👝', balance: '₹0.00' },
];

const carrierId = ['Express', 'Standard', 'Priority'];

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

const CheckoutNew = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const currentUser = useAuthStore((state) => state.currentUser);
  const token = useAuthStore((state) => state.token);

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [expandedMethod, setExpandedMethod] = useState(null);
  const [address, setAddress] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    line1: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
  });

  const [deliveryOption, setDeliveryOption] = useState('Standard');

  const subtotal = useMemo(() => total(), [items, total]);
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const shipping = subtotal > 500 || deliveryOption === 'Express' ? 0 : deliveryOption === 'Priority' ? 100 : 50;
  const totalAmount = Math.round((subtotal + tax + shipping) * 100) / 100;

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { from: '/checkout' } });
    }
    if (!items.length) {
      navigate('/products');
    }
  }, [token, items, navigate]);

  const handleAddressChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const isAddressValid = address.fullName && address.line1 && address.city && address.state && address.phone && address.zipCode;

  const handlePay = async () => {
    if (!isAddressValid) {
      toast.error('Please complete shipping details');
      return;
    }

    setProcessing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Unable to load Razorpay checkout');
        setProcessing(false);
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
          },
        });
        return;
      }

      if (!createResponse?.data?.razorpayOrderId) {
        toast.error('Failed to create order');
        setProcessing(false);
        return;
      }

      const options = {
        key: createResponse.data.razorpayKeyId,
        amount: createResponse.data.amount,
        currency: createResponse.data.currency,
        name: 'AI Commerce Hub',
        description: `Order for ${items.length} items`,
        order_id: createResponse.data.razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyResponse = await paymentsAPI.verifyRazorpayPayment(
              {
                orderId: createResponse.data.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              token
            );

            if (verifyResponse?.success) {
              await fetchCart();
              navigate('/payment-success', {
                replace: true,
                state: {
                  gateway: 'Razorpay',
                  method: paymentMethod,
                  orderRef: createResponse.data.orderId,
                  paymentId: response.razorpay_payment_id,
                },
              });
            } else {
              toast.error(verifyResponse?.message || 'Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification error');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: address.fullName,
          email: currentUser?.email,
          contact: address.phone,
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error(error?.message || 'Payment initiation failed');
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-container">
      <Header />
      
      <div className="checkout-main">
        <div className="checkout-wrapper">
          {/* Left Side - Order Details */}
          <div className="checkout-left">
            <div className="order-items-section">
              <h3>Order Items</h3>
              <div className="items-list">
                {items.map((item, idx) => (
                  <div key={idx} className="item-card">
                    <img src={item.image} alt={item.name} className="item-image" />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>{item.quantity} × {formatPriceINR(item.price)}</p>
                    </div>
                    <div className="item-price">{formatPriceINR(item.quantity * item.price)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Options */}
            <div className="delivery-section fade-in">
              <h3>Delivery Option</h3>
              <div className="delivery-options">
                {carrierId.map(option => (
                  <div
                    key={option}
                    className={`delivery-option ${deliveryOption === option ? 'active' : ''}`}
                    onClick={() => setDeliveryOption(option)}
                  >
                    <div className="option-header">
                      <Truck size={20} />
                      <span>{option}</span>
                      {deliveryOption === option && <Check size={20} className="check-icon" />}
                    </div>
                    <div className="option-details">
                      {option === 'Express' && <p>Delivery in 1 day</p>}
                      {option === 'Standard' && <p>Delivery in 3-5 days</p>}
                      {option === 'Priority' && <p>Delivery in 2-3 days</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Checkout Steps */}
          <div className="checkout-right">
            {/* Step 1: Shipping Address */}
            <div className={`step-section ${step >= 1 ? 'active' : 'disabled'}`}>
              <div className="step-header" onClick={() => setStep(step === 1 ? 2 : 1)}>
                <div className="step-number">{step > 1 ? <Check size={20} /> : '1'}</div>
                <div className="step-title">
                  <h3>Delivery Address</h3>
                  {step > 1 && isAddressValid && (
                    <p className="summary">{address.line1}, {address.city}</p>
                  )}
                </div>
                {step > 1 && <ChevronDown className="chevron" />}
              </div>

              {step === 1 && (
                <div className="step-content animate-in">
                  <div className="form-group">
                    <Label>Full Name</Label>
                    <Input
                      value={address.fullName}
                      onChange={(e) => handleAddressChange('fullName', e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <Label>Phone Number</Label>
                      <Input
                        value={address.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        placeholder="+91"
                      />
                    </div>
                    <div className="form-group">
                      <Label>Pincode</Label>
                      <Input
                        value={address.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        placeholder="641202"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <Label>Address</Label>
                    <Input
                      value={address.line1}
                      onChange={(e) => handleAddressChange('line1', e.target.value)}
                      placeholder="Building name, street, area"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <Label>City</Label>
                      <Input
                        value={address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="form-group">
                      <Label>State</Label>
                      <Input
                        value={address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (isAddressValid) {
                        setStep(2);
                      } else {
                        toast.error('Please fill all fields');
                      }
                    }}
                    className="continue-btn"
                  >
                    Continue to Payment
                  </Button>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className={`step-section ${step >= 2 ? 'active' : 'disabled'}`}>
              <div className="step-header" onClick={() => step >= 2 && setStep(step === 2 ? 1 : 2)}>
                <div className="step-number">{step > 2 ? <Check size={20} /> : '2'}</div>
                <div className="step-title">
                  <h3>Payment Method</h3>
                  {step > 2 && (
                    <p className="summary">{paymentMethod}</p>
                  )}
                </div>
                {step > 2 && <ChevronDown className="chevron" />}
              </div>

              {step === 2 && (
                <div className="step-content animate-in">
                  <div className="payment-methods">
                    {paymentMethodOptions.map((method) => (
                      <div key={method.value} className="payment-method-wrapper">
                        <div
                          className={`payment-method ${paymentMethod === method.value ? 'selected' : ''}`}
                          onClick={() => {
                            setPaymentMethod(method.value);
                            setExpandedMethod(expandedMethod === method.value ? null : method.value);
                          }}
                        >
                          <div className="method-header">
                            <div className="radio-circle">
                              {paymentMethod === method.value && <div className="radio-dot" />}
                            </div>
                            <span className="method-icon">{method.icon}</span>
                            <div className="method-info">
                              <p className="method-name">{method.label}</p>
                              {method.value === 'Wallet' && <p className="method-balance">{method.balance}</p>}
                            </div>
                          </div>
                          {paymentMethod === method.value && (
                            <ChevronDown
                              size={20}
                              className={`expand-icon ${expandedMethod === method.value ? 'expanded' : ''}`}
                            />
                          )}
                        </div>

                        {paymentMethod === method.value && expandedMethod === method.value && (
                          <div className="payment-details fade-in">
                            <div className="banks-list">
                              {method.banks?.map((bank) => (
                                <div key={bank} className="bank-option">
                                  <input type="radio" id={bank} name="bank" defaultChecked />
                                  <label htmlFor={bank}>{bank}</label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="payment-notice">
                    <Lock size={16} />
                    <span>Your payment information is secure and encrypted</span>
                  </div>

                  <div className="step-actions">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)}>
                      Review Order
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Order Review */}
            <div className={`step-section ${step >= 3 ? 'active' : 'disabled'}`}>
              <div className="step-header" onClick={() => step >= 3 && setStep(step === 3 ? 2 : 3)}>
                <div className="step-number">{step > 3 ? <Check size={20} /> : '3'}</div>
                <div className="step-title">
                  <h3>Order Review & Confirm</h3>
                </div>
                {step > 3 && <ChevronDown className="chevron" />}
              </div>

              {step === 3 && (
                <div className="step-content animate-in">
                  <div className="review-section">
                    <div className="review-item">
                      <span>Subtotal</span>
                      <span>{formatPriceINR(subtotal)}</span>
                    </div>
                    <div className="review-item">
                      <span>Tax (10%)</span>
                      <span>{formatPriceINR(tax)}</span>
                    </div>
                    <div className="review-item">
                      <span>{deliveryOption} Delivery</span>
                      <span>{shipping === 0 ? 'FREE' : formatPriceINR(shipping)}</span>
                    </div>
                    <Separator className="review-separator" />
                    <div className="review-total">
                      <span>Order Total</span>
                      <span>{formatPriceINR(totalAmount)}</span>
                    </div>
                  </div>

                  <div className="order-summary">
                    <div className="summary-row">
                      <MapPin size={16} />
                      <div>
                        <p className="summary-label">Delivery to</p>
                        <p className="summary-value">{address.fullName}</p>
                      </div>
                    </div>
                    <div className="summary-row">
                      <Smartphone size={16} />
                      <div>
                        <p className="summary-label">Payment Method</p>
                        <p className="summary-value">{paymentMethod}</p>
                      </div>
                    </div>
                    <div className="summary-row">
                      <Truck size={16} />
                      <div>
                        <p className="summary-label">Delivery</p>
                        <p className="summary-value">{deliveryOption}</p>
                      </div>
                    </div>
                  </div>

                  <div className="step-actions">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button
                      onClick={handlePay}
                      disabled={processing}
                      className="pay-btn"
                    >
                      {processing ? 'Processing...' : `Pay ${formatPriceINR(totalAmount)}`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price Breakdown Mobile */}
        <div className="price-breakdown-mobile">
          <div className="breakdown-row">
            <span>Subtotal:</span>
            <span>{formatPriceINR(subtotal)}</span>
          </div>
          <div className="breakdown-row">
            <span>Shipping:</span>
            <span>{shipping === 0 ? 'FREE' : formatPriceINR(shipping)}</span>
          </div>
          <div className="breakdown-row total">
            <span>Total:</span>
            <span>{formatPriceINR(totalAmount)}</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutNew;
