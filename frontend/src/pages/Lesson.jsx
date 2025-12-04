import React, { useState, useEffect, useRef } from "react"; // ✅ THÊM useRef
import { useNavigate, useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import coffee from "../assets/coffee.png";
import milk from "../assets/milk.png";
import tea from "../assets/tea.png";
import newIcon from "../assets/new.png";
import reportIcon from "../assets/report.png";
import loopIcon from "../assets/loop.png";
import horse from "../assets/horse.png";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import Swal from "sweetalert2";
import correctSound from "../assets/correct.mp3";
import wrongSound from "../assets/wrong.mp3";
import successGif from "../assets/success.gif";
import happyGif from "../assets/happy.gif";
import sadGif from "../assets/sad.gif";
import LinhThuTini from "../assets/LinhThuTini.gif";
import { heartService } from "../services/heartService";
import { Favorite, VolumeUp, Mic } from "@mui/icons-material"; // ✅ Thêm Mic, Stop
import { lessonService } from "../services/lessonService";
import { vocabularyService } from "../services/vocabularyService";
import { exerciseService } from "../services/exerciseService";
import progressService from "../services/progressService";

import { xpService } from "../services/xpService"; 
// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
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

// Thêm keyframes cho hiệu ứng pháo hoa
const fireworks = keyframes`
  0% {
    opacity: 1;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(2) rotate(360deg) translateY(-200px);
  }
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
  padding: 1.25rem 2.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 100;

  @media (max-width: 1024px) {
    padding: 1rem 2rem;
    gap: 1.25rem;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    gap: 1rem;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 1024px) {
    gap: 1.25rem;
  }

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #afafaf;
  font-size: 1.75rem;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
`;

const ProgressBarContainer = styled.div`
  flex: 1;
  height: 18px;
  background: #e5e7eb;
  border-radius: 100px;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    height: 16px;
  }
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #58cc02 0%, #45a302 100%);
  width: ${(props) => props.$progress}%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 100px;
`;

const HeartsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #ef4444;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
  animation: ${(props) => (props.$isShaking ? shake : "none")} 0.5s ease;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 7rem 2rem 140px; // Tăng padding-top để không bị Header che
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: ${fadeIn} 0.6s ease;

  @media (max-width: 768px) {
    padding: 6rem 1rem 160px; // Padding-top cho mobile
  }
`;

const QuestionBadge = styled.div`
  background: ${(props) => (props.$isReview ? "#FF9600" : "#1CB0F6")};
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
  margin: 0;
  line-height: 1.2;
  flex: 1;
  text-align: left;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    text-align: center;
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
  border: 3px solid
    ${(props) => {
      if (props.$isCorrect && props.$isChecked) return "#58CC02";
      if (props.$isWrong && props.$isChecked) return "#ef4444";
      if (props.$selected) return "#1CB0F6";
      return "#e5e7eb";
    }};
  border-radius: 16px;
  padding: 1.5rem;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  box-shadow: ${(props) => {
    if (props.$isCorrect && props.$isChecked)
      return "0 6px 20px rgba(88,204,2,0.3)";
    if (props.$isWrong && props.$isChecked)
      return "0 6px 20px rgba(239,68,68,0.3)";
    return "0 2px 8px rgba(0, 0, 0, 0.06)";
  }};
  animation: ${(props) => (props.$isWrong && props.$isChecked ? shake : "none")}
    0.5s ease;
  opacity: ${(props) => (props.disabled && !props.$selected ? 0.5 : 1)};

  &:hover:not(:disabled) {
    border-color: ${(props) => {
      if (props.$isChecked) return props.$isCorrect ? "#58CC02" : "#ef4444";
      return "#1CB0F6";
    }};
    transform: ${(props) => (props.disabled ? "none" : "translateY(-4px)")};
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
  background: #1cb0f6;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(28, 176, 246, 0.3);

  &:hover {
    background: #0d9ed8;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

const Footer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;

  @media (max-width: 1024px) {
    padding: 1.5rem 2rem;
  }

  @media (max-width: 768px) {
    padding: 1.25rem 1rem;
    flex-direction: column-reverse;
    gap: 1rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 1rem;
  }
`;

const CompletionButton = styled.button`
  background: ${(props) => (props.$primary ? "#58CC02" : "white")};
  border: 3px solid ${(props) => (props.$primary ? "#58CC02" : "#e5e7eb")};
  color: ${(props) => (props.$primary ? "white" : "#6b7280")};
  padding: 1.125rem 2.5rem;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: ${(props) => (props.$primary ? "0 4px 0 #46A302" : "none")};
  min-width: 200px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${(props) =>
      props.$primary ? "0 6px 0 #46A302" : "0 4px 12px rgba(0, 0, 0, 0.1)"};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${(props) => (props.$primary ? "0 2px 0 #46A302" : "none")};
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1rem;
    min-width: unset;
  }
`;

const SkipButton = styled(CompletionButton).attrs({ primary: false })`
  background: white;
  border: 3px solid #e5e7eb;
  color: #6b7280;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  min-width: 160px;
  padding: 0.875rem 2rem;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 0 rgba(0, 0, 0, 0.06);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.06);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CheckButton = styled(CompletionButton).attrs((props) => ({
  primary: true,
}))`
  min-width: 160px;
  padding: 0.875rem 2rem;
  box-shadow: ${(props) => (props.disabled ? "none" : "0 4px 0")};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #46a302;
  }

  &:active:not(:disabled) {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #46a302;
  }

  &:disabled {
    background: #e5e7eb;
    color: #afafaf;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const FeedbackBanner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${(props) => (props.$isCorrect ? "#d7ffb8" : "#ffdfe0")};
  padding: 1.5rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 101;
  animation: ${slideUp} 0.4s ease-out;
  border-top: 1px solid ${(props) => (props.$isCorrect ? "#58CC02" : "#ef4444")};

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

const FeedbackWrapper = styled.div`
  max-width: 1200px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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
  background: ${(props) => (props.$isCorrect ? "#58CC02" : "#ef4444")};
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

const drawCheckmark = keyframes`
  0% {
    stroke-dashoffset: 100;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
`;

const checkmarkPop = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const checkmarkGlow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(255, 255, 255, 1));
  }
`;

const particleBurst = keyframes`
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(0);
    opacity: 0;
  }
`;
const pulseRing = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(28,176,246,0.45);
  }
  70% {
    box-shadow: 0 0 0 18px rgba(28,176,246,0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(28,176,246,0);
  }
`;
const ripple = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const CheckmarkIcon = styled.div`
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 40px;
    height: 40px;
    animation: ${checkmarkPop} 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55),
      ${checkmarkGlow} 1.5s ease-in-out infinite;
  }

  .checkmark-path {
    stroke: white;
    stroke-width: 6;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: ${drawCheckmark} 0.5s ease-out 0.2s forwards;
  }

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;

    svg {
      width: 36px;
      height: 36px;
    }

    .checkmark-path {
      stroke-width: 5;
    }
  }
`;

const CheckmarkParticles = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  .particle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    animation: ${particleBurst} 0.8s ease-out forwards;
    opacity: 0;
  }

  .particle:nth-child(1) {
    --tx: 30px;
    --ty: -30px;
    animation-delay: 0.3s;
  }
  .particle:nth-child(2) {
    --tx: -30px;
    --ty: -30px;
    animation-delay: 0.35s;
  }
  .particle:nth-child(3) {
    --tx: 30px;
    --ty: 30px;
    animation-delay: 0.4s;
  }
  .particle:nth-child(4) {
    --tx: -30px;
    --ty: 30px;
    animation-delay: 0.45s;
  }
  .particle:nth-child(5) {
    --tx: 0px;
    --ty: -40px;
    animation-delay: 0.38s;
  }
  .particle:nth-child(6) {
    --tx: 0px;
    --ty: 40px;
    animation-delay: 0.42s;
  }
  .particle:nth-child(7) {
    --tx: 40px;
    --ty: 0px;
    animation-delay: 0.36s;
  }
  .particle:nth-child(8) {
    --tx: -40px;
    --ty: 0px;
    animation-delay: 0.44s;
  }
`;

const CheckmarkRipple = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.6);
  animation: ${ripple} 0.8s ease-out;
`;

const CrossIcon = styled.div`
  position: relative;
  width: 52px;
  height: 52px;

  &::before,
  &::after {
    content: "";
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
  color: ${(props) => (props.$isCorrect ? "#58CC02" : "#ef4444")};
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

const ContinueButton = styled.button`
  background: ${(props) => (props.$isCorrect ? "#58CC02" : "#ff4b4b")};
  border: none;
  color: white;
  padding: 1rem 3rem;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 0 ${(props) => (props.$isCorrect ? "#46A302" : "#dc2626")};
  min-width: 180px;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 ${(props) => (props.$isCorrect ? "#46A302" : "#dc2626")};
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 ${(props) => (props.$isCorrect ? "#46A302" : "#dc2626")};
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1rem;
  }
`;

const AudioButton = styled.button`
  background: #1cb0f6;
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
  border: 3px solid ${(props) => (props.$selected ? "#1CB0F6" : "#e5e7eb")};
  color: #1f2937;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    border-color: #1cb0f6;
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
  border: 3px dashed ${(props) => (props.hasAnswer ? "#1CB0F6" : "#d1d5db")};
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
  background: #1cb0f6;
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
  top: 100px; // Tăng lên để không bị Header che
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
    top: 90px;
    right: 1rem;
    padding: 0.625rem 1rem;
    font-size: 1rem;
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
    content: "";
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
    content: "";
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
  background: ${(props) => (props.isCorrect ? "#d7ffb8" : "#ffdfe0")};
  border: 3px solid ${(props) => (props.isCorrect ? "#58CC02" : "#ef4444")};
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
  color: ${(props) => (props.isCorrect ? "#047857" : "#991b1b")};
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
  background: #1cb0f6;
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
  border: 3px solid ${(props) => props.color || "#f59e0b"};
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
  background: ${(props) => props.color || "#f59e0b"};
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
  color: ${(props) => props.color || "#f59e0b"};
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

