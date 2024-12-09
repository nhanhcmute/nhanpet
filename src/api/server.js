const express = require('express');
const cors = require('cors');
const jsonServer = require('json-server');
const bodyParser = require('body-parser'); // body-parser không cần thiết nếu dùng express.json()

const app = express();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Sử dụng các middleware của jsonServer và express
app.use(middlewares);
app.use(express.json()); // Để có thể đọc dữ liệu từ request body
app.use(cors());

// Tạo dữ liệu mẫu cho người dùng
const users = [
  { id: "1", username: "admin", password: "12345", role: "admin" },
  { id: "2", username: "user", password: "67890", role: "staff" },
];

// API: Đăng nhập
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    res.status(200).json({ user: { id: user.id, username: user.username, role: user.role } });
  } else {
    res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
  }
});

// API: Lấy danh sách người dùng
app.get('/users', (req, res) => {
  res.json(users);
});

// API: Thêm tài khoản admin mới
app.post('/users', (req, res) => {
  const { username, password, role } = req.body;
  
  // Kiểm tra nếu tài khoản đã tồn tại
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Tài khoản đã tồn tại!' });
  }

  const newUser = {
    id: String(users.length + 1),
    username,
    password,
    role
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// API: Cập nhật vai trò người dùng
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: 'Người dùng không tồn tại!' });
  }

  user.role = role; // Cập nhật vai trò
  res.json(user); // Trả về người dùng đã được cập nhật
});

// API: Xóa tài khoản admin
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Người dùng không tồn tại!' });
  }

  users.splice(index, 1); // Xóa người dùng khỏi danh sách
  res.status(200).json({ message: 'Người dùng đã được xóa!' });
});

// API: Lấy danh sách sản phẩm và đánh giá
app.get('/products/:id/reviews', (req, res) => {
  const productId = req.params.id;

  // Giả sử bạn đang lưu trữ đánh giá trong cơ sở dữ liệu
  const reviews = [
    { rating: 5, review: 'Sản phẩm tuyệt vời!' },
    { rating: 4, review: 'Sản phẩm tốt nhưng có thể cải thiện.' },
    { rating: 3, review: 'Chất lượng ổn.' }
  ];

  res.json(reviews);
});

// Tạo danh sách thông báo
let notifications = [
  { message: "Đơn hàng mới", role: "admin" },
  { message: "Sản phẩm sắp hết hàng", role: "staff" },
];

app.get("/notifications", (req, res) => {
  res.json(notifications);
});

// API: Thêm thông báo mới
app.post("/notifications", (req, res) => {
  const { message, role } = req.body;
  const newNotification = { id: notifications.length + 1, message, role, createdAt: Date.now() };
  notifications.push(newNotification);
  res.status(201).json(newNotification);
});

// API: Sửa thông báo
app.put("/notifications/:id", (req, res) => {
  const { id } = req.params;
  const { message, role } = req.body;

  // Tìm thông báo cần sửa
  const notification = notifications.find((notif) => notif.id == id);
  
  if (!notification) {
    return res.status(404).send("Thông báo không tồn tại");
  }

  // Kiểm tra thời gian sửa (chỉ cho phép sửa trong vòng 1 phút)
  const timeElapsed = Date.now() - notification.createdAt;
  if (timeElapsed > 60000) {
    return res.status(400).send("Bạn chỉ có thể sửa thông báo trong vòng 1 phút");
  }

  // Cập nhật thông báo
  notification.message = message || notification.message;
  notification.role = role || notification.role;

  res.json(notification);
});

// API: Xóa thông báo
app.delete("/notifications/:id", (req, res) => {
  const { id } = req.params;
  notifications = notifications.filter((notif) => notif.id != id);
  res.status(204).send();
});

// API: Cập nhật trạng thái đơn hàng
app.patch('/checkout/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = router.db.get('checkout').find({ id }).value();

  if (!order) {
    return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
  }

  // Kiểm tra trạng thái mới có hợp lệ với trạng thái hiện tại
  const validTransitions = {
    'Chờ xác nhận': ['Chờ lấy hàng', 'Đã hủy'],
    'Chờ lấy hàng': ['Chờ giao hàng', 'Đã hủy'],
    'Chờ giao hàng': ['Hoàn thành'],
    'Hoàn thành': [],
    'Đã hủy': ['Trả hàng/Hoàn tiền'],
    'Trả hàng/Hoàn tiền': []
  };

  if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
    return res.status(400).json({ error: 'Trạng thái chuyển không hợp lệ' });
  }

  // Cập nhật trạng thái đơn hàng
  order.status = status;
  router.db.get('checkout').find({ id }).assign(order).write();

  return res.status(200).json(order);
});

// Kết nối với router của json-server để xử lý các API đơn giản cho checkout
app.use('/api', router);

// Bắt đầu server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
