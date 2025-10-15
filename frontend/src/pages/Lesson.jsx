import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import coffee from '../assets/coffee.png';
import milk from '../assets/milk.png';
import tea from '../assets/tea.png';
import water from '../assets/water.png';
import juice from '../assets/juice.png';
import newIcon from '../assets/new.png'; 
import reportIcon from '../assets/report.png';
import chibiImg from '../assets/chibi.png'; 
import loopIcon from '../assets/loop.png';
import logo from '../assets/logo.png';

import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
`;

const slideUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(100%); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const checkmark = keyframes`
  0% {
    transform: scale(0) rotate(-45deg);
  }
  50% {
    transform: scale(1.2) rotate(-45deg);
  }
  100% {
    transform: scale(1) rotate(-45deg);
  }
`;

const modalFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const modalSlideUp = keyframes`
  from { opacity: 0; transform: translateY(50px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;


const celebrationAnimation = keyframes`
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
  100% { transform: scale(1) rotate(360deg); opacity: 1; }
`;

const slideInFromBottom = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;


// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 0.625rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
  }
    
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.75rem;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
`;

const ProgressBarContainer = styled.div`
  flex: 1;
  height: 16px;
  background: #e5e7eb;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #58CC02 0%, #45a302 100%);
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
  border-radius: 20px;
`;

const HeartsContainer = styled.div`
  display: flex;
  align-items:  center;
  gap: 0.375rem;
  color: #ef4444;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 90px 2rem 180px;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: ${fadeIn} 0.6s ease;

  @media (max-width: 768px) {
    padding: 80px 1rem 180px;
  }
`;

const QuestionBadge = styled.div`
  background: ${props => props.isReview ? '#FF9600' : '#1CB0F6'};
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: ${scaleIn} 0.5s ease;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
    margin-bottom: 1.5rem;
  }
`;

const BadgeIcon = styled.img`
  width: 18px;
  height: 18px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 16px;
    height: 16px;
  }
`;

const QuestionText = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 2.5rem 0;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const ChoicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }
`;

const ChoiceCard = styled.button`
  background: white;
  border: 3px solid ${props => {
    if (props.isCorrect && props.isChecked) return '#58CC02';
    if (props.isWrong && props.isChecked) return '#ef4444';
    if (props.selected) return '#1CB0F6';
    return '#e5e7eb';
  }};
  border-radius: 16px;
  padding: 1.5rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  box-shadow: ${props => {
    if (props.isCorrect && props.isChecked) return '0 6px 20px rgba(88, 204, 2, 0.3)';
    if (props.isWrong && props.isChecked) return '0 6px 20px rgba(239, 68, 68, 0.3)';
    return '0 2px 8px rgba(0, 0, 0, 0.06)';
  }};
  animation: ${props => props.isWrong && props.isChecked ? shake : 'none'} 0.5s ease;
  opacity: ${props => props.disabled && !props.selected ? 0.5 : 1};

  &:hover:not(:disabled) {
    border-color: ${props => {
      if (props.isChecked) return props.isCorrect ? '#58CC02' : '#ef4444';
      return '#1CB0F6';
    }};
    transform: ${props => props.disabled ? 'none' : 'translateY(-4px)'};
    box-shadow: 0 8px 24px rgba(28, 176, 246, 0.2);
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    gap: 0.875rem;
  }
`;

const ChoiceImage = styled.img`
  width: 140px;
  height: 140px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

const ChoiceTextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
`;

const ChoiceNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 0.8125rem;
  }
`;

const ChoiceText = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  text-align: left;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SpeakerButton = styled.button`
  background: #1CB0F6;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: #0d9ed8;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const Footer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: center;
  gap: 1rem;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    flex-direction: column;
  }
`;

const SkipButton = styled.button`
  background: transparent;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 150px;

  &:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
  }
`;

const CheckButton = styled.button`
  background: ${props => {
    if (props.disabled) return '#e5e7eb';
    if (props.isCorrect) return '#58CC02';
    if (props.isWrong) return '#ef4444';
    return '#58CC02';
  }};
  border: none;
  color: white;
  padding: 0.875rem 2.25rem;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.disabled ? 'none' : '0 4px 16px rgba(88, 204, 2, 0.3)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 170px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1.75rem;
    font-size: 0.875rem;
  }
`;

const MatchPairsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 2rem 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const PairColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PairCard = styled.button`
  background: white;
  border: 3px solid ${props => {
    if (props.matched) return '#58CC02';
    if (props.selected) return '#1CB0F6';
    return '#e5e7eb';
  }};
  border-radius: 12px;
  padding: 1rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  cursor: ${props => props.matched ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  opacity: ${props => props.matched ? 0.5 : 1};
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover:not(:disabled) {
    border-color: ${props => props.matched ? '#58CC02' : '#1CB0F6'};
    transform: ${props => props.matched ? 'none' : 'translateY(-2px)'};
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
  }
`;

const PairNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => props.matched ? '#58CC02' : '#f3f4f6'};
  color: ${props => props.matched ? 'white' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 0.8125rem;
  }
`;

const MatchIcon = styled.div`
  font-size: 1.25rem;
  margin-left: auto;
`;
const FeedbackBanner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.isCorrect ? '#d7ffb8' : '#ffdfe0'};
  padding: 0.5rem 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 101;
  animation: ${slideUp} 0.4s ease-out;
  border-top: 1px solid ${props => props.isCorrect ? '#58CC02' : '#ef4444'};

  @media (max-width: 1024px) {
    padding: 1.25rem 2rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
    border-top-width: 3px;
  }
