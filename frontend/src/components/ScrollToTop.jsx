import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll lên đầu trang mỗi khi route thay đổi
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // hoặc 'smooth' nếu muốn smooth scroll
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;