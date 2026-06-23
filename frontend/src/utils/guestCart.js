// Guest Cart/Wishlist Management using localStorage
// This allows users to add items to cart/wishlist without being logged in

const GUEST_CART_KEY = 'guestCart';
const GUEST_WISHLIST_KEY = 'guestWishlist';

// ─── Guest Cart Functions ──────────────────────────────────────────────────────

export const getGuestCart = () => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

export const addToGuestCart = (item) => {
  try {
    const cart = getGuestCart();
    const existingIndex = cart.findIndex(
      (i) => i.productId === item.productId && i.selectedSize === item.selectedSize && i.productType === item.productType
    );
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += item.quantity || 1;
    } else {
      cart.push({
        productId: item.productId,
        productType: item.productType || 'Food',
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize || 0,
      });
    }
    
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-wishlist-update'));
    return cart;
  } catch (error) {
    console.error('Error adding to guest cart:', error);
    return getGuestCart();
  }
};

export const updateGuestCartItem = (productId, quantity, options = {}) => {
  const { selectedSize = 0, productType } = options;
  try {
    const cart = getGuestCart();
    const index = cart.findIndex(
      (item) =>
        String(item.productId) === String(productId) &&
        (item.selectedSize ?? 0) === selectedSize &&
        (!productType || !item.productType || item.productType === productType)
    );
    if (index > -1) {
      if (quantity <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = quantity;
      }
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-wishlist-update'));
    }
    return cart;
  } catch (error) {
    console.error('Error updating guest cart:', error);
    return getGuestCart();
  }
};

export const removeFromGuestCart = (itemId) => {
  try {
    const cart = getGuestCart();
    const filtered = cart.filter((i) => i.productId !== itemId);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('cart-wishlist-update'));
    return filtered;
  } catch (error) {
    console.error('Error removing from guest cart:', error);
    return getGuestCart();
  }
};

export const clearGuestCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
    window.dispatchEvent(new Event('cart-wishlist-update'));
  } catch (error) {
    console.error('Error clearing guest cart:', error);
  }
};

export const getGuestCartCount = () => {
  const cart = getGuestCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};

// ─── Guest Wishlist Functions ─────────────────────────────────────────────────

export const getGuestWishlist = () => {
  try {
    const wishlist = localStorage.getItem(GUEST_WISHLIST_KEY);
    return wishlist ? JSON.parse(wishlist) : [];
  } catch {
    return [];
  }
};

export const addToGuestWishlist = (product) => {
  try {
    const wishlist = getGuestWishlist();
    const id = typeof product === 'string' ? product : product._id;

    const exists = wishlist.some((item) =>
      typeof item === 'string' ? item === id : item._id === id
    );

    if (!exists) {
      const entry = typeof product === 'string' ? product : product;
      wishlist.push(entry);
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlist));
      window.dispatchEvent(new Event('cart-wishlist-update'));
    }
    return wishlist;
  } catch (error) {
    console.error('Error adding to guest wishlist:', error);
    return getGuestWishlist();
  }
};

export const removeFromGuestWishlist = (productId) => {
  try {
    const wishlist = getGuestWishlist();
    const filtered = wishlist.filter((item) =>
      typeof item === 'string' ? item !== productId : item._id !== productId
    );
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('cart-wishlist-update'));
    return filtered;
  } catch (error) {
    console.error('Error removing from guest wishlist:', error);
    return getGuestWishlist();
  }
};

export const isInGuestWishlist = (productId) => {
  const wishlist = getGuestWishlist();
  return wishlist.some((item) =>
    typeof item === 'string' ? item === productId : item._id === productId
  );
};

export const clearGuestWishlist = () => {
  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
    window.dispatchEvent(new Event('cart-wishlist-update'));
  } catch (error) {
    console.error('Error clearing guest wishlist:', error);
  }
};

// ─── Sync Guest Cart/Wishlist to Backend After Login ────────────────────────

export const syncGuestCartToBackend = async (token, API_BASE) => {
  try {
    const guestCart = getGuestCart();
    if (guestCart.length === 0) return;

    const axios = (await import('axios')).default;
    
    // Add each item to backend cart
    for (const item of guestCart) {
      try {
        await axios.post(
          `${API_BASE}/cart`,
          {
            productId: item.productId,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            productType: item.productType,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Error syncing cart item:', err);
      }
    }
    
    // Clear guest cart after successful sync
    clearGuestCart();
  } catch (error) {
    console.error('Error syncing guest cart to backend:', error);
  }
};

export const syncGuestWishlistToBackend = async (token, API_BASE) => {
  try {
    const guestWishlist = getGuestWishlist();
    if (guestWishlist.length === 0) return;

    const axios = (await import('axios')).default;
    
    // Add each item to backend wishlist
    for (const item of guestWishlist) {
      try {
        // Extract productId - handle both string and object formats
        let productId = null;
        if (typeof item === 'string') {
          productId = item;
        } else if (item && typeof item === 'object') {
          productId = String(item._id || item.productId || '');
        }
        
        if (!productId || productId === 'undefined' || productId === 'null') {
          continue;
        }
        
        await axios.post(
          `${API_BASE}/wishlist`,
          { productId: String(productId) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Error syncing wishlist item:', err);
      }
    }
    
    // Clear guest wishlist after successful sync
    clearGuestWishlist();
  } catch (error) {
    console.error('Error syncing guest wishlist to backend:', error);
  }
};