const ReviewNoticeBanner = styled.div`
  position: fixed;
  top: 90px; // Tăng lên để không bị Header che
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ff9600 0%, #ff6b00 100%);
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
    top: 80px;
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
const Fireworks = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;

  .particle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: ${(props) => props.color || "#FFD700"};
    border-radius: 50%;
    animation: ${fireworks} 2s ease-out infinite;
    top: 50%;
    left: 50%;
  }

  .particle:nth-child(1) {
    animation-delay: 0s;
    transform-origin: 0 0;
  }
  .particle:nth-child(2) {
    animation-delay: 0.2s;
    transform-origin: 0 0;
    background: #ff6b6b;
  }
  .particle:nth-child(3) {
    animation-delay: 0.4s;
    transform-origin: 0 0;
    background: #4ecdc4;
  }
  .particle:nth-child(4) {
    animation-delay: 0.6s;
    transform-origin: 0 0;
    background: #45b7d1;
  }
  .particle:nth-child(5) {
    animation-delay: 0.8s;
    transform-origin: 0 0;
    background: #ffa07a;
  }
  .particle:nth-child(6) {
    animation-delay: 1s;
    transform-origin: 0 0;
    background: #98d8c8;
  }
  .particle:nth-child(7) {
    animation-delay: 1.2s;
    transform-origin: 0 0;
    background: #f7dc6f;
  }
  .particle:nth-child(8) {
    animation-delay: 1.4s;
    transform-origin: 0 0;
    background: #bb8fce;
  }
  .particle:nth-child(9) {
    animation-delay: 1.6s;
    transform-origin: 0 0;
    background: #85c1e9;
  }
  .particle:nth-child(10) {
    animation-delay: 1.8s;
    transform-origin: 0 0;
    background: #f8c471;
  }

  @media (max-width: 768px) {
    .particle {
      width: 8px;
      height: 8px;
    }
  }
`;
const ReviewNoticeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;

  @media (max-width: 768px) {
    gap: 0.375rem;
  }
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


// ========COMPONENT=========

