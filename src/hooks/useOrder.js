// src/hooks/useOrders.js

import { useState, useEffect } from 'react';
import axios from 'axios';

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/checkout');
        setOrders(response.data);
      } catch (error) {
        setError(error);
        console.error('Lỗi khi tải dữ liệu đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, loading, error };
};

export default useOrders;
