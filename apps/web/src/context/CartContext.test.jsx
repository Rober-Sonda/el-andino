import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

vi.mock('../firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
}));

const product = { id: 'premium', name: 'Yerba Premium' };

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds a product to the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addToCart(product, '1kg', 7500, 2);
    });

    expect(result.current.totalItemsCount).toBe(1);
    expect(result.current.cart[0]).toMatchObject({ cartItemId: 'premium-1kg', quantity: 2 });
  });

  it('bumps granel quantity up to the 5kg bulk minimum', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addToCart(product, 'granel', 7500, 2);
    });

    const item = result.current.cart.find((i) => i.cartItemId === 'premium-granel');
    expect(item.quantity).toBe(5);
  });

  it('removes the item when quantity drops to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    act(() => {
      result.current.addToCart(product, '1kg', 7500, 1);
    });
    act(() => {
      result.current.addToCart(product, '1kg', 7500, 0);
    });

    expect(result.current.totalItemsCount).toBe(0);
  });
});