// Thêm states cho Speaking
const Lesson = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { toast, showToast, hideToast } = useToast();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showFirstTimeReminder, setShowFirstTimeReminder] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  // Lesson streak - chỉ đếm câu đúng liên tiếp trong bài học này
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const [selectedWords, setSelectedWords] = useState([]);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
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

  const [isSyncing, setIsSyncing] = useState(false);

  const [isLoadingLesson, setIsLoadingLesson] = useState(true);
  const [lessonData, setLessonData] = useState(null);

  // ✅ THÊM STATE CHO SPEECH
  const [pronunciationScore, setPronunciationScore] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [analyzing, setAnalyzing] = useState(false); // ✅ THÊM STATE NÀY
  const [useWebSpeech, setUseWebSpeech] = useState(true); // Default dùng Web Speech API
  const [isListening, setIsListening] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    // ✅ Check nếu browser hỗ trợ Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (useWebSpeech && SpeechRecognition) {
      // ✅ Dùng Web Speech API (miễn phí, nhanh)
      console.log('🎤 Using Web Speech API');
      
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognitionRef.current = recognition;
        
        recognition.onstart = () => {
          setRecording(true);
          setIsListening(true);
           console.log('🎤 Speech recognition started');
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const confidence = event.results[0][0].confidence;
          
           console.log('📝 Transcript:', transcript);
           console.log('📊 Confidence:', confidence);
          
          // ✅ Phân tích pronunciation ngay trên browser
          analyzePronunciationLocal(transcript, confidence);
        };
        
        recognition.onerror = (event) => {
          console.error('❌ Speech recognition error:', event.error);
          
          if (event.error === 'not-allowed') {
            showToast('error', 'Lỗi', 'Bạn chưa cho phép truy cập microphone. Vui lòng bật microphone trong cài đặt trình duyệt.');
          } else if (event.error === 'no-speech') {
            showToast('warning', 'Thông báo', 'Không nghe thấy giọng nói. Vui lòng thử lại.');
          } else {
            showToast('error', 'Lỗi', 'Không thể nhận dạng giọng nói');
          }
          
          setRecording(false);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setRecording(false);
          setIsListening(false);
           console.log('✅ Speech recognition ended');
        };
        
        recognition.start();
        
      } catch (err) {
        console.error('❌ Web Speech API error:', err);
        showToast('error', 'Lỗi', 'Không thể bắt đầu nhận dạng giọng nói');
        
        // ✅ Fallback: Chuyển sang MediaRecorder + API
        setUseWebSpeech(false);
        startRecordingWithMediaRecorder();
      }
    } else {
      // ✅ Fallback: Dùng MediaRecorder + Backend API
       console.log('🎤 Using MediaRecorder + Backend API');
      startRecordingWithMediaRecorder();
    }
  };

  // ✅ THÊM: Hàm startRecording với MediaRecorder (backup)
  const startRecordingWithMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // ✅ Auto-detect supported format
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else {
        mimeType = '';
      }
      
       console.log('🎤 Using mimeType:', mimeType || 'default');
      
      mediaRecorderRef.current = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const blobType = mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        
         console.log('🎤 Recording stopped:', {
          blobSize: blob.size,
          blobType: blob.type
        });
        
        // ✅ Tự động gọi Backend API analyze
        await autoAnalyzePronunciation(blob);
      };
      
      mediaRecorderRef.current.start();
      setRecording(true);
      
    } catch (err) {
      console.error('❌ MediaRecorder error:', err);
      
      if (err.name === 'NotAllowedError') {
        showToast('error', 'Lỗi', 'Bạn chưa cho phép truy cập microphone. Vui lòng bật microphone trong cài đặt trình duyệt.');
      } else if (err.name === 'NotFoundError') {
        showToast('error', 'Lỗi', 'Không tìm thấy microphone. Vui lòng kiểm tra thiết bị.');
      } else if (err.name === 'NotSupportedError') {
        showToast('error', 'Lỗi', 'Trình duyệt không hỗ trợ ghi âm. Vui lòng dùng Chrome/Firefox.');
      } else {
        showToast('error', 'Lỗi', 'Không thể truy cập microphone');
      }
    }
  };

  // ✅ SỬA: stopRecording
  const stopRecording = () => {
    if (recognitionRef.current && isListening) {
      // Stop Web Speech API
      recognitionRef.current.stop();
      setRecording(false);
      setIsListening(false);
    } else if (mediaRecorderRef.current && recording) {
      // Stop MediaRecorder
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // ✅ THÊM: Hàm phân tích pronunciation trên browser (miễn phí)
  const analyzePronunciationLocal = (transcript, confidence) => {
    const targetText = (question.correctAnswer || question.question).toLowerCase().trim();
    const transcribedText = transcript.toLowerCase().trim();
    
     console.log('📊 Analyzing locally:', { targetText, transcribedText });
    
    // ✅ Calculate similarity
    const similarity = calculateSimilarity(transcribedText, targetText);
    const score = Math.round(similarity * 100);
    const passed = score >= 80; // 80% trở lên = pass
    
     console.log('✅ Local analysis result:', {
      score,
      similarity,
      passed,
      confidence
    });
    
    // ✅ Update UI
    setPronunciationScore(score);
    setTranscription(transcript);
    setIsChecked(true);
    setShowFeedback(true);
    setSelectedAnswer(passed ? 'correct' : 'wrong');
    
    if (passed) {
      playSound('correct');
      setCorrectAnswers(prev => prev + 1);
      setConsecutiveCorrect(prev => prev + 1);
    } else {
      playSound('wrong');
      setConsecutiveCorrect(0);
      setHearts(prev => Math.max(0, prev - 1));
      syncUseHeart();
      
      if (!wrongQuestions.find(q => q.id === question.id)) {
        setWrongQuestions([...wrongQuestions, question]);
      }
    }
  };

  // ✅ THÊM: Helper functions cho similarity calculation
  function calculateSimilarity(str1, str2) {
    const distance = levenshteinDistance(str1, str2);
    const maxLen = Math.max(str1.length, str2.length);
    return maxLen === 0 ? 1 : 1 - distance / maxLen;
  }

  function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    
    return dp[m][n];
  }

  // Hàm mock analyze pronunciation
  const mockAnalyzePronunciation = async (audioBlob) => {
     console.log('🧪 Frontend Mock: Analyzing pronunciation');
    
    // Giả lập delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock result
    const score = Math.floor(Math.random() * 40) + 60;
    const passed = score >= 50;
    
    const mockTranscriptions = [
      question.correctAnswer,
      question.correctAnswer.replace('are', 'is'),
      question.correctAnswer.split(' ').slice(0, -1).join(' ')
    ];
    const transcription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    
    // Update state
    setPronunciationScore(score);
    setTranscription(transcription);
    setIsChecked(true);
    setShowFeedback(true);
    setSelectedAnswer(passed ? 'correct' : 'wrong');
    
    if (passed) {
      playSound('correct');
      setCorrectAnswers(prev => prev + 1);
      setConsecutiveCorrect(prev => prev + 1);
    } else {
      playSound('wrong');
      setConsecutiveCorrect(0);
      setHearts(prev => Math.max(0, prev - 1));
      await syncUseHeart();
    }
    
     console.log('🧪 Mock result:', { score, passed, transcription });
  };

  const autoAnalyzePronunciation = async (blob) => {
    if (!blob || blob.size === 0) {
      console.error('❌ No audio blob available');
      showToast('warning', 'Thông báo', 'Vui lòng ghi âm trước khi kiểm tra');
      return;
    }

     console.log('🔍 Starting analysis with blob:', {
      size: blob.size,
      type: blob.type,
      targetText: question.correctAnswer
    });
    
    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('targetText', question.correctAnswer);
      
      const token = localStorage.getItem('token');
      
       console.log('📤 Sending to API:', {
        url: `${process.env.REACT_APP_API_URL}/speech/analyze-speaking`,
        targetText: question.correctAnswer,
        blobSize: blob.size,
        hasToken: !!token
      });
      
      // ✅ ĐÚNG: Gọi API thật
      const response = await fetch(`${process.env.REACT_APP_API_URL}/speech/analyze-speaking`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
       console.log('🔍 Full API Response:', result);
   console.log('📊 Analysis:', result.analysis);
   console.log('💯 Score:', result.analysis?.pronunciationScore);
   console.log('✅ Passed:', result.analysis?.pronunciationScore >= 50);
  
      if (result.success) {
        const analysis = result.analysis;
        const passed = analysis.pronunciationScore >= 50;
        
        // ✅ Lưu score và transcription
        setPronunciationScore(analysis.pronunciationScore);
        setTranscription(analysis.transcription || '');
        
        // Set state để hiển thị feedback
        setIsChecked(true);
        setShowFeedback(true);
        setSelectedAnswer(passed ? 'correct' : 'wrong');
        
        if (passed) {
          playSound('correct');
          setCorrectAnswers(prev => prev + 1);
          setConsecutiveCorrect(prev => prev + 1);
        } else {
          playSound('wrong');
          setConsecutiveCorrect(0);
          setHearts(prev => Math.max(0, prev - 1));
          await syncUseHeart();
          
          if (!wrongQuestions.find(q => q.id === question.id)) {
            setWrongQuestions([...wrongQuestions, question]);
          }
        }
        
         console.log('✅ Analysis complete:', {
          score: analysis.pronunciationScore,
          passed,
          transcription: analysis.transcription
        });
        
      } else {
        console.error('❌ API error:', result);
        showToast('error', 'Lỗi', result.message || 'Không thể phân tích phát âm');
      }
    } catch (err) {
      console.error('❌ Analysis error:', err);
      showToast('error', 'Lỗi', 'Đã xảy ra lỗi khi phân tích');
    } finally {
      setAnalyzing(false);
    }
  };

  const reportReasons = [
    "Câu hỏi không rõ ràng",
    "Đáp án không chính xác",
    "Hình ảnh không phù hợp",
    "Âm thanh không đúng",
    "Nội dung không phù hợp",
    "Lỗi khác",
  ];

  // Mock questions data
  const allQuestions = [
    {
      id: 1,
      type: "vocabulary",
      question: 'Đâu là "cà phê"?',
      choices: [
        { id: "coffee", text: "coffee", image: coffee, audio: "coffee" },
        { id: "milk", text: "milk", image: milk, audio: "milk" },
        { id: "tea", text: "tea", image: tea, audio: "tea" },
      ],
      correctAnswer: "coffee",
    },
    {
      id: 2,
      type: "match_pairs",
      question: "Chọn cặp từ",
      leftColumn: [
        { id: "left1", text: "xin chào" },
        { id: "left2", text: "cà phê" },
        { id: "left3", text: "vui lòng" },
        { id: "left4", text: "trà" },
        { id: "left5", text: "sữa" },
      ],
      rightColumn: [
        { id: "right1", text: "hello", matchWith: "left1" },
        { id: "right2", text: "tea", matchWith: "left4" },
        { id: "right3", text: "coffee", matchWith: "left2" },
        { id: "right4", text: "please", matchWith: "left3" },
        { id: "right5", text: "milk", matchWith: "left5" },
      ],
    },
    {
      id: 3,
      type: "conversation",
      question: "Hoàn thành hội thoại",
      conversation: [{ character: "chibi", text: "Coffee or tea?" }],
      choices: [
        { id: "1", text: "Welcome." },
        { id: "2", text: "Coffee, please." },
      ],
      correctAnswer: "2",
    },
    {
      id: 4,
      type: "translate_build",
      question: "Viết lại bằng Tiếng Việt",
      audioText: "Tea or coffee?",
      wordBank: ["Trà", "cà", "lòng", "phê", "cảm ơn", "tôi", "hay", "cho"],
      correctAnswer: ["Trà", "hay", "cà", "phê"],
    },
    {
      id: 5,
      type: "listen_write",
      question: "Nghe và điền",
      audioText: "thank you",
      wordBank: ["thank you", "please", "tea", "goodbye", "Welcome"],
      correctAnswer: "thank you",
    },
    {
      id: 6,
      type: "multiple_choice",
      question: "Chọn nghĩa đúng",
      prompt: "cà phê",
      choices: [
        { id: "1", text: "tea" },
        { id: "2", text: "please" },
        { id: "3", text: "coffee" },
      ],
      correctAnswer: "3",
    },
  ];

  const [questions, setQuestions] = useState(allQuestions);
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  // Set original questions count khi component mount
  useEffect(() => {
    setOriginalQuestionsCount(allQuestions.length);
  }, []);
  /*
  // Check first time reminder
  useEffect(() => {
    try {
      if (!lessonId) return;
      const key = `lesson_seen_${lessonId}`;
      if (!localStorage.getItem(key)) {
        setShowFirstTimeReminder(true);
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }, [lessonId]);
*/
  // ========== FETCH LESSON DATA FROM API ==========
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId) {
        console.error("❌ No lessonId provided");
        showToast("error", "Lỗi", "Không tìm thấy ID bài học");
        navigate("/learn");
        return;
      }

      try {
        setIsLoadingLesson(true);
         console.log('📚 Fetching lesson:', lessonId);

        // 1. Lấy lesson details
        const lessonResponse = await lessonService.getLessonById(lessonId);
         console.log('✅ Lesson response:', lessonResponse);
        const lesson = lessonResponse.data;

        if (!lesson) {
          throw new Error("Lesson data is empty");
        }

        setLessonData(lesson);

        // 2. Lấy vocabularies
        const vocabResponse = await vocabularyService.getByLesson(lessonId);
         console.log('📖 Vocabularies:', vocabResponse.data?.length || 0);
        const vocabularies = vocabResponse.data || [];

        // 3. Lấy exercises
        const exerciseResponse = await exerciseService.getByLesson(lessonId);
         console.log('✏️ Exercises:', exerciseResponse.data?.length || 0);
        const exercises = exerciseResponse.data || [];

        // ✅ Kiểm tra nếu không có vocab và exercise
        if (vocabularies.length === 0 && exercises.length === 0) {
          console.warn("⚠️ No content in this lesson");
          showToast("warning", "Thông báo", "Bài học này chưa có nội dung");
        }

        // ✅ 4. Transform vocabularies thành vocabulary questions
        const vocabQuestions = vocabularies.map((vocab) => {
          // Tạo 2 wrong choices từ vocabularies khác (không trùng lặp)
          const wrongChoices = vocabularies
            .filter((v) => v._id !== vocab._id) // Loại bỏ vocab hiện tại
            .sort(() => Math.random() - 0.5) // Shuffle
            .slice(0, 2); // Lấy 2 cái

          // ✅ Đảm bảo có đủ 3 choices (1 đúng + 2 sai)
          const allChoices = [
            {
              id: vocab._id,
              text: vocab.word,
              image: vocab.imageUrl || coffee, // ✅ Dùng imageUrl từ backend
              audio: vocab.word,
            },
            ...wrongChoices.map((v) => ({
              id: v._id,
              text: v.word,
              image: v.imageUrl || milk, // ✅ Dùng imageUrl từ backend
              audio: v.word,
            })),
          ];

          // ✅ Shuffle để đáp án đúng không luôn ở vị trí đầu
          const shuffledChoices = allChoices.sort(() => Math.random() - 0.5);

          return {
            id: `vocab-${vocab._id}`,
            type: "vocabulary",
            question: `Đâu là "${vocab.meaning || vocab.word}"?`, // ✅ Hiển thị nghĩa tiếng Việt
            choices: shuffledChoices,
            correctAnswer: vocab._id, // ✅ Dùng _id thay vì word để so sánh chính xác
            vocab: vocab,
          };
        });

        // 5. Transform exercises thành câu hỏi
        const exerciseQuestions = exercises.map((exercise) => {
          let questionType = "multiple_choice";

          // ✅ Map backend type sang frontend type
          if (exercise.type === "multiple-choice")
            questionType = "multiple_choice";
          else if (exercise.type === "fill-in-blank")
            questionType = "fill_in_blank"; // ✅ Sửa type
          else if (exercise.type === "translation")
            questionType = "translation"; // ✅ Sửa type
          else if (exercise.type === "listening") questionType = "listen_write";
          else if (exercise.type === "speaking") questionType = "speaking";
          else if (exercise.type === "matching") questionType = "match_pairs";

          // ✅ Transform options
          const choices =
            exercise.options?.map((opt, idx) => ({
              id: opt._id || String(idx + 1),
              text: opt.text,
            })) || [];

          // ✅ Tìm correct answer
          const correctOption = exercise.options?.find((opt) => opt.isCorrect);
          const correctAnswer = correctOption
            ? correctOption._id ||
              String(exercise.options.indexOf(correctOption) + 1)
            : exercise.correctAnswer;

          // ✅ Tạo base question object
          const questionObj = {
            id: `exercise-${exercise._id}`,
            type: questionType,
            question: exercise.question,
            prompt: exercise.question,
            choices: choices,
            correctAnswer: correctAnswer,
            explanation: exercise.explanation,
            exercise: exercise,
          };

          // ✅ Xử lý đặc biệt cho match_pairs
          if (questionType === "match_pairs") {
            // Parse correctAnswer JSON để tạo leftColumn và rightColumn
            try {
              const pairs =
                typeof exercise.correctAnswer === "string"
                  ? JSON.parse(exercise.correctAnswer)
                  : exercise.correctAnswer || {};

              const leftColumn = Object.keys(pairs).map((leftText, index) => ({
                id: `left-${index}`,
                text: leftText,
              }));

              const rightColumn = Object.values(pairs).map(
                (rightText, index) => ({
                  id: `right-${index}`,
                  text: rightText,
                  matchWith: `left-${Object.keys(pairs).findIndex(
                    (key) => pairs[key] === rightText
                  )}`,
                })
              );

              questionObj.leftColumn = leftColumn;
              questionObj.rightColumn = rightColumn;
              questionObj.correctAnswer = "All pairs matched"; // Placeholder
            } catch (error) {
              console.error("Error parsing matching pairs:", error);
              // Fallback: tạo empty columns
              questionObj.leftColumn = [];
              questionObj.rightColumn = [];
            }
          }

          // ✅ Xử lý đặc biệt cho translate_build và listen_write
          if (
            questionType === "translate_build" ||
            questionType === "listen_write"
          ) {
            // Parse correctAnswer để tạo wordBank
            try {
              let wordBank = [];

              if (typeof exercise.correctAnswer === "string") {
                // Nếu là string, split thành array
                wordBank = exercise.correctAnswer
                  .split(",")
                  .map((word) => word.trim());
              } else if (Array.isArray(exercise.correctAnswer)) {
                // Nếu đã là array
                wordBank = exercise.correctAnswer;
              } else {
                // Fallback: tạo wordBank từ question text
                wordBank = exercise.question.split(" ").slice(0, 10); // Lấy 10 từ đầu
              }

              questionObj.wordBank = wordBank;
              questionObj.audioText = exercise.question; // Sử dụng question làm audio text
            } catch (error) {
              console.error("Error creating wordBank:", error);
              // Fallback: tạo wordBank từ question
              questionObj.wordBank = exercise.question.split(" ").slice(0, 10);
              questionObj.audioText = exercise.question;
            }
          }

          return questionObj;
        });

        const transformedQuestions = [...vocabQuestions, ...exerciseQuestions];

         console.log('🎯 Total questions:', transformedQuestions.length);
         console.log('📋 Sample question:', transformedQuestions[0]);

        // ✅ Set questions
        if (transformedQuestions.length > 0) {
          setQuestions(transformedQuestions);
          setOriginalQuestionsCount(transformedQuestions.length);
        } else {
          console.warn("⚠️ Using mock data as fallback");
          setQuestions(allQuestions);
          setOriginalQuestionsCount(allQuestions.length);
        }
      } catch (error) {
        console.error("❌ Error fetching lesson data:", error);
        console.error("Error details:", error.response?.data || error.message);
        showToast(
          "error",
          "Lỗi",
          error.response?.data?.message || "Không thể tải dữ liệu bài học"
        );

        setTimeout(() => {
          navigate("/learn");
        }, 2000);
      } finally {
        setIsLoadingLesson(false);
      }
    };

    fetchLessonData();
  }, [lessonId, navigate]);

  const dismissFirstTimeReminder = () => {
    try {
      if (lessonId) localStorage.setItem(`lesson_seen_${lessonId}`, "1");
    } catch (e) {
      /* ignore */
    }
    setShowFirstTimeReminder(false);
  };

  // Check if current question is a review question
  const isReviewQuestion = currentQuestion >= originalQuestionsCount;

  const playSound = (type) => {
    let audioSrc;
    if (type === "correct") {
      audioSrc = correctSound;
    } else if (type === "wrong") {
      audioSrc = wrongSound;
    } else {
      return;
    }

    const audio = new Audio(audioSrc);
    audio.play().catch((err) =>  ("Không thể phát âm thanh:", err));
  };

  // Sync Hearts when used
  const syncUseHeart = async () => {
    try {
      setIsSyncing(true);
      const response = await heartService.useHeart();

       console.log('Use heart response:', response);

      // Xử lý nhiều format response
      let currentHearts = 0;

      if (typeof response === "number") {
        currentHearts = response;
      } else if (response?.data?.hearts !== undefined) {
        currentHearts = response.data.hearts;
      } else if (response?.hearts !== undefined) {
        currentHearts = response.hearts;
      } else if (response?.current !== undefined) {
        currentHearts = response.current;
      } else if (response?.remaining !== undefined) {
        currentHearts = response.remaining;
      }

       console.log('Hearts after use:', currentHearts);
      setHearts(currentHearts);

      if (currentHearts === 1) {
        showToast(
          "warning",
          "Cảnh báo! ❤️",
          "Bạn chỉ còn 1 tim, hãy cẩn thận!"
        );
      }

      if (currentHearts <= 0) {
        setHearts(0);
        Swal.fire({
          title: "Hết tim rồi! 💔",
          text: "Bạn cần nghỉ ngơi hoặc mua thêm tim để tiếp tục",
          imageUrl: horse,
          imageWidth: 200,
          imageHeight: 200,
          confirmButtonText: "Quay về",
          confirmButtonColor: "#ef4444",
          allowOutsideClick: false,
        }).then(() => {
          navigate("/learn");
        });
      }

      return currentHearts;
    } catch (error) {
      console.error("Error using heart:", error);
      showToast("error", "Lỗi", "Không thể sử dụng tim. Vui lòng thử lại.");
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const loadHearts = async () => {
      try {
        setIsSyncing(true);
        const response = await heartService.refillHearts();

        // LOG để debug - xem response trả về gì
         console.log('Heart refill response:', response);

        // Xử lý nhiều format response khác nhau
        let currentHearts = 5; // default

        if (typeof response === "number") {
          currentHearts = response;
        } else if (response?.data?.hearts !== undefined) {
          currentHearts = response.data.hearts;
        } else if (response?.hearts !== undefined) {
          currentHearts = response.hearts;
        } else if (response?.current !== undefined) {
          currentHearts = response.current;
        }

         console.log('Setting hearts to:', currentHearts);
        setHearts(currentHearts);
      } catch (error) {
        console.error("Error loading hearts:", error);
        // Nếu lỗi, thử get hearts hiện tại
        try {
          const currentData = await heartService.getHearts();
           console.log('Get hearts response:', currentData);

          const currentHearts =
            currentData?.hearts ?? currentData?.current ?? 5;
          setHearts(currentHearts);
        } catch (err) {
          console.error("Error getting hearts:", err);
          setHearts(5); // fallback
        }
      } finally {
        setIsSyncing(false);
      }
    };

    loadHearts();
  }, []);

  const checkMatch = (leftId, rightId) => {
    const rightItem = question.rightColumn.find((item) => item.id === rightId);

    if (rightItem && rightItem.matchWith === leftId) {
      // ✅ Ghép đúng
      playSound("correct");
      const newMatchedPairs = [...matchedPairs, leftId, rightId];
      setMatchedPairs(newMatchedPairs);
      setSelectedLeft(null);
      setSelectedRight(null);

      // ✅ ĐỌC tiếng Anh khi ghép đúng (để confirm)
      speakText(rightItem.text);

      // Check xem đã hoàn thành hết chưa
      if (
        newMatchedPairs.length ===
        question.leftColumn.length + question.rightColumn.length
      ) {
        setTimeout(() => {
          setIsChecked(true);
          setShowFeedback(true);
          setCorrectAnswers((prev) => prev + 1);
          setConsecutiveCorrect((prev) => prev + 1);
        }, 500);
      }
    } else {
      // ✅ Ghép sai
      playSound("wrong");
      setHearts((prev) => Math.max(0, prev - 1));

      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  const handlePairClick = (id, column) => {
    if (matchedPairs.includes(id) || isChecked) return;

    if (column === "left") {
      // ✅ Click vào cột TRÁI (Tiếng Việt) - KHÔNG ĐỌC
      setSelectedLeft(id);

      // Kiểm tra match nếu đã chọn cột phải
      if (selectedRight) {
        checkMatch(id, selectedRight);
      }
    } else {
      // ✅ Click vào cột PHẢI (Tiếng Anh) - KHÔNG ĐỌC
      setSelectedRight(id);

      // Kiểm tra match nếu đã chọn cột trái
      if (selectedLeft) {
        checkMatch(selectedLeft, id);
      }
    }
  };

  const speakText = (text, options = {}) => {
    if (!text || !text.toString().trim()) {
      console.warn("⚠️ Không có text để phát âm");
      return;
    }

    // ✅ Cancel bất kỳ speech nào đang chạy
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // ✅ Hàm chọn giọng ENGLISH tốt nhất (giữ nguyên)
    const getEnglishVoice = (voices) => {
       console.log('📋 Available voices:',
        voices.map((v) => `${v.name} (${v.lang})`)
      );

      let voice = voices.find(
        (v) => v.lang === "en-US" && v.name.toLowerCase().includes("google")
      );
      if (voice) {
         console.log('✅ Chọn Google US:', voice.name);
        return voice;
      }

      voice = voices.find(
        (v) =>
          v.lang === "en-US" &&
          (v.name.includes("David") || v.name.includes("Zira"))
      );
      if (voice) {
         console.log('✅ Chọn Microsoft:', voice.name);
        return voice;
      }

      voice = voices.find(
        (v) => v.lang === "en-US" && v.name.includes("Samantha")
      );
      if (voice) {
         console.log('✅ Chọn Samantha:', voice.name);
        return voice;
      }

      voice = voices.find((v) => v.lang === "en-US");
      if (voice) {
         console.log('✅ Chọn en-US:', voice.name);
        return voice;
      }

      voice = voices.find((v) => v.lang && v.lang.startsWith("en-"));
      if (voice) {
         console.log('✅ Chọn English:', voice.name);
        return voice;
      }

      voice = voices.find(
        (v) =>
          v.lang &&
          !v.lang.startsWith("vi") &&
          !v.name.toLowerCase().includes("vietnam")
      );
      if (voice) {
         console.log('⚠️ Fallback voice:', voice.name);
        return voice;
      }

      console.error("❌ Không tìm thấy giọng English!");
      return null;
    };

    // ✅ Hàm thực hiện speak
    const doSpeak = (selectedVoice) => {
      const utterance = new SpeechSynthesisUtterance(text.toString());

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
         console.log(`🔊 Đang đọc: "${text}"`);
         console.log(`   Voice: ${utterance.voice?.name || "default"}`);
         console.log(`   Lang: ${utterance.lang}`);
      };

      utterance.onend = () => {
         console.log('✅ Hoàn thành phát âm');

        // ✅ THÊM: Tự động bật ghi âm nếu đang ở câu hỏi speaking
        if (options.autoRecord && question.type === "speaking") {
           console.log('🎤 Tự động bắt đầu ghi âm...');
          setTimeout(() => {
            startRecording();
          }, 500); // Đợi 0.5s sau khi đọc xong
        }
      };

      utterance.onerror = (err) => {
        if (err.error !== "canceled") {
          console.error("❌ Lỗi:", err.error);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    // ✅ Lấy danh sách voices
    let voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      const englishVoice = getEnglishVoice(voices);
      doSpeak(englishVoice);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
         console.log(`✅ Loaded ${voices.length} voices`);

        const englishVoice = getEnglishVoice(voices);
        doSpeak(englishVoice);

        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  };

  useEffect(() => {
    if (!question) return;

    const timer = setTimeout(() => {
      // ✅ SỬA: Thêm check cho speaking type
      if (question.type === "speaking" && question.question) {
        // Speaking: đọc câu hỏi (hướng dẫn)
        speakText(question.question);
      } else if (
        question.type === "conversation" &&
        question.conversation?.[0]?.text
      ) {
        // Conversation: đọc dialog
        speakText(question.conversation[0].text);
      } else if (question.type === "translate_build" && question.audioText) {
        speakText(question.audioText);
      } else if (question.type === "listen_write" && question.audioText) {
        speakText(question.audioText);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentQuestion, question]);

  // ✅ Sửa handleChoiceClick để so sánh đúng với _id
  const handleChoiceClick = (choiceId, choiceText) => {
    if (isChecked) return;
    setSelectedAnswer(choiceId); // ✅ Lưu _id thay vì text
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

  // ✅ Sửa handleCheck để so sánh đúng
  const handleCheck = async () => {
    // ✅ THÊM: Xử lý speaking type
    if (question.type === "speaking") {
    // Nếu đã analyze rồi (có pronunciationScore), chỉ cần show feedback
    if (pronunciationScore > 0) {
      setIsChecked(true);
      setShowFeedback(true);
      const passed = pronunciationScore >= 50;
      setSelectedAnswer(passed ? 'correct' : 'wrong');
      
      if (passed) {
        playSound('correct');
        setCorrectAnswers(prev => prev + 1);
        setConsecutiveCorrect(prev => prev + 1);
      } else {
        playSound('wrong');
        setConsecutiveCorrect(0);
        setHearts(prev => Math.max(0, prev - 1));
        await syncUseHeart();
        
        if (!wrongQuestions.find(q => q.id === question.id)) {
          setWrongQuestions([...wrongQuestions, question]);
        }
      }
    } else {
      // Chưa ghi âm/analyze
      showToast('warning', 'Thông báo', 'Vui lòng ghi âm trước khi kiểm tra');
    }
    return;
  }

    // ✅ Xử lý match_pairs
    if (question.type === "match_pairs") {
      const allMatched =
        matchedPairs.length ===
        question.leftColumn.length + question.rightColumn.length;

      if (allMatched) {
        const answeredQ = {
          ...question,
          isCorrect: true,
          userAnswer: "All pairs matched",
          timestamp: Date.now(),
        };
        setAnsweredQuestions((prev) => [...prev, answeredQ]);
        setIsChecked(true);
        setShowFeedback(true);
        return;
      } else {
        showToast(
          "warning",
          "Chưa hoàn thành",
          "Hãy ghép hết tất cả các cặp từ"
        );
        return;
      }
    }

    let answer;
    if (question.type === "translate_build") {
      answer = selectedWords.join(" ");
    } else if (question.type === "listen_write") {
      answer = selectedAnswer;
    } else {
      answer = selectedAnswer; // ✅ Đây là _id
    }

    if (!answer) return;

    setIsChecked(true);
    setShowFeedback(true);
    setIsSkipped(false);

    let isCorrect = false;
    if (question.type === "translate_build") {
      isCorrect =
        JSON.stringify(selectedWords) ===
        JSON.stringify(question.correctAnswer);
    } else {
      // ✅ So sánh _id với _id
      isCorrect = answer === question.correctAnswer;
    }

     console.log("🔍 Check answer:", {
      answer,
      correctAnswer: question.correctAnswer,
      isCorrect,
    });

    const answeredQ = {
      ...question,
      isCorrect,
      userAnswer:
        question.type === "translate_build" ? selectedWords.join(" ") : answer,
      timestamp: Date.now(),
    };
    setAnsweredQuestions((prev) => [...prev, answeredQ]);

    if (isCorrect) {
      playSound("correct");
      setCorrectAnswers((prev) => prev + 1);
      setConsecutiveCorrect((prev) => prev + 1);

      if ((consecutiveCorrect + 1) % 5 === 0) {
        showToast(
          "success",
          `🔥 Chuỗi ${consecutiveCorrect + 1} câu đúng!`,
          "Bạn đang làm rất tốt!"
        );
      }
    } else {
      playSound("wrong");
      setConsecutiveCorrect(0);

      const newHearts = hearts - 1;
      setHearts(Math.max(0, newHearts));
      await syncUseHeart();

      if (!wrongQuestions.find((q) => q.id === question.id)) {
        setWrongQuestions([...wrongQuestions, question]);
      }
    }
  };

  const handleContinue = () => {
  const isLastQuestion = currentQuestion === questions.length - 1;

  if (!isLastQuestion) {
    // Reset states chung
    setSelectedAnswer(null);
    setIsChecked(false);
    setShowFeedback(false);
    setIsSkipped(false);
    setSelectedWords([]);
    setMatchedPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);

    // ✅ THÊM: Reset states cho speaking
    setPronunciationScore(0);
    setTranscription('');
    setAudioBlob(null);
    setRecording(false);
    setAnalyzing(false);

    setCurrentQuestion(currentQuestion + 1);
  } else {
    // Nếu là câu cuối và có wrongQuestions
    if (wrongQuestions.length > 0 && !showReviewNotice) {
      setReviewCount(wrongQuestions.length);
      setShowReviewNotice(true);

      setTimeout(() => {
        setShowReviewNotice(false);
        const reviewQuestions = wrongQuestions.map((q) => ({ ...q }));
        setQuestions([...questions, ...reviewQuestions]);
        setWrongQuestions([]);

        // ✅ THÊM: Reset speaking states khi bắt đầu review
        setPronunciationScore(0);
        setTranscription('');
        setAudioBlob(null);
        setRecording(false);
        setAnalyzing(false);

        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsChecked(false);
        setShowFeedback(false);
        setSelectedWords([]);
        setMatchedPairs([]);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 3000);
    } else {
      handleCompleteLessonSuccess();
    }
  }
};

  const handleSkip = async () => {
    if (hearts === 1) {
      Swal.fire({
        title: "Cảnh báo!",
        text: "Bạn chỉ còn 1 tim! Bạn có chắc muốn bỏ qua?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Bỏ qua",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setIsChecked(true);
          setShowFeedback(true);
          setIsSkipped(true);
          setConsecutiveCorrect(0);

          const newHearts = Math.max(0, hearts - 1);
          setHearts(newHearts);
          await syncUseHeart();

          playSound("wrong");
        }
      });
    } else {
      setIsChecked(true);
      setShowFeedback(true);
      setIsSkipped(true);
      setConsecutiveCorrect(0);

      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);
      await syncUseHeart();

      playSound("wrong");
    }
  };

  const calculateAccuracy = () => {
    const total = answeredQuestions.length;
    if (total === 0) return 0;
    return Math.round((correctAnswers / total) * 100);
  };

  const handleClose = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    navigate("/learn");
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
  };

  const handleOpenReviewModal = () => {
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
    setConsecutiveCorrect(0);
    setWrongQuestions([]);
    setCorrectAnswers(0);
    setAnsweredQuestions([]);
    setMatchedPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setQuestions(allQuestions);
  };

  // Thêm function để update progress khi hoàn thành lesson
  const handleCompleteLessonSuccess = async () => {
    try {
       console.log("🎉 Completing lesson:", lessonId);

      const progressData = {
        completed: true,
        score: calculateAccuracy(),
        timeSpent: Math.floor((Date.now() - lessonStartTime) / 1000), // seconds
      };

       console.log("📊 Progress data:", progressData);

      // ✅ Update progress: mark lesson as completed
      const response = await progressService.updateLessonProgress(
        lessonId,
        progressData
      );
      // ✅ 2. Lấy XP reward từ lesson data
    const xpReward = lessonData?.xpReward || 10; // Default 10 XP nếu không có
     console.log(`💎 Earning ${xpReward} XP from lesson`);

    // ✅ 3. Update XP qua API
    const xpResult = await xpService.updateXP(xpReward);
     console.log("✅ XP updated:", xpResult);

       console.log("✅ Progress updated:", response);

      // Show success toast
      showToast("success", "Thành công", "Đã lưu tiến độ học tập!");

      // Wait a bit for toast to show
      setTimeout(() => {
        // Navigate về /learn để thấy lesson tiếp theo unlock
        navigate("/learn");
      }, 1500);
    } catch (error) {
      console.error("❌ Error updating progress:", error);
      console.error("Error details:", error.response?.data);

      // ✅ Hiển thị lỗi cụ thể
      const errorMessage =
        error.response?.data?.message || "Không thể lưu tiến độ học tập";
      showToast("error", "Lỗi", errorMessage);

      // Still navigate even if error
      setTimeout(() => {
        navigate("/learn");
      }, 1500);
    }
  };

  const [lessonStartTime] = useState(Date.now());

  const handleContinueToLearn = () => {
    handleCompleteLessonSuccess();
  };

  const handleOpenReportModal = () => {
    setShowReportModal(true);
    setSelectedReportReason("");
    setReportDetails("");
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setSelectedReportReason("");
    setReportDetails("");
  };

  const handleSubmitReport = () => {
    if (!selectedReportReason) {
      showToast("warning", "Thiếu thông tin", "Vui lòng chọn lý do báo cáo");
      return;
    }
    showToast("success", "Đã gửi báo cáo", "Cảm ơn phản hồi của bạn!");
    handleCloseReportModal();
  };

  const isCorrectAnswer = () => {
  if (question.type === "speaking") {
    return pronunciationScore >= 50; // Pass nếu >= 50%
  }
    if (question.type === "match_pairs") {
      return (
        matchedPairs.length ===
        question.leftColumn.length + question.rightColumn.length
      );
    }
    if (question.type === "translate_build") {
      return (
        JSON.stringify(selectedWords) === JSON.stringify(question.correctAnswer)
      );
    }
    return selectedAnswer === question.correctAnswer;
  };

  const getCorrectAnswerText = () => {
  if (question.type === "speaking") {
    if (pronunciationScore >= 50) {
      return "Bạn đã phát âm tốt!"; // Hiển thị khen ngợi nếu pass
    } else {
      return question.correctAnswer; // Hiển thị đáp án đúng nếu fail
    }
  }
    if (question.type === "match_pairs") {
      return "Đã hoàn thành tất cả các cặp";
    }
    if (question.type === "translate_build") {
      return question.correctAnswer.join(" ");
    }
    if (
      question.type === "vocabulary" ||
      question.type === "conversation" ||
      question.type === "multiple_choice"
    ) {
      return question.choices.find((c) => c.id === question.correctAnswer)
        ?.text;
    }
    return question.correctAnswer;
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case "vocabulary":
        return "Từ vựng";
      case "match_pairs":
        return "Ghép cặp";
      case "conversation":
        return "Hội thoại";
      case "translate_build":
        return "Viết lại";
      case "listen_write":
        return "Nghe viết";
      case "multiple_choice":
        return "Chọn đáp án";
      default:
        return "Câu hỏi";
    }
  };

  const getQuestionContent = (q) => {
    if (q.type === "vocabulary") return q.question;
    if (q.type === "match_pairs") return "Chọn cặp từ";
    if (q.type === "conversation") return q.conversation[0].text;
    if (q.type === "translate_build") return q.audioText;
    if (q.type === "listen_write") return q.audioText;
    if (q.type === "multiple_choice") return q.prompt;
    return q.question;
  };

  const getCorrectAnswerForReview = (q) => {
    if (q.type === "translate_build") {
      return q.correctAnswer.join(" ");
    }
    if (
      q.type === "vocabulary" ||
      q.type === "conversation" ||
      q.type === "multiple_choice"
    ) {
      const choice = q.choices.find((c) => c.id === q.correctAnswer);
      return choice ? choice.text : q.correctAnswer;
    }
    return q.correctAnswer;
  };

  const hasAudio = (q) => {
    return (
      q.type === "conversation" ||
      q.type === "translate_build" ||
      q.type === "listen_write"
    );
  };

  const getAudioText = (q) => {
    if (q.type === "conversation") return q.conversation[0].text;
    if (q.type === "translate_build" || q.type === "listen_write")
      return q.audioText;
    return "";
  };

  const renderQuestion = () => {
    const renderQuestionContent = () => {
      switch (question.type) {
        case "match_pairs":
          return (
            <MatchPairsContainer>
              <PairColumn>
                {question.leftColumn.map((item, index) => (
                  <PairCard
                    key={item.id}
                    $selected={selectedLeft === item.id}
                    $matched={matchedPairs.includes(item.id)}
                    disabled={matchedPairs.includes(item.id)}
                    onClick={() => handlePairClick(item.id, "left")}
                  >
                    <PairNumber $matched={matchedPairs.includes(item.id)}>
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
                    $selected={selectedRight === item.id}
                    $matched={matchedPairs.includes(item.id)}
                    disabled={matchedPairs.includes(item.id)}
                    onClick={() => handlePairClick(item.id, "right")}
                  >
                    <PairNumber $matched={matchedPairs.includes(item.id)}>
                      {index + 6}
                    </PairNumber>
                    {item.text}
                    {matchedPairs.includes(item.id) && <MatchIcon>✓</MatchIcon>}
                  </PairCard>
                ))}
              </PairColumn>
            </MatchPairsContainer>
          );

        case "vocabulary":
          return (
            <ChoicesGrid>
              {question.choices.map((choice, index) => (
                <ChoiceCard
                  key={choice.id}
                  $selected={selectedAnswer === choice.id}
                  $isCorrect={isChecked && choice.id === question.correctAnswer}
                  $isWrong={
                    isChecked &&
                    selectedAnswer === choice.id &&
                    choice.id !== question.correctAnswer
                  }
                  $isChecked={isChecked}
                  disabled={isChecked}
                  onClick={() => handleChoiceClick(choice.id, choice.text)}
                >
                  <ChoiceImage
                    src={choice.image || coffee}
                    alt={choice.text}
                    onError={(e) => {
                      e.target.src = coffee;
                    }}
                  />
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
          );

        case "conversation":
          return (
            <>
              <ChoicesGrid>
                {question.choices &&
                  question.choices.map((choice, index) => (
                    <ChoiceCard
                      key={choice.id}
                      $selected={selectedAnswer === choice.id}
                      $isCorrect={
                        isChecked && choice.id === question.correctAnswer
                      }
                      $isWrong={
                        isChecked &&
                        selectedAnswer === choice.id &&
                        choice.id !== question.correctAnswer
                      }
                      $isChecked={isChecked}
                      disabled={isChecked}
                      onClick={() => handleChoiceClick(choice.id, choice.text)}
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                      }}
                    >
                      <ChoiceNumber>{index + 1}</ChoiceNumber>
                      <ChoiceText>{choice.text}</ChoiceText>
                    </ChoiceCard>
                  ))}
              </ChoicesGrid>
            </>
          );

        case "translate_build":
          return (
            <>
              <AnswerDisplay hasAnswer={selectedWords.length > 0}>
                {selectedWords.length === 0 ? (
                  <span style={{ color: "#9ca3af" }}>
                    Chọn các từ phía dưới
                  </span>
                ) : (
                  selectedWords.map((word, index) => (
                    <SelectedWord
                      key={index}
                      onClick={() => handleRemoveWord(index)}
                    >
                      {word}
                    </SelectedWord>
                  ))
                )}
              </AnswerDisplay>
              <WordBankContainer>
                {question.wordBank.map((word, index) => (
                  <WordChip
                    key={index}
                    $selected={selectedWords.includes(word)}
                    disabled={
                      isChecked ||
                      selectedWords.filter((w) => w === word).length >=
                        question.wordBank.filter((w) => w === word).length
                    }
                    onClick={() => handleWordClick(word)}
                  >
                    {word}
                  </WordChip>
                ))}
              </WordBankContainer>
            </>
          );

        case "listen_write":
          return (
            <>
              <AudioButton
                onClick={() => {
                  // ✅ Clear input và focus khi ấn nút loa
                  setSelectedAnswer("");
                  setTimeout(() => {
                    // Focus vào input sau khi clear
                    const input = document.querySelector('input[type="text"]');
                    if (input) input.focus();
                  }, 50);

                  // ✅ Chỉ đọc "từ đáp án" (dùng speakText), không dùng audio import
                  let textToSpeak = "";
                  if (typeof question.correctAnswer === "string") {
                    textToSpeak = question.correctAnswer;
                  } else if (Array.isArray(question.correctAnswer)) {
                    textToSpeak = question.correctAnswer.join(" ");
                  } else if (question.audioText) {
                    textToSpeak = question.audioText;
                  }
                  speakText(textToSpeak);
                }}
                title="Phát âm để nghe"
              >
                <VolumeUp sx={{ fontSize: 28 }} />
              </AudioButton>

              {/* Input để người dùng gõ đáp án nghe được */}
              <InputContainer style={{ maxWidth: 700, margin: "2rem auto" }}>
                <InputLabel>Nghe và nhập đáp án</InputLabel>
                <InputField
                  theme="light"
                  type="text"
                  value={selectedAnswer || ""}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Nhập đáp án..."
                  disabled={isChecked}
                />
              </InputContainer>
            </>
          );

        case "multiple_choice":
          return (
            <>
              <ChoicesGrid>
                {question.choices.map((choice, index) => (
                  <ChoiceCard
                    key={choice.id}
                    $selected={selectedAnswer === choice.id}
                    $isCorrect={
                      isChecked && choice.id === question.correctAnswer
                    }
                    $isWrong={
                      isChecked &&
                      selectedAnswer === choice.id &&
                      choice.id !== question.correctAnswer
                    }
                    $isChecked={isChecked}
                    disabled={isChecked}
                    onClick={() => handleChoiceClick(choice.id, choice.text)}
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <ChoiceNumber>{index + 1}</ChoiceNumber>
                    <ChoiceText>{choice.text}</ChoiceText>
                  </ChoiceCard>
                ))}
              </ChoicesGrid>
            </>
          );

        case "fill_in_blank":
        case "translation":
          return (
            <InputContainer>
              <InputLabel>
                {question.type === "fill_in_blank"
                  ? "Điền vào chỗ trống:"
                  : "Dịch câu sau:"}
              </InputLabel>
              <InputField
                theme="light"
                type="text"
                value={selectedAnswer || ""}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Nhập câu trả lời..."
                disabled={isChecked}
              />
            </InputContainer>
          );
        case "speaking":
  return (
    <SpeakingContainer>
      {/* ✅ Hiển thị câu cần đọc */}
      

      {/* ✅ Nút phát âm mẫu */}
      <PlaySampleButton
        onClick={() => {
           console.log('🔊 Playing sample:', question.correctAnswer);
          speakText(question.correctAnswer || question.question);
        }}
        disabled={recording || analyzing}
      >
        <VolumeUp sx={{ fontSize: 20 }} />
        
      </PlaySampleButton>
        
      {/* ✅ THÊM: Chỉ hiển thị MIC nếu CHƯA check hoặc đã check nhưng sai */}
      {!isChecked && (
        <MicContainer>
          {!recording && !analyzing && (
  <>
    <MicButton onClick={startRecording}>
      <Mic sx={{ fontSize: 24 }} />
    </MicButton>
    <MicHint>Bấm để bắt đầu ghi âm</MicHint>
  </>
)}

          {recording && (
            <>
              <MicButton recording={true} onClick={stopRecording}>
                <Mic sx={{ fontSize: 48 }} />
                <WaveformAnimation>
                  <WaveDot delay="0s" />
                  <WaveDot delay="0.1s" />
                  <WaveDot delay="0.2s" />
                  <WaveDot delay="0.3s" />
                  <WaveDot delay="0.4s" />
                </WaveformAnimation>
              </MicButton>
              <MicHint recording={true}>Nhấn để dừng ghi âm</MicHint>
            </>
          )}

          {analyzing && (
            <>
              <AnalyzingSpinner />
              <MicHint>Đang chấm điểm...</MicHint>
            </>
          )}
        </MicContainer>
      )}

      {/* ✅ Kết quả sau khi chấm điểm */}
      {isChecked && pronunciationScore > 0 && (
        <SpeakingResult passed={pronunciationScore >= 50}>
          {/* Header với emoji và score */}
          <ResultHeader>
            <ResultEmoji passed={pronunciationScore >= 50}>
              {pronunciationScore >= 50 ? '🎉' : '😕'}
            </ResultEmoji>
            <ResultScoreContainer>
              <ResultScore passed={pronunciationScore >= 50}>
                {pronunciationScore}%
              </ResultScore>
              <ResultScoreLabel>Điểm phát âm</ResultScoreLabel>
            </ResultScoreContainer>
          </ResultHeader>

          {/* Progress bar cho score */}
          <ScoreProgressBar>
            <ScoreProgressFill score={pronunciationScore} passed={pronunciationScore >= 50} />
          </ScoreProgressBar>

          {/* Text feedback */}
          <ResultText passed={pronunciationScore >= 50}>
            {pronunciationScore >= 50 
              ? 'Tuyệt vời! Phát âm rất chuẩn!' 
              : 'Cần luyện tập thêm nhé!'}
          </ResultText>
          
          {/* Transcription comparison */}
          <TranscriptionComparison>
            <TranscriptionBox>
              <TranscriptionHeader>
                <TranscriptionLabel>Bạn đã nói:</TranscriptionLabel>
              </TranscriptionHeader>
              <TranscriptionText passed={pronunciationScore >= 50}>
                {transcription || 'Không nhận diện được'}
              </TranscriptionText>
            </TranscriptionBox>

            <TranscriptionDivider />

            <TranscriptionBox>
              <TranscriptionHeader>
                <TranscriptionLabel>Cần nói:</TranscriptionLabel>
              </TranscriptionHeader>
              <TranscriptionText correct={true}>
                {question.correctAnswer}
              </TranscriptionText>
            </TranscriptionBox>
          </TranscriptionComparison>

          {/* Tips for improvement */}
          {pronunciationScore < 50 && (
            <ImprovementTips>
              <TipsIcon>💡</TipsIcon>
              <TipsText>
                <strong>Mẹo cải thiện:</strong> Luyện tập phát âm từng từ một và chú ý trọng âm.
              </TipsText>
            </ImprovementTips>
          )}
        </SpeakingResult>
      )}
    </SpeakingContainer>
  );
        default:
          return null;
      }
    };

    const linhImgSrc =
      isChecked && !isSkipped
        ? isCorrectAnswer()
          ? happyGif
          : sadGif
        : LinhThuTini;

    return (
      <>
        {/* ✅ BỎ nút loa bên cạnh câu hỏi - chỉ giữ QuestionWithCharacterContainer */}
        <QuestionWithCharacterContainer>
          <LinhThuTiniImage src={linhImgSrc} alt="LinhThuTini" />
          <QuestionText>{question.question}</QuestionText>
        </QuestionWithCharacterContainer>
        {renderQuestionContent()}
      </>
    );
  };

  if (!question) {
    return (
      <PageWrapper>
        <Container style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2>Đang tải...</h2>
        </Container>
      </PageWrapper>
    );
  }
  // ========== RENDER ==========
  if (isLoadingLesson) {
    return (
      <PageWrapper>
        <Container style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <LoadingSpinner />
          <LoadingText>Đang tải bài học...</LoadingText>
        </Container>
      </PageWrapper>
    );
  }

  if (!question || questions.length === 0) {
    return (
      <PageWrapper>
        <Container style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2>Bài học này chưa có câu hỏi</h2>
          <CompletionButton onClick={() => navigate("/learn")}>
            Quay về
          </CompletionButton>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Toast toast={toast} onClose={hideToast} />

      {isSyncing && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "1rem 2rem",
            borderRadius: "12px",
            zIndex: 9999,
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          ⏳ Đang đồng bộ...
        </div>
      )}

      {showReviewNotice && (
        <ReviewNoticeBanner>
          <ReviewNoticeIcon>🔄</ReviewNoticeIcon>
          <ReviewNoticeText>
            <ReviewNoticeTitle>Xem lại câu sai</ReviewNoticeTitle>
            <ReviewNoticeSubtitle>
              Còn <ReviewNoticeCount>{reviewCount}</ReviewNoticeCount> câu cần
              làm lại
            </ReviewNoticeSubtitle>
          </ReviewNoticeText>
        </ReviewNoticeBanner>
      )}

      {showCompletion ? (
        <CompletionOverlay>
          <CelebrationIcon>✨</CelebrationIcon>
          <Fireworks>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="particle"></div>
            ))}
          </Fireworks>

          <CompletionCharacters>
            <CharacterIcon src={successGif} alt="Success" />
          </CompletionCharacters>

          <CompletionTitle>Hoàn thành bài học!</CompletionTitle>

          <StatsContainer>
            <StatCard color="#58CC02">
              <StatLabel color="#58CC02">ĐỘ CHÍNH XÁC</StatLabel>
              <StatValue color="#58CC02">🎯 {calculateAccuracy()}%</StatValue>
            </StatCard>

            <StatCard color="#fbbf24">
              <StatLabel color="#fbbf24">CÂU ĐÚNG</StatLabel>
              <StatValue color="#fbbf24">
                ✓ {correctAnswers}/{answeredQuestions.length}
              </StatValue>
            </StatCard>
            {/* ✅ Thêm card hiển thị XP reward */}
  <StatCard color="#1CB0F6">
    <StatLabel color="#1CB0F6">XP NHẬN ĐƯỢC</StatLabel>
    <StatValue color="#1CB0F6">
      💎 +{lessonData?.xpReward || 10} XP
    </StatValue>
  </StatCard>
          </StatsContainer>

          <CompletionButtons>
            <CompletionButton onClick={handleOpenReviewModal}>
              Xem lại bài học
            </CompletionButton>
            <CompletionButton $primary={true} onClick={handleContinueToLearn}>
              Tiếp tục
            </CompletionButton>
          </CompletionButtons>
        </CompletionOverlay>
      ) : (
        <>
          {consecutiveCorrect >= 3 && (
            <StreakBadge>🔥 {consecutiveCorrect} câu đúng</StreakBadge>
          )}

          <Header>
            <HeaderContent>
              <CloseButton onClick={handleClose}>✕</CloseButton>
              <ProgressBarContainer>
                <ProgressBarFill $progress={progress} />
              </ProgressBarContainer>
              <HeartsContainer $isShaking={hearts <= 1}>
                <Favorite sx={{ fontSize: 24, color: "#ef4444" }} />{" "}
                {typeof hearts === "number" ? hearts : 5}
              </HeartsContainer>
            </HeaderContent>
          </Header>

          <Container>
            <QuestionBadge $isReview={isReviewQuestion}>
              <BadgeIcon
                src={isReviewQuestion ? loopIcon : newIcon}
                alt={isReviewQuestion ? "Review" : "New"}
              />
              {isReviewQuestion ? "LỖI SAI TRƯỚC ĐÂY" : "TỪ VỰNG MỚI"}
            </QuestionBadge>

            {renderQuestion()}
          </Container>

          {!showFeedback && (
            <Footer>
              <FooterContent>
                <SkipButton onClick={handleSkip}>Bỏ qua</SkipButton>
                <CheckButton
                  disabled={
                    !question
                      ? true
                      : question.type === "match_pairs"
                      ? matchedPairs.length !==
                        question.leftColumn.length + question.rightColumn.length
                      : question.type === "translate_build"
                      ? selectedWords.length === 0
                      : !selectedAnswer
                  }
                  onClick={handleCheck}
                >
                  Kiểm tra
                </CheckButton>
              </FooterContent>
            </Footer>
          )}

          {showFeedback && (
            <FeedbackBanner $isCorrect={!isSkipped && isCorrectAnswer()}>
              <FeedbackWrapper>
                <FeedbackContent>
                  <FeedbackIconWrapper
                    $isCorrect={!isSkipped && isCorrectAnswer()}
                  >
                    {!isSkipped && isCorrectAnswer() ? (
                      <CheckmarkIcon>
                        <CheckmarkRipple />
                        <svg viewBox="0 0 52 52">
                          <path
                            className="checkmark-path"
                            d="M14 27l10 10 18-18"
                          />
                        </svg>
                        <CheckmarkParticles>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                        </CheckmarkParticles>
                      </CheckmarkIcon>
                    ) : (
                      <CrossIcon />
                    )}
                  </FeedbackIconWrapper>
                  <FeedbackTextWrapper>
                    <FeedbackTitle $isCorrect={!isSkipped && isCorrectAnswer()}>
                      {!isSkipped && isCorrectAnswer()
                        ? "Tuyệt vời!"
                        : "Đáp án đúng:"}
                    </FeedbackTitle>
                    {((!isSkipped && !isCorrectAnswer()) || isSkipped) && 
  question.type !== "speaking" && ( // ✅ THÊM: Không hiển thị cho speaking nếu pass
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
                <ContinueButton
                  $isCorrect={!isSkipped && isCorrectAnswer()}
                  onClick={handleContinue}
                >
                  Tiếp tục
                </ContinueButton>
              </FeedbackWrapper>
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
                  <ModalCloseButton onClick={handleCloseReportModal}>
                    ✕
                  </ModalCloseButton>
                </ModalHeader>
                <ModalDescription>
                  Vui lòng cho chúng tôi biết vấn đề bạn gặp phải với câu hỏi
                  này.
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
                  <ModalButton
                    $primary={true}
                    onClick={handleSubmitReport}
                    disabled={!selectedReportReason}
                  >
                    Gửi báo cáo
                  </ModalButton>
                </ModalActions>
              </ModalContent>
            </ModalOverlay>
          )}
        </>
      )}

      {showExitConfirm && (
        <ExitConfirmOverlay onClick={cancelExit}>
          <ExitConfirmBox onClick={(e) => e.stopPropagation()}>
            <SadImage src={sadGif} alt="sadGif" />
            <ExitTitle>Đợi chút, đừng đi mà!</ExitTitle>
            <ExitText>
              Bạn sẽ mất hết tiến trình của bài học này nếu thoát bây giờ
            </ExitText>
            <ExitButtons>
              <ExitBtn $success={true} onClick={cancelExit}>
                TIẾP TỤC HỌC
              </ExitBtn>
              <ExitBtn $primary={true} onClick={confirmExit}>
                THOÁT
              </ExitBtn>
            </ExitButtons>
          </ExitConfirmBox>
        </ExitConfirmOverlay>
      )}

      {showFirstTimeReminder && (
        <FirstTimeOverlay onClick={() => dismissFirstTimeReminder()}>
          <FirstTimeBox onClick={(e) => e.stopPropagation()}>
            <HeartsRow>❤️ ❤️ ❤️ ❤️ ❤️</HeartsRow>
            <ExitTitle>Mỗi lỗi sai bạn sẽ mất 1 trái tim!</ExitTitle>
            <ExitText>
              Học chăm chỉ và tập trung để bảo toàn các trái tim nhé!
            </ExitText>
            <ExitButtons style={{ marginTop: 16 }}>
              <ExitBtn $primary={true} onClick={dismissFirstTimeReminder}>
                TIẾP TỤC HỌC
              </ExitBtn>
            </ExitButtons>
          </FirstTimeBox>
        </FirstTimeOverlay>
      )}

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
                    <ReviewCardIcon>{q.isCorrect ? "✓" : "✗"}</ReviewCardIcon>
                  </ReviewCardHeader>
                  <ReviewCardContent>{getQuestionContent(q)}</ReviewCardContent>
                  {!q.isCorrect && (
                    <ReviewCardAnswer>
                      Đáp án: {getCorrectAnswerForReview(q)}
                    </ReviewCardAnswer>
                  )}
                  {hasAudio(q) && (
                    <SpeakerIconSmall
                      // ✅ Review: đọc đúng "đáp án đúng" khi bấm nút loa nhỏ (dùng speakText)
                      onClick={() => {
                        const answerText = getCorrectAnswerForReview(q);
                        speakText(answerText);
                      }}
                    >
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
              <CompletionButton $primary={true} onClick={handleContinueToLearn}>
                Tiếp tục
              </CompletionButton>
            </CompletionButtons>
          </ReviewModalContent>
        </ReviewModalOverlay>
      )}
    </PageWrapper>
  );
};

const SpeakingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
`;

const SpeakingPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: white;
  border: 3px solid #e5e7eb;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
`;

const SpeakingIcon = styled.div`
  font-size: 3rem;
`;

const SpeakingText = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const XPCard = styled(StatCard)`
  background: linear-gradient(135deg, #1CB0F6 0%, #0D9ED8 100%);
  border: none;
`;

const ResultText = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.passed ? '#047857' : '#dc2626'};
  text-align: center;
  z-index: 1;
  animation: ${fadeIn} 0.8s ease 0.4s both;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const TranscriptionComparison = styled.div`
  width: 100%;
  display: flex;
  gap: 1rem;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const TranscriptionDivider = styled.div`
  width: 2px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 1px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const PlaySampleButton = styled.button`
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #5fd3ff 0%, #1cb0f6 40%, #0d9ed8 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.6rem;
  box-shadow: 0 12px 30px rgba(13,158,216,0.25);
  position: relative;
  margin: 1.25rem auto; /* center horizontally */
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  z-index: 2;
  overflow: visible;

  &:hover:not(:disabled) {
    transform: translateY(-6px) scale(1.03);
    box-shadow: 0 18px 40px rgba(13,158,216,0.32);
  }

  &:active:not(:disabled) {
    transform: translateY(-2px) scale(0.99);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* outer subtle ring (animated) */
  &::after {
    content: '';
    position: absolute;
    inset: -14px;
    border-radius: 50%;
    border: 6px solid rgba(28,176,246,0.10);
    pointer-events: none;
    animation: ${pulseRing} 2.2s infinite;
  }

  svg {
    font-size: 32px;
  }

  @media (max-width: 768px) {
    width: 88px;
    height: 88px;
    font-size: 1.25rem;

    &::after {
      inset: -10px;
      border-width: 5px;
    }

    svg {
      font-size: 24px;
    }
  }
`;

const MicContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  min-height: 120px; // ✅ Giảm từ 200px xuống 120px vì button nhỏ hơn
  justify-content: center;
`;

const MicButton = styled.button`
  width: 70px; // ✅ Thay đổi từ 120px thành 160px như CheckButton
  height: 70px; // ✅ Thay đổi từ 120px thành 60px để thành rectangle
  border-radius: 16px; // ✅ Giống CheckButton (16px)
  border: none;
  background: ${props => props.recording 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    : 'linear-gradient(135deg, #53e236ff 0%, #53e236ff 100%)'
  };
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem; // ✅ Thêm gap cho icon và text
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.recording 
    ? '0 4px 0 #dc2626' // ✅ Thêm shadow dưới giống CheckButton
    : '0 4px 0 #53e236ff'
  };
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    transform: translateY(-2px); // ✅ Giống CheckButton hover
    box-shadow: ${props => props.recording 
      ? '0 6px 0 #dc2626'
      : '0 6px 0 #53e236ff'
    };
  }

  &:active {
    transform: translateY(2px); // ✅ Giống CheckButton active
    box-shadow: ${props => props.recording 
      ? '0 2px 0 #dc2626'
      : '0 2px 0 #53e236ff'
    };
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    width: 100%; // ✅ Responsive như CheckButton
    padding: 1rem 2rem;
    font-size: 1rem;
    min-width: unset;
  }