`;

const ContinueButton = styled.button`
  background: ${props => props.isCorrect ? '#58CC02' : '#ff4b4b'};
  border: none;
  color: white;
  padding: 1.125rem 3.5rem;
  border-radius: 16px;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 0 ${props => props.isCorrect ? '#46A302' : '#dc2626'};
  min-width: 200px;
  flex-shrink: 0;
  position: absolute;
  right: 4rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 ${props => props.isCorrect ? '#46A302' : '#dc2626'};
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 ${props => props.isCorrect ? '#46A302' : '#dc2626'};
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    position: static;
  }
`;
const FeedbackContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;

  @media (max-width: 768px) {
    gap: 1rem;
    width: 100%;
  }
`;

const FeedbackIconWrapper = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${props => props.isCorrect ? '#58CC02' : '#ef4444'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;


const FeedbackIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.isCorrect ? '#58CC02' : '#ef4444'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
`;

const FeedbackText = styled.div`
  color: ${props => props.isCorrect ? '#047857' : '#991b1b'};
  font-size: 1.25rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const CheckmarkIcon = styled.div`
  width: 28px;
  height: 52px;
  border-right: 7px solid white;
  border-bottom: 7px solid white;
  transform: rotate(45deg);
  animation: ${checkmark} 0.5s ease-out;
  margin-bottom: 10px;
  margin-left: 5px;

  @media (max-width: 768px) {
    width: 24px;
    height: 48px;
    border-right-width: 6px;
    border-bottom-width: 6px;
  }
`;

const CrossIcon = styled.div`
  position: relative;
  width: 52px;
  height: 52px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 7px;
    height: 44px;
    background: white;
    transform: translate(-50%, -50%) rotate(45deg);
  }

  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;

    &::before,
    &::after {
      width: 6px;
      height: 38px;
    }
  }
`;

const FeedbackTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;

  @media (max-width: 768px) {
    gap: 0.375rem;
  }
`;

const FeedbackTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.isCorrect ? '#58CC02' : '#ef4444'};
  margin: 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.625rem;
  }
`;

const FeedbackSubtext = styled.p`
  font-size: 1.125rem;
  font-weight: 700;
  color: #3c3c3c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ReportLink = styled.button`
  background: none;
  border: none;
  color: #1cb0f6;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-top: 0.25rem;
  opacity: 0.6;
  width: fit-content;

  &:hover {
    opacity: 1;
  }

  @media (max-width: 768px) {
    font-size: 0.9375rem;
    padding: 0.25rem 0.5rem;
  }
`;



const ReportIcon = styled.img`
  width: 18px;
  height: 18px;
  object-fit: contain;
  opacity: 0.7;
  transition: opacity 0.3s ease;

  ${ReportLink}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    width: 16px;
    height: 16px;
  }
`;



const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${modalFadeIn} 0.3s ease;
  padding: 1rem;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 450px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${modalSlideUp} 0.4s ease;
  margin: auto;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    max-width: 95%;
    max-height: 90vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.5rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

const ModalDescription = styled.p`
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ReportOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 1rem;
`;

const ReportOption = styled.button`
  background: ${props => props.selected ? '#E0F2FE' : 'white'};
  border: 2px solid ${props => props.selected ? '#1CB0F6' : '#e5e7eb'};
  color: #1f2937;
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;

  &:hover {
    border-color: #1CB0F6;
    background: #E0F2FE;
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.625rem;
  }
`;

const TextAreaWrapper = styled.div`
  margin-bottom: 1rem;
`;

const TextAreaLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.375rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-family: inherit;
  color: #1f2937;
  resize: vertical;
  min-height: 80px;
  max-height: 120px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #1CB0F6;
  }

  &::placeholder {
    color: #9ca3af;
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    min-height: 70px;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.625rem;
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ModalButton = styled.button`
  background: ${props => props.primary ? '#1CB0F6' : 'transparent'};
  border: 2px solid ${props => props.primary ? '#1CB0F6' : '#e5e7eb'};
  color: ${props => props.primary ? 'white' : '#6b7280'};
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.primary ? 'rgba(28, 176, 246, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
  }
`;

// Thêm styled components mới cho các loại câu hỏi khác
const SpeechBubble = styled.div`
  background: white;
  border: 3px solid #e5e7eb;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  position: relative;
  margin: 2rem 0;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &::before {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 30px;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid white;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -14px;
    left: 27px;
    width: 0;
    height: 0;
    border-left: 13px solid transparent;
    border-right: 13px solid transparent;
    border-top: 14px solid #e5e7eb;
    z-index: -1;
  }
`;

const CharacterImage = styled.img`
  width: 180px;
  height: 180px;
  object-fit: contain;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
  }
`;

const AudioButton = styled.button`
  background: #1CB0F6;
  border: none;
  color: white;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 2rem;
  box-shadow: 0 4px 16px rgba(28, 176, 246, 0.3);
  margin: 2rem auto;

  &:hover {
    background: #0d9ed8;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    width: 70px;
    height: 70px;
    font-size: 1.75rem;
  }
`;

const WordBankContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin: 2rem 0;
`;

const WordChip = styled.button`
  background: white;
  border: 3px solid ${props => props.selected ? '#1CB0F6' : '#e5e7eb'};
  color: #1f2937;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    border-color: #1CB0F6;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.9375rem;
  }
`;

const AnswerDisplay = styled.div`
  min-height: 60px;
  background: #f3f4f6;
  border: 3px dashed ${props => props.hasAnswer ? '#1CB0F6' : '#d1d5db'};
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 2rem 0;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    min-height: 50px;
    padding: 0.875rem;
  }
`;

const SelectedWord = styled.div`
  background: #1CB0F6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #0d9ed8;
  }

  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.9375rem;
  }
`;

const StreakBadge = styled.div`
  position: fixed;
  top: 90px;
  right: 2rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.4);
  z-index: 99;
  animation: ${scaleIn} 0.5s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    top: 80px;
    right: 1rem;
    padding: 0.625rem 1rem;
    font-size: 1rem;
  }
`;

