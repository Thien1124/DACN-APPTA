import React from 'react';
import styled from 'styled-components';

// ========== STYLED COMPONENTS ==========

const ToastContainer = styled.div`
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  pointer-events: none;

  @media (max-width: 768px) {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
`;

const ToastWrapper = styled.div`
  background: ${props => {
    if (props.type === 'success') return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (props.type === 'error') return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    if (props.type === 'warning') return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)';
  }};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 300px;
  animation: ${props => props.show ? 'slideInRight' : 'slideOutRight'} 0.4s ease;
  pointer-events: auto;
  transform: translateX(${props => props.show ? '0' : '400px'});

  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;

const ToastIcon = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

const ToastMessage = styled.div`
  font-size: 0.875rem;
  opacity: 0.95;
`;

const ToastClose = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.3s ease;
  padding: 0.25rem;

  &:hover {
    opacity: 1;
  }
`;

// ========== COMPONENT ==========

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <ToastContainer>
      <ToastWrapper type={toast.type} show={toast.show}>
        <ToastIcon>{getIcon(toast.type)}</ToastIcon>
        <ToastContent>
          <ToastTitle>{toast.title}</ToastTitle>
          <ToastMessage>{toast.message}</ToastMessage>
        </ToastContent>
        <ToastClose onClick={onClose}>✕</ToastClose>
      </ToastWrapper>
    </ToastContainer>
  );
};

export default Toast;