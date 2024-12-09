import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField, Paper, Card, CardContent, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();  // Dùng để điều hướng về trang ProductPage
    const [cart, setCart] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [voucher, setVoucher] = useState('');
    const [discount, setDiscount] = useState(0);
    const [shippingFee, setShippingFee] = useState(20000);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [note, setNote] = useState('');
    const [voucherType, setVoucherType] = useState('');  // Định nghĩa voucherType

    useEffect(() => {
        if (location.state) {
            setCart(location.state.cart);
            setSelectedItems(location.state.selectedItems);
        }

        // Lấy địa chỉ mặc định từ localStorage
        const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
        const defaultAddr = addresses.find(address => address.isDefault);
        setDefaultAddress(defaultAddr);
    }, [location.state]);

    const calculateTotalAmount = () => {
        return cart.reduce((total, product) => {
            if (selectedItems[product.id]) {
                return total + product.price * product.quantity;
            }
            return total;
        }, 0);
    };

    const totalAmount = calculateTotalAmount() + shippingFee - discount;

    const handleVoucherChange = (e) => {
        setVoucher(e.target.value);
        // Kiểm tra mã voucher
        const validVouchers = [
            { code: 'DISCOUNT10', discount: 0.1 },
            { code: 'DISCOUNT20', discount: 0.2 },
            { code: 'DISCOUNT30', discount: 0.3 }
        ];
        const foundVoucher = validVouchers.find(v => v.code === e.target.value);
        if (foundVoucher) {
            setDiscount(foundVoucher.discount * calculateTotalAmount());
        } else {
            setDiscount(0);
        }
    };

    const handleVoucherTypeChange = (e) => {
        setVoucherType(e.target.value);
        setVoucher('');
        setDiscount(0);
    };

    const handleConfirmPayment = async () => {
        if (!cart || cart.length === 0) {
            alert('Không có sản phẩm nào trong giỏ hàng để thanh toán.');
            navigate('/cart'); // Chuyển hướng về giỏ hàng nếu không có sản phẩm
            return;
        }
    
        // Lấy thông tin khách hàng và địa chỉ giao hàng từ defaultAddress
        if (!defaultAddress) {
            alert('Vui lòng thêm địa chỉ giao hàng trước khi thanh toán.');
            return;
        }
    
        // Chuẩn bị dữ liệu đơn hàng mới với từng sản phẩm riêng biệt
        const newOrder = {
            id: Date.now(), // ID duy nhất cho đơn hàng
            customer: {
                name: defaultAddress.fullName,
                phone: defaultAddress.phone,
                address: `${defaultAddress.province}, ${defaultAddress.district}, ${defaultAddress.ward}`,
                addressType: defaultAddress.addressType, // Loại địa chỉ (ví dụ: nhà riêng, công ty, v.v.)
            },
            products: cart.map((product) => ({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: product.quantity,
                image: product.image, // Hình ảnh của sản phẩm
                total: product.price * product.quantity, // Tổng tiền cho sản phẩm
            })),
            status: 'Chờ lấy hàng', // Trạng thái mặc định
            totalAmount: totalAmount, // Tổng tiền toàn bộ đơn hàng
            createdAt: new Date().toISOString(), // Thời gian thanh toán
        };
    
        try {
            // Gửi yêu cầu POST để lưu đơn hàng vào API
            await axios.post('http://localhost:3000/checkout', newOrder);
    
            // Thông báo thành công và điều hướng đến trang quản lý đơn hàng
            alert('Mua hàng thành công!');
            navigate('/orders');
        } catch (error) {
            console.error('Lỗi khi lưu đơn hàng:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại.');
        }
    };
    

    const handleNoProducts = () => {
        navigate('/cart'); // Điều hướng người dùng về trang giỏ hàng
    };


    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Mua hàng
            </Typography>

            {/* Kiểm tra giỏ hàng có sản phẩm không */}
            {cart.length === 0 ? (
                <Alert severity="info" action={
                    <Button color="inherit" size="small" onClick={handleNoProducts}>
                        OK
                    </Button>
                }>
                    Chưa có sản phẩm, vui lòng mua hàng
                </Alert>
            ) : (
                <>
                    {/* Địa chỉ giao hàng */}
                    {defaultAddress ? (
                        <Card sx={{ marginBottom: 2, borderRadius: 0 }}>
                            <CardContent>
                                <Typography variant="h6">Địa chỉ giao hàng:</Typography>
                                <Typography variant="body1">
                                    {defaultAddress.fullName} - {defaultAddress.phone}
                                </Typography>
                                <Typography variant="body1">
                                    {defaultAddress.province}, {defaultAddress.district}, {defaultAddress.ward}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Loại địa chỉ: {defaultAddress.addressType}
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Typography variant="body1" color="error">
                            Bạn chưa có địa chỉ mặc định!
                        </Typography>
                    )}
                    {/* Hiển thị sản phẩm và thông tin cột */}
                    {cart.map((product) => (
                        selectedItems[product.id] && (
                            <Paper sx={{ padding: 2, marginBottom: 2, borderRadius: 0 }} key={product.id}>
                                <Grid container spacing={2}>
                                    {/* Tên sản phẩm */}
                                    <Grid item xs={3} md={6}>
                                        <Grid container spacing={2}>
                                            <Grid item>
                                                <img src={product.image} alt={product.name} width={50} height={50} style={{ objectFit: 'cover' }} />
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" fontWeight="bold">Sản Phẩm</Typography>
                                                <Typography variant="body1">{product.name}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Đơn giá */}
                                    <Grid item xs={2} md={2}>
                                        <Typography variant="body1" fontWeight="bold">Đơn Giá</Typography>
                                        <Typography variant="body1">{product.price.toLocaleString()} VND</Typography>
                                    </Grid>

                                    {/* Số lượng */}
                                    <Grid item xs={2} md={2}>
                                        <Typography variant="body1" fontWeight="bold">Số Lượng</Typography>
                                        <Typography variant="body1">{product.quantity}</Typography>
                                    </Grid>

                                    {/* Thành tiền (Đơn giá * Số lượng) */}
                                    <Grid item xs={3} md={2}>
                                        <Typography variant="body1" fontWeight="bold">Thành Tiền</Typography>
                                        <Typography variant="body1">
                                            {(product.price * product.quantity).toLocaleString()} VND
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        )
                    ))}

                    {/* Chọn Voucher */}
                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        <InputLabel >Chọn Voucher</InputLabel>
                        <Select value={voucher} onChange={handleVoucherChange} label="Voucher">
                            <MenuItem value="DISCOUNT10">Giảm 10%</MenuItem>
                            <MenuItem value="DISCOUNT20">Giảm 20%</MenuItem>
                            <MenuItem value="DISCOUNT30">Giảm 30%</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Phương thức vận chuyển */}
                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        <InputLabel>Phương thức vận chuyển</InputLabel>
                        <Select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)} label="Phương thức vận chuyển">
                            <MenuItem value="standard">Giao hàng tiêu chuẩn (3-5 ngày)</MenuItem>
                            <MenuItem value="express">Giao hàng nhanh (1-2 ngày)</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Ghi chú cho người bán */}
                    <TextField
                        fullWidth
                        label="Ghi chú cho người bán"
                        multiline
                        rows={4}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />

                    {/* Phương thức thanh toán */}
                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        <InputLabel>Phương thức thanh toán</InputLabel>
                        <Select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            label="Phương thức thanh toán"
                        >
                            <MenuItem value="cash">Thanh toán khi nhận hàng</MenuItem>
                            <MenuItem value="wallet">Thanh toán qua ví điện tử Momo</MenuItem>
                            <MenuItem value="wallet">Thanh toán qua ngân hàng</MenuItem>
                            <MenuItem value="wallet">Thẻ tín dụng/Ghi nợ</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Phí vận chuyển và tổng tiền thanh toán */}
                    <Typography variant="body1" sx={{ marginBottom: 2 }}>
                        Phí vận chuyển: {shippingFee.toLocaleString()} VND
                    </Typography>
                    <Typography variant="h6" sx={{ marginBottom: 2 }}>
                        Tổng số tiền cần thanh toán: {totalAmount.toLocaleString()} VND
                    </Typography>

                    {/* Xác nhận thanh toán */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmPayment}
                        sx={{ marginTop: 2, borderRadius: 0 }}
                    >
                        Xác nhận mua hàng
                    </Button>
                </>
            )}
        </Box>
    );
};

export default CheckoutPage;
