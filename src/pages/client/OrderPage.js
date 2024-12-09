// src/pages/OrderPage.js

import React, { useState } from 'react';
import { Container, Typography, Box, Button, Grid, Paper, Pagination, PaginationItem, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Sidebar from '../../function/Sidebar'; // Giữ nguyên Sidebar
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import useOrders from '../../hooks/useOrder'; // Import hook

const OrderPage = () => {
  const orderStatuses = [
    { id: 1, status: 'Tất Cả' },
    { id: 2, status: 'Chờ xác nhận' },
    { id: 3, status: 'Chờ lấy hàng' },
    { id: 4, status: 'Chờ giao hàng' },
    { id: 5, status: 'Hoàn thành' },
    { id: 6, status: 'Đã Hủy' },
    { id: 7, status: 'Trả hàng/Hoàn tiền' },
  ];

  const { orders, loading } = useOrders(); // Sử dụng hook để lấy dữ liệu đơn hàng
  const [selectedStatus, setSelectedStatus] = useState('Tất Cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset về trang đầu tiên
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset về trang đầu tiên
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const filteredOrders = orders
    ? orders
        .filter((order) => selectedStatus === 'Tất Cả' || order.status === selectedStatus)
        .filter((order) => {
          const details = order.details ? order.details : ''; // Kiểm tra chi tiết đơn hàng có tồn tại
          const term = searchTerm ? searchTerm : ''; // Kiểm tra từ khóa tìm kiếm có tồn tại
          return details.toLowerCase().includes(term.toLowerCase());
        })
    : [];

  const totalPages = filteredOrders.length > 0 ? Math.ceil(filteredOrders.length / itemsPerPage) : 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box
      display="flex"
      sx={{
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Sidebar />
      <Container>
        <Typography variant="h4" align="center" gutterBottom>
          Quản lý Đơn Hàng
        </Typography>

        <Box display="flex" justifyContent="center" mb={3}>
          <TextField
            label="Tìm kiếm đơn hàng"
            placeholder="Bạn có thể tìm kiếm theo ID đơn hàng hoặc tên sản phẩm..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: '100%', marginRight: '20px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box display="flex" justifyContent="center" mb={3}>
          {orderStatuses.map((status) => (
            <Button
              key={status.id}
              variant={selectedStatus === status.status ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => handleStatusChange(status.status)}
              sx={{ margin: '0 10px' }}
            >
              {status.status}
            </Button>
          ))}
        </Box>

        <Grid container spacing={2}>
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => (
              <Grid item xs={12} key={order.id}>
                <Paper sx={{ padding: '20px', boxShadow: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    ID Đơn hàng: {order.id}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Trạng thái: {order.status}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Tổng tiền: {order.totalAmount ? order.totalAmount.toLocaleString() : 'Không có dữ liệu'} VND
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Ngày tạo: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Không có dữ liệu'}
                  </Typography>

                  {/* Kiểm tra nếu có sản phẩm trong đơn hàng */}
                  <Box mt={2}>
                    {order.products && order.products.length > 0 ? (
                      order.products.map((product) => (
                        <Paper
                          key={product.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 1,
                            padding: 1,
                          }}
                        >
                          <img
                            src={product.image || '/default-image.png'} // Thêm ảnh mặc định nếu không có ảnh sản phẩm
                            alt={product.name}
                            width={60}
                            height={60}
                            style={{ objectFit: 'cover', marginRight: 16 }}
                          />
                          <Box>
                            <Typography variant="body1">
                              {product.name} - {product.quantity} x{' '}
                              {product.price ? product.price.toLocaleString() : 'Không có giá'} VND
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Tổng: {product.total ? product.total.toLocaleString() : 'Không có tổng'} VND
                            </Typography>
                          </Box>
                        </Paper>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Không có sản phẩm trong đơn hàng này.
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" style={{ color: '#757575', textAlign: 'center', marginTop: '20px' }}>
                Không có đơn hàng nào với trạng thái này hoặc từ khóa tìm kiếm.
              </Typography>
            </Grid>
          )}
        </Grid>

        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="small"
            sx={{ marginBottom: '10px' }}
            showFirstButton
            showLastButton
            renderItem={(item) => (
              <PaginationItem
                {...item}
                sx={{
                  borderRadius: '50%',
                  '&:hover': {
                    backgroundColor: '#3f51b5',
                    color: '#fff',
                  },
                }}
                slots={{
                  first: NavigateBeforeIcon,
                  last: NavigateNextIcon,
                }}
              />
            )}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default OrderPage;
