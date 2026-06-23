import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiBearerToken } from '../auth/session';
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
} from '../utils/guestCart';

const API_BASE = import.meta.env.VITE_BACKEND_API;

export const findGuestCartLine = (productId, selectedSize = 0, productType) => {
  return getGuestCart().find(
    (item) =>
      String(item.productId) === String(productId) &&
      (item.selectedSize ?? 0) === selectedSize &&
      (!productType || !item.productType || item.productType === productType)
  );
};

const fetchLoggedInCartLine = async (productId, selectedSize = 0) => {
  const token = getApiBearerToken();
  if (!token) return null;

  const res = await axios.get(`${API_BASE}/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const items = res.data?.data?.items || [];
  return (
    items.find((item) => {
      const pid = item.product?._id || item.product;
      return String(pid) === String(productId) && (item.selectedSize ?? 0) === selectedSize;
    }) || null
  );
};

export const useCartQuantity = (productId, selectedSize = 0, productType) => {
  const [quantity, setQuantity] = useState(0);
  const [cartItemId, setCartItemId] = useState(null);
  const [updating, setUpdating] = useState(false);

  const refresh = useCallback(async () => {
    if (!productId) {
      setQuantity(0);
      setCartItemId(null);
      return;
    }

    const token = getApiBearerToken();
    if (!token) {
      const line = findGuestCartLine(productId, selectedSize, productType);
      setQuantity(line?.quantity || 0);
      setCartItemId(null);
      return;
    }

    try {
      const line = await fetchLoggedInCartLine(productId, selectedSize);
      setQuantity(line?.quantity || 0);
      setCartItemId(line?._id || null);
    } catch {
      setQuantity(0);
      setCartItemId(null);
    }
  }, [productId, selectedSize, productType]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener('cart-wishlist-update', onUpdate);
    window.addEventListener('auth-changed', onUpdate);
    return () => {
      window.removeEventListener('cart-wishlist-update', onUpdate);
      window.removeEventListener('auth-changed', onUpdate);
    };
  }, [refresh]);

  const setCartQuantity = async (newQuantity) => {
    if (!productId || updating) return;

    setUpdating(true);
    try {
      const token = getApiBearerToken();

      if (!token) {
        if (newQuantity <= 0) {
          updateGuestCartItem(productId, 0, { selectedSize, productType });
        } else if (findGuestCartLine(productId, selectedSize, productType)) {
          updateGuestCartItem(productId, newQuantity, { selectedSize, productType });
        } else {
          addToGuestCart({
            productId,
            quantity: newQuantity,
            selectedSize,
            productType,
          });
        }
      } else if (newQuantity <= 0 && cartItemId) {
        await axios.delete(`${API_BASE}/cart/${cartItemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        window.dispatchEvent(new Event('cart-wishlist-update'));
      } else if (cartItemId) {
        await axios.put(
          `${API_BASE}/cart/${cartItemId}`,
          { quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.dispatchEvent(new Event('cart-wishlist-update'));
      } else if (newQuantity > 0) {
        await axios.post(
          `${API_BASE}/cart`,
          { productId, quantity: newQuantity, selectedSize, productType },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.dispatchEvent(new Event('cart-wishlist-update'));
      }

      await refresh();
    } catch (err) {
      console.error('Update cart quantity error:', err);
    } finally {
      setUpdating(false);
    }
  };

  return {
    quantity,
    updating,
    refresh,
    setCartQuantity,
    increment: () => setCartQuantity(quantity + 1),
    decrement: () => setCartQuantity(quantity - 1),
    addOne: () => setCartQuantity(quantity > 0 ? quantity + 1 : 1),
  };
};
