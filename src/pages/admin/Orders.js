import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, CircularProgress, TextField, Button, Box, Card, CardContent, CardActions, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { CSVLink } from 'react-csv';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  const orderStatuses = [
    { id: 1, status: 'Tất Cả' },
    { id: 2, status: 'Chờ xác nhận' },
    { id: 3, status: 'Chờ lấy hàng' },
    { id: 4, status: 'Chờ giao hàng' },
    { id: 5, status: 'Hoàn thành' },
    { id: 6, status: 'Đã Hủy' },
    { id: 7, status: 'Trả hàng/Hoàn tiền' },
  ];

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('http://localhost:5000/checkout');
        const data = await response.json();
        if (Array.isArray(data)) {
          setOrders(data);
          setFilteredOrders(data);
        } else {
          console.error('Invalid data format:', data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  const handleSearch = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = orders.filter(order =>
      (order.id && order.id.toString().includes(lowercasedQuery)) ||
      (order.customer?.name && order.customer.name.toLowerCase().includes(lowercasedQuery))
    );
    setFilteredOrders(filtered);
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setOpenDialog(true);
  };

  const handleOpenDetailDialog = (order) => {
    setSelectedOrder(order);
    setOpenDetailDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenDetailDialog(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  const handleChangeStatus = async () => {
    if (selectedOrder && newStatus) {
      const validTransitions = {
        'Chờ xác nhận': ['Chờ lấy hàng', 'Đã hủy'],
        'Chờ lấy hàng': ['Chờ giao hàng', 'Đã hủy'],
        'Chờ giao hàng': ['Hoàn thành'],
        'Hoàn thành': [],
        'Đã hủy': ['Trả hàng/Hoàn tiền'],
        'Trả hàng/Hoàn tiền': []
      };
  
      // Kiểm tra trạng thái hiện tại và trạng thái mới có hợp lệ hay không
      if (!validTransitions[selectedOrder.status] || !validTransitions[selectedOrder.status].includes(newStatus)) {
        alert('Không thể thay đổi trạng thái theo cách này. Vui lòng kiểm tra thứ tự chuyển trạng thái.');
        return;
      }
  
      // Cập nhật trạng thái đơn hàng trong state của frontend
      const updatedOrders = orders.map(order =>
        order.id === selectedOrder.id ? { ...order, status: newStatus } : order
      );
  
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
  
      // Gửi yêu cầu PATCH để thay đổi trạng thái đơn hàng trên server
      try {
        const response = await fetch(`http://localhost:5000/checkout/${String(selectedOrder.id)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });
        console.log(selectedOrder);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Lỗi khi cập nhật trạng thái:', errorText);
          throw new Error('Cập nhật trạng thái đơn hàng thất bại');
        }
        console.log(response);
        alert('Cập nhật trạng thái đơn hàng thành công');
        handleCloseDialog();
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        alert('Đã có lỗi khi cập nhật trạng thái đơn hàng.');
      }
    }
  };
  


  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ xác nhận': return 'orange';
      case 'Chờ lấy hàng': return 'orange';
      case 'Chờ giao hàng': return 'blue';
      case 'Hoàn thành': return 'green';
      case 'Đã Hủy': return 'red';
      case 'Trả hàng/Hoàn tiền': return 'purple';
      default: return 'black';
    }
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>Quản lý đơn hàng</Typography>

      {/* Tìm kiếm đơn hàng */}
      <Grid container spacing={2} sx={{ marginBottom: 4 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Tìm kiếm theo mã đơn hàng, tên khách hàng"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'primary.main' },
                '&:hover fieldset': { borderColor: 'primary.dark' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSearch}
            sx={{
              height: "56px",
              '&:hover': { backgroundColor: 'primary.dark' },
              padding: '10px 0'
            }}
          >
            Tìm kiếm
          </Button>
        </Grid>
      </Grid>

      {/* Danh sách đơn hàng */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>Danh sách đơn hàng</Typography>

            {filteredOrders.length > 0 ? (
              <Grid container spacing={3}>
                {filteredOrders.map(order => (
                  <Grid item xs={12} sm={6} md={4} key={order.id}>
                    <Card sx={{ boxShadow: 3, borderRadius: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <CardContent sx={{ flexGrow: 1, overflow: 'hidden' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Mã đơn hàng: {order.id}
                        </Typography>

                        {/* Giới hạn chiều cao và thêm dấu ba chấm */}
                        <Typography variant="body1" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Tên khách hàng: {order.customer?.name || 'Chưa có tên'}
                        </Typography>

                        {/* Cho phép cuộn nếu sản phẩm quá dài */}
                        <Typography variant="body1" sx={{ overflowY: 'auto', maxHeight: '100px' }}>
                          Sản phẩm: {order.products?.map(p => p.name).join(", ") || 'Không có sản phẩm'}
                        </Typography>

                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Tổng giá trị: {order.totalAmount} VNĐ</Typography>
                        <Typography variant="body2">Trạng thái: <span style={{ color: getStatusColor(order.status) }}>{order.status}</span></Typography>
                      </CardContent>

                      <CardActions sx={{ justifyContent: 'space-between', padding: '10px' }}>
                        <Grid container spacing={2} sx={{ width: '100%' }}>
                          <Grid item xs={6}>
                            <Button
                              variant="contained"
                              color="info"
                              fullWidth
                              onClick={() => handleOpenDialog(order)}
                            >
                              Trạng thái
                            </Button>
                          </Grid>
                          <Grid item xs={6}>
                            <Button
                              variant="contained"
                              color="secondary"
                              fullWidth
                              onClick={() => handleOpenDetailDialog(order)}
                            >
                              Chi tiết
                            </Button>
                          </Grid>
                        </Grid>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" sx={{ color: 'error.main' }}>Không có đơn hàng nào phù hợp với tìm kiếm của bạn.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>


      {/* Xuất dữ liệu CSV */}
      <Grid container spacing={2} sx={{ marginTop: 4 }}>
        <Grid item xs={12}>
          <CSVLink
            data={filteredOrders}
            filename={`orders-${new Date().toLocaleDateString()}.csv`}
            className="csv-link"
          >
            <Button
              variant="contained"
              color="success"
              fullWidth
            >
              Xuất dữ liệu CSV
            </Button>
          </CSVLink>
        </Grid>
      </Grid>

      {/* Dialog thay đổi trạng thái */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Thay đổi trạng thái đơn hàng</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Chọn trạng thái mới</InputLabel>
            <Select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              label="Chọn trạng thái mới"
            >
              {orderStatuses.map(status => (
                <MenuItem key={status.id} value={status.status}>
                  {status.status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Hủy</Button>
          <Button onClick={handleChangeStatus} color="primary">Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chi tiết đơn hàng */}
      <Dialog open={openDetailDialog} onClose={handleCloseDialog}>
        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        <DialogContent>
          {selectedOrder ? (
            <>
              <Typography variant="h6">Mã đơn hàng: {selectedOrder.id}</Typography>
              <Typography variant="body1">Tên khách hàng: {selectedOrder.customer?.name || 'Chưa có tên'}</Typography>
              <Typography variant="body1">Số điện thoại: {selectedOrder.customer?.phone || 'Chưa có số điện thoại'}</Typography>
              <Typography variant="body1">Địa chỉ: {selectedOrder.customer?.address || 'Chưa có địa chỉ'}</Typography>
              <Typography variant="body1">Loại địa chỉ: {selectedOrder.customer?.addressType || 'Chưa có loại địa chỉ'}</Typography>
              <Typography variant="body1">Sản phẩm:</Typography>
              <ul>
                {selectedOrder.products?.map((product, index) => (
                  <li key={index}>{product.name} - {product.quantity} x {product.price} VNĐ</li>
                ))}
              </ul>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Tổng giá trị: {selectedOrder.totalAmount} VNĐ</Typography>
              <Typography variant="body2">Trạng thái: {selectedOrder.status}</Typography>
            </>
          ) : (
            <Typography variant="body1">Không có thông tin chi tiết đơn hàng.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Orders;
