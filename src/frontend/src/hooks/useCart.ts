import { useEffect, useState } from "react";
import { type CartItem, cartStore } from "./useQueries";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(cartStore.getItems());

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(() => {
      setItems([...cartStore.getItems()]);
    });
    return unsubscribe;
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);

  return {
    items,
    totalItems,
    totalPrice,
    addItem: cartStore.addItem,
    updateQty: cartStore.updateQty,
    removeItem: cartStore.removeItem,
    clear: cartStore.clear,
  };
}