// Thêm StreakText component
const StreakText = styled.div`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: transparent;
  color: #58CC02;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  z-index: 99;
  text-transform: uppercase;
  letter-spacing: 1px;
  animation: ${scaleIn} 0.5s ease;

  @media (max-width: 768px) {
    top: 12px;
    font-size: 0.8125rem;
  }
`;

const ConversationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const ConversationImage = styled.img`
  width: 180px;
  height: 180px;
  object-fit: contain;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
  }
`;


const ConversationBubble = styled.div`
  background: white;
  border: 3px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.25rem 1.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-right: 10px solid white;
  }

  &::after {
    content: '';
    position: absolute;
    left: -14px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 13px solid transparent;
    border-bottom: 13px solid transparent;
    border-right: 14px solid #e5e7eb;
    z-index: -1;
  }

  @media (max-width: 768px) {
    font-size: 1.125rem;
    padding: 1rem 1.5rem;

    &::before {
      left: 50%;
      top: -10px;
      transform: translateX(-50%);
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: none;
      border-bottom: 10px solid white;
    }

    &::after {
      left: calc(50% - 3px);
      top: -14px;
      transform: translateX(-50%);
      border-left: 13px solid transparent;
      border-right: 13px solid transparent;
      border-top: none;
      border-bottom: 14px solid #e5e7eb;
    }
  }
`;

const SpeakerIcon = styled.span`
  cursor: pointer;
  font-size: 1.5rem;
  flex-shrink: 0;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;
const CompletionOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.5s ease;
  padding: 2rem;
`;

const CelebrationIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: ${celebrationAnimation} 0.8s ease;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const CompletionCharacters = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  animation: ${float} 2s ease-in-out infinite;

  @media (max-width: 768px) {
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const CharacterIcon = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;
// Thêm styled components cho Review Modal
const ReviewModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${modalFadeIn} 0.3s ease;
  padding: 1rem;
`;

const ReviewModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${modalSlideUp} 0.4s ease;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    max-width: 95%;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ReviewTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ReviewCloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

const ReviewSubtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`;

const ReviewCard = styled.div`
  background: ${props => props.isCorrect ? '#d7ffb8' : '#ffdfe0'};
  border: 3px solid ${props => props.isCorrect ? '#58CC02' : '#ef4444'};
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    padding: 0.875rem;
  }
`;

const ReviewCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const ReviewCardType = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${props => props.isCorrect ? '#047857' : '#991b1b'};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 0.6875rem;
  }
`;

const ReviewCardIcon = styled.div`
  font-size: 1.25rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const ReviewCardContent = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ReviewCardAnswer = styled.div`
  font-size: 0.8125rem;
  color: #6b7280;
  margin-top: 0.25rem;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const SpeakerIconSmall = styled.button`
  background: #1CB0F6;
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  margin-top: 0.5rem;

  &:hover {
    background: #0d9ed8;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
`;
const CompletionTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #f59e0b;
  margin: 0 0 2rem 0;
  text-align: center;
  animation: ${slideInFromBottom} 0.6s ease;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 3rem;
  animation: ${slideInFromBottom} 0.8s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 400px;
    margin-bottom: 2rem;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 3px solid ${props => props.color || '#f59e0b'};
  border-radius: 20px;
  padding: 1.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1.25rem 2rem;
    min-width: unset;
  }
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  background: ${props => props.color || '#f59e0b'};
  padding: 0.375rem 1rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.color || '#f59e0b'};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CompletionButtons = styled.div`
  display: flex;
  gap: 1rem;
  animation: ${slideInFromBottom} 1s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    max-width: 400px;
  }
`;

const CompletionButton = styled.button`
  background: ${props => props.primary ? '#58CC02' : 'white'};
  border: 3px solid ${props => props.primary ? '#58CC02' : '#e5e7eb'};
  color: ${props => props.primary ? 'white' : '#6b7280'};
  padding: 1.125rem 2.5rem;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: ${props => props.primary ? '0 4px 0 #46A302' : 'none'};
  min-width: 200px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.primary ? '0 6px 0 #46A302' : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${props => props.primary ? '0 2px 0 #46A302' : 'none'};
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1rem;
    min-width: unset;
  }
`;
const ReviewNoticeBanner = styled.div`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #FF9600 0%, #FF6B00 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 700;
  box-shadow: 0 8px 32px rgba(255, 150, 0, 0.4);
  z-index: 102;
  animation: ${slideUp} 0.5s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 600px;
  width: auto;

  @media (max-width: 768px) {
    top: 70px;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    max-width: 90%;
  }
`;

const ReviewNoticeIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  animation: ${bounce} 1s ease infinite;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
`;

const ReviewNoticeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

const ReviewNoticeTitle = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ReviewNoticeSubtitle = styled.div`
  font-size: 0.9375rem;
  opacity: 0.95;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ReviewNoticeCount = styled.span`
  background: rgba(255, 255, 255, 0.3);
  padding: 0.125rem 0.625rem;
  border-radius: 12px;
  font-weight: 700;
  margin: 0 0.25rem;
