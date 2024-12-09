import React, { createContext, useState, useContext, useEffect } from 'react';

// Tạo context cho giỏ hàng
const CartContext = createContext();

// Custom hook để sử dụng CartContext
export const useCart = () => {
  return useContext(CartContext);
};

// CartProvider là component bọc ứng dụng để cung cấp trạng thái giỏ hàng
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Lấy giỏ hàng từ localStorage khi trang được load lại
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(item => item.id === product.id);

      if (existingProduct) {
        // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Nếu sản phẩm chưa có, thêm vào giỏ hàng
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateCartQuantity = (product, quantity) => {
    setCart((prevCart) => {
      return prevCart.map(item =>
        item.id === product.id ? { ...item, quantity } : item
      );
    });
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      return prevCart.filter(item => item.id !== productId);
    });
  };

  // Lưu giỏ hàng vào localStorage khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]); // Chỉ lưu khi cart thay đổi

  return (
    <CartContext.Provider value={{ cart, addToCart, updateCartQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
