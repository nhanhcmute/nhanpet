import React, { useState } from 'react';
import { Container, Grid, Typography, Card, CardContent, Box, Button, Checkbox, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../../function/CartContext';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart } = useCart();
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState({}); // Lưu trạng thái checkbox của từng sản phẩm
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cart.reduce((total, product) => {
      if (selectedItems[product.id]) {
        return total + product.price * product.quantity;
      }
      return total;
    }, 0);
  };

  const handleQuantityChange = (product, quantity) => {
    if (quantity > 0) updateCartQuantity(product, quantity);
  };

  const handleRemoveFromCart = (product) => removeFromCart(product);

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    const newSelectedItems = {};
    cart.forEach((product) => {
      newSelectedItems[product.id] = isChecked;
    });
    setSelectedItems(newSelectedItems); // Chọn tất cả các sản phẩm
  };

  const handleSelectItemChange = (product, event) => {
    const isChecked = event.target.checked;
    setSelectedItems((prevSelectedItems) => ({
      ...prevSelectedItems,
      [product.id]: isChecked,
    }));
  };

  const handleRemoveAll = () => {
    cart.forEach((product) => removeFromCart(product));
  };

  const handleCheckout = () => {
    // Kiểm tra xem có sản phẩm nào được chọn hay không
    const isSelectedAnyProduct = Object.values(selectedItems).includes(true);
  
    // Kiểm tra giỏ hàng có sản phẩm không
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }
  
    // Kiểm tra xem có sản phẩm nào được chọn cho thanh toán
    if (!isSelectedAnyProduct) {
      alert('Bạn chưa chọn sản phẩm thanh toán!');
      return;
    }
  
    // Điều hướng đến trang thanh toán (Checkout) và truyền giỏ hàng + sản phẩm đã chọn
    navigate('/checkout', {
      state: {
        cart: cart,
        selectedItems: selectedItems,
      },
    });
  };

  const handleIncrease = (product) => {
    updateCartQuantity(product, product.quantity + 1); // Tăng số lượng sản phẩm
  };

  const handleDecrease = (product) => {
    if (product.quantity > 1) {
      updateCartQuantity(product, product.quantity - 1); // Giảm số lượng sản phẩm, tránh giảm xuống 0
    }
  };

  if (cart.length === 0) {
    return (
      <Container>
        <Typography variant="h6" align="center" sx={{ marginTop: '20px' }}>
          Giỏ hàng của bạn đang trống.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ paddingTop: '10px' }}>
      <Typography variant="h4" sx={{ margin: '20px 0', color: '#EE4D2D', fontWeight: 'bold' }}>
        Giỏ hàng của bạn
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Checkbox
          color="primary"
          checked={selectAll}
          onChange={handleSelectAllChange} // Chọn tất cả
        />
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000000DE' }}>
          Chọn Tất Cả ({cart.length})
        </Typography>
        <Button
          variant="contained"
          onClick={handleRemoveAll}
          sx={{ borderRadius: 0, color: '#fff', backgroundColor: '#EE4D2D' }}
        >
          Xóa tất cả
        </Button>
      </Box>

      <Grid container spacing={3}>
        {cart.map((product) => (
          <Grid item xs={12} key={product.id}>
            <Card sx={{ boxShadow: 0.1, borderRadius: 0 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    color="primary"
                    checked={selectedItems[product.id] || false} // Kiểm tra checkbox cho sản phẩm này
                    onChange={(event) => handleSelectItemChange(product, event)} // Xử lý thay đổi checkbox của từng sản phẩm
                  />
                  <Box
                    component="img"
                    src={product.image}
                    alt={product.name}
                    sx={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      marginRight: 2,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000000DE', marginBottom: '5px' }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="#000000DE" sx={{ marginBottom: '10px' }}>
                      {product.description}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'red', fontWeight: 'bold' }}>
                      Flash Sale 🔥
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', padding: '0 0px', justifyContent: 'space-between', marginRight: '40px', width: '120px' }}>
                      <IconButton onClick={() => handleDecrease(product)} sx={{ padding: '5px', color: "#000000DE" }}>
                        <RemoveIcon />
                      </IconButton>
                      <Box sx={{ border: '1px solid #ccc' }}>
                        <Typography variant="body1" sx={{ marginX: 1 }}>
                          {product.quantity}
                        </Typography>
                      </Box>
                      <IconButton onClick={() => handleIncrease(product)} sx={{ padding: '5px', color: "#000000DE" }}>
                        <AddIcon />
                      </IconButton>
                    </Box>
                    <Typography sx={{ padding: '5px', fontWeight: 'bold', color: "#EE4D2D" }}>
                      {product.price * product.quantity} VND
                    </Typography>
                    <IconButton color="error" onClick={() => handleRemoveFromCart(product)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, padding: '20px', boxShadow: 3 }}>
        <Typography sx={{ fontWeight: 'bold', color: '#000000DE' }}>
          Tổng cộng:
        </Typography>
        <Typography sx={{ fontWeight: 'bold', color: '#EE4D2D' }}>
          {calculateTotal()} VND
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{
            padding: '10px 20px',
            backgroundColor: "#EE4D2D",
            color: '#fff',
            borderRadius: 0,
          }}
          onClick={handleCheckout}
        >
          Thanh toán ngay
        </Button>
      </Box>
    </Container>
  );
};

export default CartPage;
