
const BASE_URL = 'http://localhost:5000/api';
async function testPaymentAPI() {
  try {
    console.log('🧪 Testing Payment API...\n');

    // Step 1: Register a test user
    console.log('1️⃣ Registering test user...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'test123456',
        phone: '9999999999'
      })
    });

    const registerData = await registerRes.json();
    if (!registerData.success) {
      console.error('❌ Registration failed:', registerData);
      return;
    }

    const token = registerData.token;
    const userId = registerData.user.id;
    console.log('✅ User registered:', { userId, email: registerData.user.email });

    // Step 2: Add item to cart
    console.log('\n2️⃣ Adding item to cart...');
    
    // First, get products to get a product ID
    const productsRes = await fetch(`${BASE_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const productsData = await productsRes.json();
    
    if (!productsData.data || productsData.data.length === 0) {
      console.error('❌ No products found in database');
      return;
    }

    const productId = productsData.data[0]._id;
    console.log('✅ Found product:', productId);

    const addCartRes = await fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId,
        quantity: 1
      })
    });

    const cartData = await addCartRes.json();
    if (!cartData.success) {
      console.error('❌ Add to cart failed:', cartData);
      return;
    }
    console.log('✅ Item added to cart');

    // Step 3: Create Razorpay order
    console.log('\n3️⃣ Creating Razorpay order...');
    const paymentRes = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: 'Test User',
          line1: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          country: 'India',
          zipCode: '123456',
          phone: '9999999999'
        },
        paymentMethod: 'UPI'
      })
    });

    const paymentData = await paymentRes.json();
    
    if (!paymentData.success) {
      console.error('❌ Payment order creation failed:');
      console.error('   Status:', paymentRes.status);
      console.error('   Response:', paymentData);
      return;
    }

    console.log('✅ Razorpay order created successfully!');
    console.log('   Order ID:', paymentData.data.orderId);
    console.log('   Razorpay Order ID:', paymentData.data.razorpayOrderId);
    console.log('   Amount:', paymentData.data.amount);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testPaymentAPI();
