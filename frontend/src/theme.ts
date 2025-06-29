import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f7f8fa', // メイン背景
      900: '#23272f', // サイドバー背景
      accent: '#3b82f6', // アクセント
    },
    sidebarBg: '#23272f',
    sidebarHover: '#2d323c',
    sidebarActive: '#3b82f6',
    mainBg: '#f7f8fa',
  },
  fonts: {
    heading: '"Noto Sans JP", "Segoe UI", sans-serif',
    body: '"Noto Sans JP", "Segoe UI", sans-serif',
  },
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '22px',
    '2xl': '28px',
  },
});

export default theme; 