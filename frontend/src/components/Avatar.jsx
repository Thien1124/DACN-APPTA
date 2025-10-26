import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../utils/api';
import Toast from './Toast';
import useToast from '../hooks/useToast';
import { AiOutlineCamera, AiOutlineLoading3Quarters, AiOutlineClose } from 'react-icons/ai';

// ========== STYLED COMPONENTS ==========

const AvatarContainer = styled.div`
  position: relative;
  display: inline-block;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

const AvatarCircle = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: ${props => {
    if (props.image) return `url(${props.image})`;
    return 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)';
  }};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.size / 2}px;
  color: white;
  font-weight: bold;
  border: ${props => props.borderWidth}px solid ${props => props.borderColor || 'white'};
  box-shadow: ${props => props.shadow ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  ${props => props.clickable && `
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(88, 204, 2, 0.3);
    }
  `}

  ${props => props.online && `
    &::after {
      content: '';
      position: absolute;
      bottom: ${props.size * 0.05}px;
      right: ${props.size * 0.05}px;
      width: ${props.size * 0.25}px;
      height: ${props.size * 0.25}px;
      background: #58CC02;
      border: 3px solid white;
      border-radius: 50%;
    }
  `}
`;

const Badge = styled.div`
  position: absolute;
  top: ${props => props.position === 'top-right' ? '0' : props.position === 'bottom-right' ? 'auto' : '0'};
  right: ${props => props.position === 'top-left' || props.position === 'bottom-left' ? 'auto' : '0'};
  bottom: ${props => props.position === 'bottom-right' || props.position === 'bottom-left' ? '0' : 'auto'};
  left: ${props => props.position === 'top-left' || props.position === 'bottom-left' ? '0' : 'auto'};
  background: ${props => props.bgColor || 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'};
  color: white;
  width: ${props => props.size * 0.35}px;
  height: ${props => props.size * 0.35}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.size * 0.2}px;
  font-weight: bold;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transform: translate(
    ${props => props.position === 'top-right' || props.position === 'bottom-right' ? '25%' : '-25%'},
    ${props => props.position === 'top-right' || props.position === 'top-left' ? '-25%' : '25%'}
  );
  z-index: 1;
`;

const LevelBadge = styled(Badge)`
  background: linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%);
  font-size: ${props => props.size * 0.15}px;
  font-weight: bold;
`;

const StatusRing = styled.div`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  border: 3px solid ${props => props.color || '#58CC02'};
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.05);
    }
  }
`;

const AvatarName = styled.div`
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
`;

const AvatarRole = styled.div`
  text-align: center;
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const UploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;

  ${AvatarCircle}:hover & {
    opacity: 1;
  }
`;

const UploadIcon = styled.div`
  color: white;
  font-size: 24px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: 2px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: #dc2626;
    transform: scale(1.1);
  }
`;

const LoadingIcon = styled(AiOutlineLoading3Quarters)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// ========== COMPONENT ==========

const Avatar = ({
  size = 80,
  image,
  name,
  username = 'vinhsonvlog',
  role,
  level,
  badge,
  badgePosition = 'top-right',
  badgeBgColor,
  online = false,
  statusRing = false,
  statusColor = '#58CC02',
  borderWidth = 3,
  borderColor = 'white',
  shadow = true,
  clickable = false,
  onClick,
  showName = false,
  showRole = false,
  theme = 'light',
  editable = false, // ✅ Thêm prop cho phép upload
  onAvatarChange, // ✅ Callback khi avatar thay đổi
  allowDelete = false, // ✅ Cho phép xóa avatar
}) => {
  const { toast, showToast, hideToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const fileInputRef = React.useRef(null);

  const getInitials = () => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return username.slice(0, 2).toUpperCase();
  };

  // ✅ Xử lý upload avatar
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Lỗi', 'Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      showToast('error', 'Lỗi', 'Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const newAvatarPath = response.data.data.avatar; // ✅ Lấy path từ response
        const newAvatarUrl = response.data.data.avatarUrl; // Full URL
        
        setCurrentImage(newAvatarUrl);
        showToast('success', 'Thành công', 'Đã cập nhật avatar');
        
        // ✅ Callback để parent component cập nhật
        if (onAvatarChange) {
          onAvatarChange(newAvatarPath); // Truyền path thay vì URL
        }

        // ✅ Cập nhật localStorage với path
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.avatar = newAvatarPath;
        localStorage.setItem('user', JSON.stringify(user));

        // ✅ Trigger custom event để các component khác cập nhật
        window.dispatchEvent(new CustomEvent('avatarUpdated', { 
          detail: { avatar: newAvatarPath } 
        }));
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể upload avatar');
    } finally {
      setUploading(false);
    }
  };

  // ✅ Xử lý xóa avatar
  const handleDeleteAvatar = async (e) => {
    e.stopPropagation();

    try {
      const response = await api.delete('/users/avatar');

      if (response.data.success) {
        setCurrentImage(null);
        showToast('success', 'Thành công', 'Đã xóa avatar');

        if (onAvatarChange) {
          onAvatarChange(null);
        }

        // ✅ Cập nhật localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.avatar = null;
        localStorage.setItem('user', JSON.stringify(user));

        // ✅ Trigger custom event
        window.dispatchEvent(new CustomEvent('avatarUpdated', { 
          detail: { avatar: null } 
        }));
      }
    } catch (error) {
      console.error('Delete avatar error:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa avatar');
    }
  };

  const handleAvatarClick = () => {
    if (editable && !uploading) {
      fileInputRef.current?.click();
    } else if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <>
      <Toast toast={toast} onClose={hideToast} />
      
      <div style={{ display: 'inline-block', position: 'relative' }}>
        <AvatarContainer size={size}>
          {statusRing && <StatusRing color={statusColor} />}
          
          <AvatarCircle
            size={size}
            image={currentImage}
            borderWidth={borderWidth}
            borderColor={borderColor}
            shadow={shadow}
            clickable={editable || clickable}
            online={online}
            onClick={handleAvatarClick}
          >
            {!currentImage && getInitials()}

            {editable && (
              <UploadOverlay>
                <UploadIcon>
                  {uploading ? (
                    <LoadingIcon size={24} />
                  ) : (
                    <AiOutlineCamera size={24} />
                  )}
                </UploadIcon>
              </UploadOverlay>
            )}
          </AvatarCircle>

          {level && (
            <LevelBadge size={size} position="bottom-right">
              {level}
            </LevelBadge>
          )}

          {badge && (
            <Badge 
              size={size} 
              position={badgePosition}
              bgColor={badgeBgColor}
            >
              {badge}
            </Badge>
          )}

          {/* ✅ Nút xóa avatar */}
          {allowDelete && currentImage && (
            <DeleteButton onClick={handleDeleteAvatar}>
              <AiOutlineClose size={16} />
            </DeleteButton>
          )}
        </AvatarContainer>

        {/* ✅ Hidden file input */}
        {editable && (
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
          />
        )}

        {showName && name && (
          <AvatarName theme={theme}>{name}</AvatarName>
        )}
        
        {showRole && role && (
          <AvatarRole theme={theme}>{role}</AvatarRole>
        )}
      </div>
    </>
  );
};

export default Avatar;