`;
// ========== COMPONENT ==========

const Lesson = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { toast, showToast, hideToast } = useToast();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [streak, setStreak] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showReviewNotice, setShowReviewNotice] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);

  // State cho Match Pairs
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);

  // State để track câu hỏi đang ở phần review hay không
  const [originalQuestionsCount, setOriginalQuestionsCount] = useState(0);
const [showReviewModal, setShowReviewModal] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  const reportReasons = [
    'Câu hỏi không rõ ràng',
    'Đáp án không chính xác',
    'Hình ảnh không phù hợp',
    'Âm thanh không đúng',
    'Nội dung không phù hợp',
    'Lỗi khác'
  ];

  // Mock questions data với nhiều loại câu hỏi
  const allQuestions = [
    {
      id: 1,
      type: 'vocabulary',
      question: 'Đâu là "cà phê"?',
      choices: [
        { id: 'coffee', text: 'coffee', image: coffee, audio: 'coffee' },
        { id: 'milk', text: 'milk', image: milk, audio: 'milk' },
        { id: 'tea', text: 'tea', image: tea, audio: 'tea' }
      ],
      correctAnswer: 'coffee'
    },
    {
      id: 2,
      type: 'match_pairs',
      question: 'Chọn cặp từ',
      leftColumn: [
        { id: 'left1', text: 'xin chào' },
        { id: 'left2', text: 'cà phê' },
        { id: 'left3', text: 'vui lòng' },
        { id: 'left4', text: 'trà' },
        { id: 'left5', text: 'sữa' }
      ],
      rightColumn: [
        { id: 'right1', text: 'hello', matchWith: 'left1' },
        { id: 'right2', text: 'tea', matchWith: 'left4' },
        { id: 'right3', text: 'coffee', matchWith: 'left2' },
        { id: 'right4', text: 'please', matchWith: 'left3' },
        { id: 'right5', text: 'milk', matchWith: 'left5' }
      ]
    },
    {
      id: 3,
      type: 'conversation',
      question: 'Hoàn thành hội thoại',
      conversation: [
        { character: 'chibi', text: 'Coffee or tea?', image: chibiImg }
      ],
      choices: [
        { id: '1', text: 'Welcome.' },
        { id: '2', text: 'Coffee, please.' }
      ],
      correctAnswer: '2'
    },
    {
      id: 4,
      type: 'translate_build',
      question: 'Viết lại bằng Tiếng Việt',
      character: { image: chibiImg },
      audioText: 'Tea or coffee?',
      wordBank: ['Trà', 'cà', 'lòng', 'phê', 'cảm ơn', 'tôi', 'hay', 'cho'],
      correctAnswer: ['Trà', 'hay', 'cà', 'phê']
    },
    {
      id: 5,
      type: 'listen_write',
      question: 'Nghe và điền',
      audioText: 'thank you',
      wordBank: ['thank you', 'please', 'tea', 'goodbye', 'Welcome'],
      correctAnswer: 'thank you'
    },
    {
      id: 6,
      type: 'multiple_choice',
      question: 'Chọn nghĩa đúng',
      prompt: 'cà phê',
      character: { image: chibiImg },
      choices: [
        { id: '1', text: 'tea' },
        { id: '2', text: 'please' },
        { id: '3', text: 'coffee' }
      ],
      correctAnswer: '3'
    }
  ];

  const [questions, setQuestions] = useState(allQuestions);
  const progress = ((currentQuestion + 1) / questions.length) * 100;
    // Sửa lại phần check conditional return
  const question = questions[currentQuestion];


  

  // Set original questions count khi component mount
  useEffect(() => {
    setOriginalQuestionsCount(allQuestions.length);
  }, []);

  // Check if current question is a review question
  const isReviewQuestion = currentQuestion >= originalQuestionsCount;

 
  const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'correct') {
      const frequencies = [523.25, 659.25, 783.99];
      const duration = 0.15;
      
      frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = freq;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.3, audioContext.currentTime + index * duration);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (index + 1) * duration);
        
        osc.start(audioContext.currentTime + index * duration);
        osc.stop(audioContext.currentTime + (index + 1) * duration);
      });
    } else if (type === 'wrong') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 100;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  
  const checkMatch = (leftId, rightId) => {
    const rightItem = question.rightColumn.find(item => item.id === rightId);
    
    if (rightItem && rightItem.matchWith === leftId) {
      playSound('correct');
      const newMatchedPairs = [...matchedPairs, leftId, rightId];
      setMatchedPairs(newMatchedPairs);
      setSelectedLeft(null);
      setSelectedRight(null);
      
      speakText(rightItem.text);
      
      if (newMatchedPairs.length === (question.leftColumn.length + question.rightColumn.length)) {
        setTimeout(() => {
          setIsChecked(true);
          setShowFeedback(true);
          setCorrectAnswers(prev => prev + 1);
          setTotalXP(prev => prev + 10);
          setStreak(prev => prev + 1);
          setConsecutiveCorrect(prev => prev + 1);
        }, 500);
      }
    } else {
      playSound('wrong');
      setHearts(prev => Math.max(0, prev - 1));
      
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };
const handlePairClick = (id, column) => {
    if (matchedPairs.includes(id) || isChecked) return;

    if (column === 'left') {
      setSelectedLeft(id);
      
      // Auto-check if both selected
      if (selectedRight) {
        checkMatch(id, selectedRight);
      }
    } else {
      setSelectedRight(id);
      
      // Auto-check if both selected
      if (selectedLeft) {
        checkMatch(selectedLeft, id);
      }
    }
  };
  // Text-to-Speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto play audio when question changes
  useEffect(() => {
    if (!question) return; // Thêm kiểm tra này
  
    const timer = setTimeout(() => {
      if (question.type === 'conversation' && question.conversation[0].text) {
        speakText(question.conversation[0].text);
      } else if (question.type === 'translate_build' && question.audioText) {
        speakText(question.audioText);
      } else if (question.type === 'listen_write' && question.audioText) {
        speakText(question.audioText);
      }
    }, 500); // Delay 500ms để tránh phát ngay lập tức

    return () => clearTimeout(timer);
  }, [currentQuestion,question]);

  const handleChoiceClick = (choiceId, choiceText) => {
    if (isChecked) return;
    
    setSelectedAnswer(choiceId);
    if (choiceText) speakText(choiceText);
  };

  const handleWordClick = (word) => {
    if (isChecked) return;
    setSelectedWords([...selectedWords, word]);
  };

  const handleRemoveWord = (index) => {
    if (isChecked) return;
    const newWords = selectedWords.filter((_, i) => i !== index);
    setSelectedWords(newWords);
  };

  
 
  const handleCheck = () => {
    if (question.type === 'match_pairs') {
      const allMatched = matchedPairs.length === (question.leftColumn.length + question.rightColumn.length);
      
      if (allMatched) {
        // Save answered question
        const answeredQ = {
          ...question,
          isCorrect: true,
          userAnswer: 'All pairs matched',
          timestamp: Date.now()
        };
        setAnsweredQuestions(prev => [...prev, answeredQ]);

        setIsChecked(true);
        setShowFeedback(true);
        return;
      } else {
        showToast('warning', 'Chưa hoàn thành', 'Hãy ghép hết tất cả các cặp từ');
        return;
      }
    }

    let answer;
    
    if (question.type === 'translate_build') {
      answer = selectedWords.join(' ');
    } else if (question.type === 'listen_write') {
      answer = selectedAnswer;
    } else {
      answer = selectedAnswer;
    }

    if (!answer) return;
    
    setIsChecked(true);
    setShowFeedback(true);
    setIsSkipped(false);

    let isCorrect = false;

    if (question.type === 'translate_build') {
      isCorrect = JSON.stringify(selectedWords) === JSON.stringify(question.correctAnswer);
    } else {
      isCorrect = answer === question.correctAnswer;
    }

    // Save answered question
    const answeredQ = {
      ...question,
      isCorrect,
      userAnswer: question.type === 'translate_build' ? selectedWords.join(' ') : answer,
      timestamp: Date.now()
    };
    setAnsweredQuestions(prev => [...prev, answeredQ]);

    if (isCorrect) {
      playSound('correct');
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      setTotalXP(prev => prev + 10);
      setConsecutiveCorrect(prev => prev + 1);
      
      if ((streak + 1) % 5 === 0) {
        showToast('success', `🔥 Chuỗi ${streak + 1} câu đúng!`, 'Bạn đang làm rất tốt!');
      }
    } else {
      playSound('wrong');
      setStreak(0);
      setHearts(prev => Math.max(0, prev - 1));
      setConsecutiveCorrect(0);
      
      if (!wrongQuestions.find(q => q.id === question.id)) {
        setWrongQuestions([...wrongQuestions, question]);
      }
    }
  };
  
  const handleOpenReviewModal = () => {
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
  };
  
  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'vocabulary':
        return 'Từ vựng';
      case 'match_pairs':
        return 'Ghép cặp';
      case 'conversation':
        return 'Hội thoại';
      case 'translate_build':
        return 'Viết lại';
      case 'listen_write':
        return 'Nghe viết';
      case 'multiple_choice':
        return 'Chọn đáp án';
      default:
        return 'Câu hỏi';
    }
  };


  const getQuestionContent = (q) => {
    if (q.type === 'vocabulary') {
      return q.question;
    } else if (q.type === 'match_pairs') {
      return 'Chọn cặp từ';
    } else if (q.type === 'conversation') {
      return q.conversation[0].text;
    } else if (q.type === 'translate_build') {
      return q.audioText;
    } else if (q.type === 'listen_write') {
      return q.audioText;
    } else if (q.type === 'multiple_choice') {
      return q.prompt;
    }
    return q.question;
  };

  const getCorrectAnswerForReview = (q) => {
    if (q.type === 'translate_build') {
      return q.correctAnswer.join(' ');
    } else if (q.type === 'vocabulary' || q.type === 'conversation' || q.type === 'multiple_choice') {
      const choice = q.choices.find(c => c.id === q.correctAnswer);
      return choice ? choice.text : q.correctAnswer;
    }
    return q.correctAnswer;
  };

  const hasAudio = (q) => {
    return q.type === 'conversation' || q.type === 'translate_build' || q.type === 'listen_write';
  };

  const getAudioText = (q) => {
    if (q.type === 'conversation') {
      return q.conversation[0].text;
    } else if (q.type === 'translate_build' || q.type === 'listen_write') {
      return q.audioText;
    }
    return '';
  };
const handleContinue = () => {
    if (currentQuestion < questions.length - 1) {
      // Còn câu hỏi tiếp theo
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setSelectedWords([]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setMatchedPairs([]);
      setIsChecked(false);
      setShowFeedback(false);
      setIsSkipped(false);
    } else {
      // Đã hết câu hỏi hiện tại
      if (wrongQuestions.length > 0) {
        // Có câu sai cần ôn lại - Hiện banner thông báo
        setReviewCount(wrongQuestions.length);
        setShowReviewNotice(true);
        
        // Thêm câu sai vào cuối
        setQuestions(prevQuestions => [...prevQuestions, ...wrongQuestions]);
        
        // Clear wrong questions
        setWrongQuestions([]);
        
        // Ẩn banner sau 3 giây
        setTimeout(() => {
          setShowReviewNotice(false);
        }, 3000);
        
        // Move to next question
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          setSelectedAnswer(null);
          setSelectedWords([]);
          setSelectedLeft(null);
          setSelectedRight(null);
          setMatchedPairs([]);
          setIsChecked(false);
          setShowFeedback(false);
          setIsSkipped(false);
        }, 500);
      } else {
        // Không còn câu sai - hoàn thành bài học
        playSound('correct');
        setShowCompletion(true);
      }
    }
  };



  const handleReviewLesson = () => {
    setShowReviewModal(true);
  };

  const handleRestartLesson = () => {
    setShowReviewModal(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setSelectedWords([]);
    setIsChecked(false);
    setShowFeedback(false);
    setIsSkipped(false);
    setShowCompletion(false);
    setStreak(0);
    setWrongQuestions([]);
    setHearts(5);
    setCorrectAnswers(0);
    setTotalXP(0);
    setAnsweredQuestions([]);
    setMatchedPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);
  };
  const handleContinueToLearn = () => {
    navigate('/learn');
  };
  const calculateAccuracy = () => {
    const total = questions.length;
    return Math.round((correctAnswers / total) * 100);
  };
  const handleSkip = () => {
    setIsChecked(true);
    setShowFeedback(true);
    setIsSkipped(true);
    setStreak(0);
  };

  const handleClose = () => {
    if (window.confirm('Bạn có chắc muốn thoát? Tiến trình sẽ không được lưu.')) {
      navigate('/learn');
    }
  };

  const handleOpenReportModal = () => {
    setShowReportModal(true);
    setSelectedReportReason('');
    setReportDetails('');
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setSelectedReportReason('');
    setReportDetails('');
  };

  const handleSubmitReport = () => {
    if (!selectedReportReason) {
      showToast('warning', 'Thiếu thông tin', 'Vui lòng chọn lý do báo cáo');
      return;
    }

    showToast('success', 'Đã gửi báo cáo', 'Cảm ơn phản hồi của bạn!');
    handleCloseReportModal();
  };

  useEffect(() => {
    if (hearts === 0) {
      playSound('wrong');
      showToast('error', 'Hết trái tim! 💔', 'Bạn cần nghỉ ngơi hoặc mua thêm trái tim');
      setTimeout(() => {
        navigate('/learn');
      }, 2000);
    }
  }, [hearts, navigate, showToast]);

  
  const isCorrectAnswer = () => {
    if (question.type === 'match_pairs') {
      return matchedPairs.length === (question.leftColumn.length + question.rightColumn.length);
    }
    if (question.type === 'translate_build') {
      return JSON.stringify(selectedWords) === JSON.stringify(question.correctAnswer);
    }
    return selectedAnswer === question.correctAnswer;
  };

// Thêm kiểm tra an toàn ngay sau khi lấy question
  

  
  const renderQuestion = () => {
    switch (question.type) {
      case 'match_pairs':
        return (
          <>
            <QuestionText>{question.question}</QuestionText>
            <MatchPairsContainer>
              <PairColumn>
                {question.leftColumn.map((item, index) => (
                  <PairCard
                    key={item.id}
                    selected={selectedLeft === item.id}
                    matched={matchedPairs.includes(item.id)}
                    onClick={() => handlePairClick(item.id, 'left')}
                    disabled={matchedPairs.includes(item.id)}
                  >
                    <PairNumber matched={matchedPairs.includes(item.id)}>
                      {index + 1}
                    </PairNumber>
                    {item.text}
                    {matchedPairs.includes(item.id) && <MatchIcon>✓</MatchIcon>}
                  </PairCard>
                ))}
              </PairColumn>

              <PairColumn>
                {question.rightColumn.map((item, index) => (
                  <PairCard
                    key={item.id}
                    selected={selectedRight === item.id}
                    matched={matchedPairs.includes(item.id)}
                    onClick={() => handlePairClick(item.id, 'right')}
                    disabled={matchedPairs.includes(item.id)}
                  >
                    <PairNumber matched={matchedPairs.includes(item.id)}>
                      {index + 6}
                    </PairNumber>
                    {item.text}
                    {matchedPairs.includes(item.id) && <MatchIcon>✓</MatchIcon>}
                  </PairCard>
                ))}
              </PairColumn>
            </MatchPairsContainer>
          </>
        );
      case 'vocabulary':
        return (
          <>
            <QuestionText>{question.question}</QuestionText>
            <ChoicesGrid>
              {question.choices.map((choice, index) => (
                <ChoiceCard
                  key={choice.id}
                  selected={selectedAnswer === choice.id}
                  isCorrect={isChecked && choice.id === question.correctAnswer}
                  isWrong={isChecked && selectedAnswer === choice.id && choice.id !== question.correctAnswer}
                  isChecked={isChecked}
                  disabled={isChecked}
                  onClick={() => handleChoiceClick(choice.id, choice.text)}
                >
                  <ChoiceImage src={choice.image} alt={choice.text} />
                  <ChoiceTextContainer>
                    <ChoiceNumber>{index + 1}</ChoiceNumber>
                    <ChoiceText>{choice.text}</ChoiceText>
                    <SpeakerButton
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(choice.text);
                      }}
                    >
                      🔊
                    </SpeakerButton>
                  </ChoiceTextContainer>
                </ChoiceCard>
              ))}
            </ChoicesGrid>
          </>
        );

      case 'conversation':
        return (
          <>
            <QuestionText>{question.question}</QuestionText>
            <ConversationContainer>
              <ConversationImage src={question.conversation[0].image}  />
              <ConversationBubble>
                <SpeakerIcon onClick={() => speakText(question.conversation[0].text)}>
                  🔊
                </SpeakerIcon>
                {question.conversation[0].text}
              </ConversationBubble>
            </ConversationContainer>
            <ChoicesGrid>
              {question.choices.map((choice, index) => (
                <ChoiceCard
                  key={choice.id}
                  selected={selectedAnswer === choice.id}
                  isCorrect={isChecked && choice.id === question.correctAnswer}
                  isWrong={isChecked && selectedAnswer === choice.id && choice.id !== question.correctAnswer}
                  isChecked={isChecked}
                  disabled={isChecked}
                  onClick={() => handleChoiceClick(choice.id, choice.text)}
                  style={{ flexDirection: 'row', justifyContent: 'flex-start' }}
                >
                  <ChoiceNumber>{index + 1}</ChoiceNumber>
                  <ChoiceText>{choice.text}</ChoiceText>
                </ChoiceCard>
              ))}
            </ChoicesGrid>
          </>
        );
      
case 'translate_build':
  return (
    <>
      <QuestionText>{question.question}</QuestionText>
      <ConversationContainer>
        <CharacterImage src={question.character.image} />
        <SpeechBubble onClick={() => speakText(question.audioText)}>
          <span style={{ marginRight: '0.5rem', cursor: 'pointer' }}>🔊</span>
          {question.audioText}
        </SpeechBubble>
      </ConversationContainer>
      
      <AnswerDisplay hasAnswer={selectedWords.length > 0}>
        {selectedWords.length === 0 ? (
          <span style={{ color: '#9ca3af' }}>Chọn các từ phía dưới</span>
        ) : (
          selectedWords.map((word, index) => (
            <SelectedWord key={index} onClick={() => handleRemoveWord(index)}>
              {word}
            </SelectedWord>
          ))
        )}
      </AnswerDisplay>

      <WordBankContainer>
        {question.wordBank.map((word, index) => (
          <WordChip
            key={index}
            selected={selectedWords.includes(word)}
            disabled={isChecked || selectedWords.filter(w => w === word).length >= question.wordBank.filter(w => w === word).length}
            onClick={() => handleWordClick(word)}
          >
            {word}
          </WordChip>
        ))}
      </WordBankContainer>
    </>
  );

      case 'listen_write':
        return (
          <>
            <QuestionText>{question.question}</QuestionText>
            <AudioButton onClick={() => speakText(question.audioText)}>
              🔊
            </AudioButton>
            <WordBankContainer>
              {question.wordBank.map((word, index) => (
                <WordChip
                  key={index}
                  selected={selectedAnswer === word}
                  disabled={isChecked}
                  onClick={() => handleChoiceClick(word, word)}
                >
                  {word}
                </WordChip>
              ))}
            </WordBankContainer>
          </>
        );

      case 'multiple_choice':
        return (
          <>
            <QuestionText>{question.question}</QuestionText>
            <ConversationContainer>
              <CharacterImage src={question.character.image} />
              <SpeechBubble>
                {question.prompt}
              </SpeechBubble>
            </ConversationContainer>
            <ChoicesGrid>
              {question.choices.map((choice, index) => (
                <ChoiceCard
                  key={choice.id}
                  selected={selectedAnswer === choice.id}
                  isCorrect={isChecked && choice.id === question.correctAnswer}
                  isWrong={isChecked && selectedAnswer === choice.id && choice.id !== question.correctAnswer}
                  isChecked={isChecked}
                  disabled={isChecked}
                  onClick={() => handleChoiceClick(choice.id, choice.text)}
                  style={{ flexDirection: 'row', justifyContent: 'flex-start' }}
                >
                  <ChoiceNumber>{index + 1}</ChoiceNumber>
                  <ChoiceText>{choice.text}</ChoiceText>
                </ChoiceCard>
              ))}
            </ChoicesGrid>
          </>
        );

      default:
        return null;
    }
  };

  const getCorrectAnswerText = () => {
    if (question.type === 'match_pairs') {
      return 'Đã hoàn thành tất cả các cặp';
    }
    if (question.type === 'translate_build') {
      return question.correctAnswer.join(' ');
    }
    if (question.type === 'vocabulary' || question.type === 'conversation' || question.type === 'multiple_choice') {
      return question.choices.find(c => c.id === question.correctAnswer)?.text;
    }
    return question.correctAnswer;
  };
if (!question) {
    return (
      <PageWrapper>
        <Container style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2>Đang tải...</h2>
        </Container>
      </PageWrapper>
    );
  }
return (
  <PageWrapper>
    <Toast toast={toast} onClose={hideToast} />
    {showReviewNotice && (
        <ReviewNoticeBanner>
          <ReviewNoticeIcon>🔄</ReviewNoticeIcon>
          <ReviewNoticeText>
            <ReviewNoticeTitle>Xem lại câu sai</ReviewNoticeTitle>
            <ReviewNoticeSubtitle>
              Còn <ReviewNoticeCount>{reviewCount}</ReviewNoticeCount> câu cần làm lại
            </ReviewNoticeSubtitle>
          </ReviewNoticeText>
        </ReviewNoticeBanner>
      )}
    {showCompletion ? (
      <CompletionOverlay>
        <CelebrationIcon>✨</CelebrationIcon>
        
        <CompletionCharacters>
          <CharacterIcon src={logo} alt="Logo" />
        </CompletionCharacters>

        <CompletionTitle>Hoàn thành bài học!</CompletionTitle>

        <StatsContainer>
          <StatCard color="#fbbf24">
            <StatLabel color="#fbbf24">TỔNG ĐIỂM XP</StatLabel>
            <StatValue color="#fbbf24">
              ⚡ {totalXP}
            </StatValue>
          </StatCard>

          <StatCard color="#58CC02">
            <StatLabel color="#58CC02">TUYỆT VỜI</StatLabel>
            <StatValue color="#58CC02">
              🎯 {calculateAccuracy()}%
            </StatValue>
          </StatCard>
        </StatsContainer>

        <CompletionButtons>
          <CompletionButton onClick={handleOpenReviewModal}>
            Xem lại bài học
          </CompletionButton>
          <CompletionButton primary onClick={handleContinueToLearn}>
            Tiếp tục
          </CompletionButton>
        </CompletionButtons>
      </CompletionOverlay>
    ) : (
      <>
        {consecutiveCorrect >= 3 && (
          <StreakText>
            {consecutiveCorrect} LẦN LIÊN TIẾP
          </StreakText>
        )}

        {streak >= 3 && (
          <StreakBadge>
            🔥 {streak} câu đúng
          </StreakBadge>
        )}

        <Header>
          <CloseButton onClick={handleClose}>✕</CloseButton>
          <ProgressBarContainer>
            <ProgressBarFill progress={progress} />
          </ProgressBarContainer>
          <HeartsContainer>
            ❤️ {hearts}
          </HeartsContainer>
        </Header>

        <Container>
          <QuestionBadge isReview={isReviewQuestion}>
            <BadgeIcon src={isReviewQuestion ? loopIcon : newIcon} alt={isReviewQuestion ? "Review" : "New"} />
            {isReviewQuestion ? 'LỖI SAI TRƯỚC ĐÂY' : 'TỪ VỰNG MỚI'}
          </QuestionBadge>

          {question && renderQuestion()}
        </Container>

        {!showFeedback && (
          <Footer>
            <SkipButton onClick={handleSkip}>Bỏ qua</SkipButton>
            <CheckButton
              disabled={
                !question ? true :
                question.type === 'match_pairs' 
                  ? matchedPairs.length !== (question.leftColumn.length + question.rightColumn.length)
                  : question.type === 'translate_build' 
                    ? selectedWords.length === 0 
                    : !selectedAnswer
              }
              onClick={handleCheck}
            >
              Kiểm tra
            </CheckButton>
          </Footer>
        )}

        {showFeedback && (
          <FeedbackBanner isCorrect={!isSkipped && isCorrectAnswer()}>
            <FeedbackContent>
              <FeedbackIconWrapper isCorrect={!isSkipped && isCorrectAnswer()}>
                {(!isSkipped && isCorrectAnswer()) ? (
                  <CheckmarkIcon />
                ) : (
                  <CrossIcon />
                )}
              </FeedbackIconWrapper>
              <FeedbackTextWrapper>
                <FeedbackTitle isCorrect={!isSkipped && isCorrectAnswer()}>
                  {(!isSkipped && isCorrectAnswer()) ? 'Tuyệt vời!' : 'Đáp án đúng:'}
                </FeedbackTitle>
                {(!isSkipped && !isCorrectAnswer() || isSkipped) && (
                  <FeedbackSubtext>
                    {getCorrectAnswerText()}
                  </FeedbackSubtext>
                )}
                <ReportLink onClick={handleOpenReportModal}>
                  <ReportIcon src={reportIcon} alt="Report" />
                  BÁO CÁO
                </ReportLink>
              </FeedbackTextWrapper>
            </FeedbackContent>
            <ContinueButton isCorrect={!isSkipped && isCorrectAnswer()} onClick={handleContinue}>
              Tiếp tục
            </ContinueButton>
          </FeedbackBanner>
        )}

        {showReportModal && (
          <ModalOverlay onClick={handleCloseReportModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <ReportIcon src={reportIcon} alt="Report" />
                  Báo cáo câu hỏi
                </ModalTitle>
                <ModalCloseButton onClick={handleCloseReportModal}>✕</ModalCloseButton>
              </ModalHeader>

              <ModalDescription>
                Vui lòng cho chúng tôi biết vấn đề bạn gặp phải với câu hỏi này.
              </ModalDescription>

              <ReportOptions>
                {reportReasons.map((reason) => (
                  <ReportOption
                    key={reason}
                    selected={selectedReportReason === reason}
                    onClick={() => setSelectedReportReason(reason)}
                  >
                    {reason}
                  </ReportOption>
                ))}
              </ReportOptions>

              <TextAreaWrapper>
                <TextAreaLabel>Chi tiết (tùy chọn)</TextAreaLabel>
                <TextArea
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                />
              </TextAreaWrapper>

              <ModalActions>
                <ModalButton onClick={handleCloseReportModal}>
                  Hủy
                </ModalButton>
                <ModalButton primary onClick={handleSubmitReport} disabled={!selectedReportReason}>
                  Gửi báo cáo
                </ModalButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </>
    )}

    {/* Review Modal */}
    {showReviewModal && (
      <ReviewModalOverlay onClick={handleCloseReviewModal}>
        <ReviewModalContent onClick={(e) => e.stopPropagation()}>
          <ReviewHeader>
            <ReviewTitle>Xem bảng điểm của bạn!</ReviewTitle>
            <ReviewCloseButton onClick={handleCloseReviewModal}>
              ✕
            </ReviewCloseButton>
          </ReviewHeader>

          <ReviewSubtitle>
            Nhấp vào ô bên dưới để hiển thị đáp án
          </ReviewSubtitle>

          <ReviewGrid>
            {answeredQuestions.map((q, index) => (
              <ReviewCard key={index} isCorrect={q.isCorrect}>
                <ReviewCardHeader>
                  <ReviewCardType isCorrect={q.isCorrect}>
                    {getQuestionTypeLabel(q.type)}
                  </ReviewCardType>
                  <ReviewCardIcon>
                    {q.isCorrect ? '✓' : '✗'}
                  </ReviewCardIcon>
                </ReviewCardHeader>

                <ReviewCardContent>
                  {getQuestionContent(q)}
                </ReviewCardContent>

                {!q.isCorrect && (
                  <ReviewCardAnswer>
                    Đáp án: {getCorrectAnswerForReview(q)}
                  </ReviewCardAnswer>
                )}

                {hasAudio(q) && (
                  <SpeakerIconSmall onClick={() => speakText(getAudioText(q))}>
                    🔊
                  </SpeakerIconSmall>
                )}
              </ReviewCard>
            ))}
          </ReviewGrid>

          <CompletionButtons>
            <CompletionButton onClick={handleRestartLesson}>
              Làm lại
            </CompletionButton>
            <CompletionButton primary onClick={handleContinueToLearn}>
              Tiếp tục
            </CompletionButton>
          </CompletionButtons>
        </ReviewModalContent>
      </ReviewModalOverlay>
    )}
  </PageWrapper>
);
};

export default Lesson;