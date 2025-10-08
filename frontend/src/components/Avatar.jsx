import React from 'react';
import styled from 'styled-components';

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
}) => {
  const getInitials = () => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <AvatarContainer size={size}>
        {statusRing && <StatusRing color={statusColor} />}
        
        <AvatarCircle
          size={size}
          image={image}
          borderWidth={borderWidth}
          borderColor={borderColor}
          shadow={shadow}
          clickable={clickable}
          online={online}
          onClick={clickable ? onClick : undefined}
        >
          {!image && getInitials()}
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
      </AvatarContainer>

      {showName && name && (
        <AvatarName theme={theme}>{name}</AvatarName>
      )}
      
      {showRole && role && (
        <AvatarRole theme={theme}>{role}</AvatarRole>
      )}
    </div>
  );
};

export default Avatar;