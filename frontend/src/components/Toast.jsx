import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// ========== ANIMATIONS ==========
const slideIn = keyframes`
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
`;

const progressBar = keyframes`
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

// ========== STYLED COMPONENTS ==========
const ToastContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  pointer-events: none;

  @media (max-width: 768px) {
    top: 70px;
    right: 1rem;
    left: 1rem;
  }
`;

const ToastWrapper = styled.div`
  background: white;
  color: #1f2937;
  padding: 0;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  min-width: 360px;
  max-width: 420px;
  animation: ${props => props.show ? slideIn : slideOut} 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  pointer-events: auto;
  overflow: hidden;
  border: 2px solid ${props => {
    if (props.type === 'success') return '#10b981';
    if (props.type === 'error') return '#ef4444';
    if (props.type === 'warning') return '#f59e0b';
    return '#1CB0F6';
  }};
  position: relative;

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
    max-width: none;
  }
`;

const ToastHeader = styled.div`
  background: ${props => {
    if (props.type === 'success') return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (props.type === 'error') return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    if (props.type === 'warning') return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)';
  }};
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  position: relative;
`;

const ToastIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  animation: ${bounce} 0.6s ease;
`;

const ToastIcon = styled.span`
  font-size: 1.75rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const ToastHeaderContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ToastTitle = styled.div`
  font-weight: 700;
  font-size: 1.125rem;
  color: white;
  margin-bottom: 0.125rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToastTimestamp = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
`;

const ToastClose = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.35);
    transform: rotate(90deg);
  }

  &:active {
    transform: rotate(90deg) scale(0.95);
  }
`;

const ToastBody = styled.div`
  padding: 1.25rem;
  background: white;
`;

const ToastMessage = styled.div`
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.6;
  font-weight: 500;
`;

const ToastProgressBar = styled.div`
  height: 4px;
  background: ${props => {
    if (props.type === 'success') return 'rgba(16, 185, 129, 0.2)';
    if (props.type === 'error') return 'rgba(239, 68, 68, 0.2)';
    if (props.type === 'warning') return 'rgba(245, 158, 11, 0.2)';
    return 'rgba(28, 176, 246, 0.2)';
  }};
  position: relative;
  overflow: hidden;
`;

const ToastProgressFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.type === 'success') return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
    if (props.type === 'error') return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
    if (props.type === 'warning') return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(90deg, #1CB0F6 0%, #0891b2 100%)';
  }};
  animation: ${progressBar} ${props => props.duration || 3000}ms linear;
  box-shadow: 0 0 8px ${props => {
    if (props.type === 'success') return 'rgba(16, 185, 129, 0.5)';
    if (props.type === 'error') return 'rgba(239, 68, 68, 0.5)';
    if (props.type === 'warning') return 'rgba(245, 158, 11, 0.5)';
    return 'rgba(28, 176, 246, 0.5)';
  }};
`;

// ========== COMPONENT ==========
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <ToastContainer>
      <ToastWrapper type={toast.type} show={toast.show}>
        <ToastHeader type={toast.type}>
          <ToastIconWrapper>
            <ToastIcon>{getIcon(toast.type)}</ToastIcon>
          </ToastIconWrapper>
          <ToastHeaderContent>
            <ToastTitle>{toast.title}</ToastTitle>
            <ToastTimestamp>{getCurrentTime()}</ToastTimestamp>
          </ToastHeaderContent>
          <ToastClose onClick={onClose}>✕</ToastClose>
        </ToastHeader>
        
        <ToastBody>
          <ToastMessage>{toast.message}</ToastMessage>
        </ToastBody>

        <ToastProgressBar type={toast.type}>
          <ToastProgressFill 
            type={toast.type} 
            duration={toast.duration || 3000}
          />
        </ToastProgressBar>
      </ToastWrapper>
    </ToastContainer>
  );
};

export default Toast;