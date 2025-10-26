import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  function addItem({ produto_id, nome, quantidade, preco_unitario }) {
    if (!produto_id || !quantidade || !preco_unitario) return;
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.produto_id === produto_id);
      if (idx >= 0) {
        const clone = [...prev];
        clone[idx].quantidade += quantidade;
        clone[idx].preco_unitario = preco_unitario; // permite atualizar preço
        return clone;
      }
      return [...prev, { produto_id, nome, quantidade, preco_unitario }];
    });
  }

  function updateQty(produto_id, quantidade) {
    setItems((prev) =>
      prev.map((i) => (i.produto_id === produto_id ? { ...i, quantidade } : i))
    );
  }

  function removeItem(produto_id) {
    setItems((prev) => prev.filter((i) => i.produto_id !== produto_id));
  }

  function clear() {
    setItems([]);
  }

  const total = items.reduce((acc, i) => acc + i.quantidade * i.preco_unitario, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