`;

const WaveformAnimation = styled.div`
  position: absolute;
  bottom: -30px;
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 20px;
`;

const WaveDot = styled.div`
  width: 4px;
  background: #ef4444;
  border-radius: 2px;
  animation: wave 0.6s ease-in-out infinite;
  animation-delay: ${props => props.delay};

  @keyframes wave {
    0%, 100% {
      height: 4px;
    }
    50% {
      height: 20px;
    }
  }
`;

const MicHint = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.recording ? '#ef4444' : '#6b7280'};
  text-align: center;
`;

const AnalyzingSpinner = styled.div`
  width: 60px;
  height: 60x;
  border: 8px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const AudioPlayback = styled.div`
  width: 100%;
  max-width: 400px;

  audio {
    width: 100%;
    height: 48px;
    border-radius: 12px;
  }
`;
const SpeakingResult = styled.div`
  width: 100%;
  padding: 2.5rem;
  background: ${props => props.passed 
    ? 'linear-gradient(135deg, #d7ffb8 0%, #b8f0a0 50%, #a8e6a0 100%)'
    : 'linear-gradient(135deg, #ffe0e0 0%, #ffd0d0 50%, #ffc0c0 100%)'
  };
  border: 4px solid ${props => props.passed ? '#58CC02' : '#ef4444'};
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: ${scaleIn} 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;

  /* Subtle pattern overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.passed 
      ? 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)'
      : 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)'
    };
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    gap: 1.25rem;
  }
`;
const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;



const ResultEmoji = styled.div`
  font-size: 5rem;
  animation: ${bounce} 0.8s ease;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    font-size: 4rem;
    width: 100px;
    height: 100px;
  }
`;

const ResultScoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;




const ResultScore = styled.div`
  font-size: 4rem;
  font-weight: 800;
  color: ${props => props.passed ? '#58CC02' : '#ef4444'};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  animation: ${scaleIn} 0.8s ease 0.2s both;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;


const ResultScoreLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ScoreProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
`;

const ScoreProgressFill = styled.div`
  height: 100%;
  width: ${props => props.score}%;
  background: ${props => props.passed 
    ? 'linear-gradient(90deg, #58CC02 0%, #46A302 100%)'
    : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
  };
  border-radius: 20px;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    animation: shimmer 2s ease-in-out infinite;
  }
`;

const TranscriptionBox = styled.div`
  width: 100%;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  margin-top: 1rem;
`;

const TranscriptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const TranscriptionIcon = styled.div`
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const TranscriptionLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const TranscriptionText = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;
const InstructionText = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  background: #f3f4f6;
  border-radius: 12px;
  border-left: 4px solid #1cb0f6;

  strong {
    color: #1cb0f6;
  }

  @media (max-width: 768px) {
    font-size: 1.125rem;
    padding: 0.875rem 1.25rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;


const ImprovementTips = styled.div`
  width: 100%;
  padding: 1.25rem;
  background: rgba(255, 193, 7, 0.1);
  border: 2px solid #f59e0b;
  border-radius: 16px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  z-index: 1;
  animation: ${slideInFromBottom} 0.6s ease 0.6s both;

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 0.5rem;
  }
`;

const TipsIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.125rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const TipsText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #92400e;
  line-height: 1.5;

  strong {
    color: #f59e0b;
  }

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const RetryButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #4b5563;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
  }
`;

const AnalyzeButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: #58cc02;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 0 #46a302;

  &:hover {
    background: #46a302;
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #46a302;
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #46a302;
  }

  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
  }
`;

const AnalyzingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
`;
const MatchPairsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const PairColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const PairCard = styled.button`
  background: white;
  border: 3px solid
    ${(props) => {
      if (props.$matched) return "#58CC02";
      if (props.$selected) return "#1CB0F6";
      return "#e5e7eb";
    }};
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  box-shadow: ${(props) => {
    if (props.$matched) return "0 6px 20px rgba(88,204,2,0.3)";
    if (props.$selected && !props.$matched)
      return "0 6px 20px rgba(239,68,68,0.3)";
    return "0 2px 8px rgba(0, 0, 0, 0.06)";
  }};
  opacity: ${(props) => (props.$matched ? 0.7 : 1)};

  &:hover:not(:disabled) {
    border-color: ${(props) => (props.$matched ? "#58CC02" : "#1CB0F6")};
    transform: ${(props) => (props.disabled ? "none" : "translateY(-2px)")};
  }

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
    font-size: 1rem;
  }
`;

const PairNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${(props) => (props.$matched ? "#58CC02" : "#f3f4f6")};
  color: ${(props) => (props.$matched ? "white" : "#6b7280")};
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
  position: absolute;
  right: 1rem;
  color: #58cc02;
  font-size: 1.5rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    right: 0.75rem;
  }
`;

// Thêm styled components cho Report Modal
const ReportLink = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &:hover {
    color: #ef4444;
  }

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const ReportIcon = styled.img`
  width: 18px;
  height: 18px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 16px;
    height: 16px;
  }
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #58cc02;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 600px;
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

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ModalCloseButton = styled.button`
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

const ModalDescription = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const ReportOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const ReportOption = styled.button`
  background: ${(props) => (props.selected ? "#EBF8FF" : "white")};
  border: 2px solid ${(props) => (props.selected ? "#1CB0F6" : "#e5e7eb")};
  color: #1f2937;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;

  &:hover {
    border-color: #1cb0f6;
    background: #ebf8ff;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    font-size: 0.9375rem;
  }
`;

const TextAreaWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const TextAreaLabel = styled.label`
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #1cb0f6;
    background: #ebf8ff;
  }

  &::placeholder {
    color: #9ca3af;
  }

  @media (max-width: 768px) {
    font-size: 0.9375rem;
    min-height: 80px;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const QuestionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }
`;

const LinhThuTiniImage = styled.img`
  width: 110px;
  height: 110px;
  object-fit: contain;
  flex-shrink: 0;
  display: block;

  @media (max-width: 768px) {
    width: 96px;
    height: 96px;
  }
`;

const ModalButton = styled.button`
  background: ${(props) => (props.$primary ? "#1CB0F6" : "white")};
  border: 2px solid ${(props) => (props.$primary ? "#1CB0F6" : "#e5e7eb")};
  color: ${(props) => (props.$primary ? "white" : "#6b7280")};
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${(props) =>
      props.$primary ? "0 4px 0 #46A302" : "0 2px 6px rgba(0,0,0,0.06)"};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${(props) => (props.$primary ? "0 2px 0 #46A302" : "none")};
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
    min-width: unset;
  }
`;

// Add new styled components near other styled components
const QuestionWithCharacterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 900px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }
`;
const ExitConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
`;
const ExitConfirmBox = styled.div`
  background: #fff;
  border-radius: 14px;
  padding: 2rem;
  width: 520px;
  max-width: calc(100% - 32px);
  text-align: center;
`;
const ExitTitle = styled.h3`
  margin: 0.5rem 0 1rem;
  font-size: 1.25rem;
  color: #111827;
`;
const ExitText = styled.p`
  color: #374151;
  margin: 0 0 1.25rem;
`;
const ExitButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 1rem;
`;
const ExitBtn = styled.button`
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  background: ${(p) =>
    p.$primary ? "#1CB0F6" : p.$success ? "#58CC02" : "white"};
  color: ${(p) => (p.$primary || p.$success ? "white" : "#6b7280")};
  box-shadow: ${(p) =>
    p.$primary
      ? "0 6px 0 #0fa0d6"
      : p.$success
      ? "0 6px 0 #3f8e1f"
      : "0 2px 6px rgba(0,0,0,0.06)"};
`;
const FirstTimeOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;
`;
const FirstTimeBox = styled.div`
  background: #fff;
  border-radius: 14px;
  padding: 2rem;
  width: 520px;
  max-width: calc(100% - 32px);
  text-align: center;
`;
const HeartsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 1.25rem;
`;
const SadImage = styled.img`
  width: 140px;
  height: 140px;
  object-fit: contain;
  display: block;
  margin: 0 auto 0.75rem;
`;
const InputContainer = styled.div`
  margin-bottom: 2rem;
`;

const InputLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const InputField = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  border: 3px solid ${(props) => (props.disabled ? "#e5e7eb" : "#1CB0F6")};
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #1cb0f6;
    box-shadow: 0 0 0 3px rgba(28, 176, 246, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }

  @media (max-width: 768px) {
    font-size: 0.9375rem;
    padding: 0.875rem 1.25rem;
  }
`;

export default Lesson;