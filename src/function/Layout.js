import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import Header from '../Header'; 
import Footer from '../Footer'; 
import { Outlet } from 'react-router-dom'; 

const Layout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Đảm bảo chiều cao 100% của viewport
        backgroundColor: '#f9f9f9',
      }}
    >
      <CssBaseline /> {/* Đảm bảo các reset CSS cơ bản */}

      <Header />

      <Box
        component="main"
        sx={{
          flex: 1, // Để phần thân chiếm không gian còn lại
          p: 3, // Padding cho nội dung chính
          maxWidth: 'auto', 
          margin: '0 auto',
          width: '100%', 
          overflow: 'auto', // Đảm bảo nội dung không bị tràn ra ngoài khi có nhiều thông tin
        }}
      >
        <Outlet /> {/* Hiển thị nội dung của các route con */}
      </Box>

      <Footer />
    </Box>
  );
};

export default Layout;
