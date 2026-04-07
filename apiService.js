import {
  AUTH_ENDPOINTS,
  CART_ENDPOINTS,
  ORDERS_ENDPOINTS,
  PAYMENTS_ENDPOINTS,
  PRODUCTS_ENDPOINTS,
  WISHLIST_ENDPOINTS,
} from "./apiConfig.js";

const API_REQUEST = async (url, options = {}, token) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
};

export const mapBackendProduct = (product) => {
  const hasDiscount = typeof product.discountPrice === "number" && product.discountPrice > 0;

  return {
    id: product._id,
    _id: product._id,
    name: product.name,
    price: hasDiscount ? product.discountPrice : product.price,
    originalPrice: hasDiscount ? product.price : undefined,
    image: product.image,
    images: product.images || [],
    category: product.category,
    rating: Number(product.rating || 0).toFixed(1),
    reviews: product.numReviews || 0,
    description: product.description,
    stock: product.stock || 0,
  };
};

export const authAPI = {
  register: (payload) => API_REQUEST(AUTH_ENDPOINTS.REGISTER, {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  login: (payload) => API_REQUEST(AUTH_ENDPOINTS.LOGIN, {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  me: (token) => API_REQUEST(AUTH_ENDPOINTS.GET_USER, { method: "GET" }, token),
};

export const productsAPI = {
  getAll: async (query = "") => {
    const url = query ? `${PRODUCTS_ENDPOINTS.GET_ALL}?${query}` : PRODUCTS_ENDPOINTS.GET_ALL;
    const data = await API_REQUEST(url, { method: "GET" });
    return (data.data || []).map(mapBackendProduct);
  },
  getOne: async (id) => {
    const data = await API_REQUEST(PRODUCTS_ENDPOINTS.GET_ONE(id), { method: "GET" });
    return mapBackendProduct(data.data);
  },
};

export const cartAPI = {
  getCart: (token) => API_REQUEST(CART_ENDPOINTS.GET, { method: "GET" }, token),
  addToCart: (payload, token) => API_REQUEST(CART_ENDPOINTS.ADD, {
    method: "POST",
    body: JSON.stringify(payload),
  }, token),
  updateCart: (payload, token) => API_REQUEST(CART_ENDPOINTS.UPDATE, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, token),
  removeFromCart: (payload, token) => API_REQUEST(CART_ENDPOINTS.REMOVE, {
    method: "DELETE",
    body: JSON.stringify(payload),
  }, token),
  clearCart: (token) => API_REQUEST(CART_ENDPOINTS.CLEAR, {
    method: "DELETE",
  }, token),
};

export const ordersAPI = {
  getOrders: (token) => API_REQUEST(ORDERS_ENDPOINTS.GET_ALL, { method: "GET" }, token),
  getOrder: (id, token) => API_REQUEST(ORDERS_ENDPOINTS.GET_ONE(id), { method: "GET" }, token),
  getTracking: (id, token) => API_REQUEST(ORDERS_ENDPOINTS.TRACKING(id), { method: "GET" }, token),
  addReview: (id, payload, token) => API_REQUEST(ORDERS_ENDPOINTS.REVIEW(id), {
    method: "POST",
    body: JSON.stringify(payload),
  }, token),
  addFeedback: (id, payload, token) => API_REQUEST(ORDERS_ENDPOINTS.FEEDBACK(id), {
    method: "POST",
    body: JSON.stringify(payload),
  }, token),
};

export const paymentsAPI = {
  createRazorpayOrder: (payload, token) => API_REQUEST(PAYMENTS_ENDPOINTS.CREATE_RAZORPAY_ORDER, {
    method: "POST",
    body: JSON.stringify(payload),
  }, token),
  verifyRazorpayPayment: (payload, token) => API_REQUEST(PAYMENTS_ENDPOINTS.VERIFY_RAZORPAY_PAYMENT, {
    method: "POST",
    body: JSON.stringify(payload),
  }, token),
};

export const wishlistAPI = {
  getWishlist: (token) => API_REQUEST(WISHLIST_ENDPOINTS.GET, { method: "GET" }, token),
  addToWishlist: (payload, token) => API_REQUEST(WISHLIST_ENDPOINTS.ADD, {
    method: "POST",
    body: JSON.stringify(payload),
  }, token),
  removeFromWishlist: (payload, token) => API_REQUEST(WISHLIST_ENDPOINTS.REMOVE, {
    method: "DELETE",
    body: JSON.stringify(payload),
  }, token),
  clearWishlist: (token) => API_REQUEST(WISHLIST_ENDPOINTS.CLEAR, {
    method: "DELETE",
  }, token),
};