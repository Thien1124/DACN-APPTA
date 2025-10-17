import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";

// Import icons/images
import bronzeMedal from "../assets/bronze-medal.png";
import silverMedal from "../assets/silver-medal.png";
import goldMedal from "../assets/gold-medal.png";

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f7f7f7;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 260px;
  margin-right: 350px;
  padding: 2rem;
  animation: ${fadeIn} 0.6s ease;
  min-width: 0;

  @media (max-width: 1400px) {
    margin-right: 300px;
  }

  @media (max-width: 1200px) {
    margin-right: 0;
  }

  @media (max-width: 1024px) {
    margin-left: 220px;
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    max-width: 100%;
  }
`;

const LeaderboardSection = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }
`;

const LeagueHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LeagueIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const LeagueIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)"
      : "#e5e7eb"};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${(props) =>
    props.active ? "0 8px 20px rgba(255, 107, 107, 0.4)" : "none"};
  animation: ${(props) => (props.active ? pulse : "none")} 2s ease-in-out
    infinite;
  position: relative;
  overflow: hidden;

  img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    filter: ${(props) =>
      props.locked ? "grayscale(100%) brightness(1.5)" : "none"};
    opacity: ${(props) => (props.locked ? 0.5 : 1)};
  }

  &::after {
    content: "${(props) => props.badge}";
    position: absolute;
    top: -8px;
    right: -8px;
    background: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;

    img {
      width: 36px;
      height: 36px;
    }
  }
`;

const LeagueTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const LeagueSubtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;

  span {
    color: #fbbf24;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const RankingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RankingItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${(props) => (props.isCurrentUser ? "#f0f9ff" : "white")};
  border: 2px solid ${(props) => (props.isCurrentUser ? "#1CB0F6" : "#e5e7eb")};
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }
`;

const Rank = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${(props) => {
    if (props.rank === 1)
      return "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)";
    if (props.rank === 2)
      return "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)";
    if (props.rank === 3)
      return "linear-gradient(135deg, #cd7f32 0%, #b87333 100%)";
    return "#e5e7eb";
  }};
  color: ${(props) => (props.rank <= 3 ? "white" : "#6b7280")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid ${(props) => (props.isCurrentUser ? "#1CB0F6" : "#e5e7eb")};
  background: ${(props) => (props.isCurrentUser ? "#1CB0F6" : "#f3f4f6")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${(props) => (props.isCurrentUser ? "white" : "#6b7280")};
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    font-size: 1.125rem;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const UserBadge = styled.span`
  font-size: 0.875rem;
  color: #f59e0b;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const XPCount = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const PromotionBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #58cc02;
  border-radius: 16px;
  margin: 1.5rem 0;
  color: #58cc02;
  font-weight: 700;
  font-size: 1.125rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 1.25rem;
  }
`;

const MedalIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: -1rem;
  margin-bottom: 1.5rem;
  position: relative;
  height: 80px;

  @media (max-width: 768px) {
    height: 64px;
  }
`;

const MedalIcon = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: ${(props) =>
    props.locked ? "grayscale(100%) brightness(1.2)" : "none"};
  opacity: ${(props) => (props.locked ? 0.4 : 1)};
  position: absolute;

  &:nth-child(1) {
    left: 20%;
    transform: rotate(-15deg)
      ${(props) => (props.locked ? "scale(0.9)" : "scale(1)")};
  }

  &:nth-child(2) {
    left: 50%;
    transform: translateX(-50%)
      ${(props) => (props.locked ? "scale(0.9)" : "scale(1.1)")};
    z-index: 2;
  }

  &:nth-child(3) {
    right: 20%;
    transform: rotate(15deg)
      ${(props) => (props.locked ? "scale(0.9)" : "scale(1)")};
  }

  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
  }
`;

const UnlockTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${(props) => (props.locked ? "#9ca3af" : "#1f2937")};
  margin: 0 0 0.5rem 0;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const UnlockDescription = styled.p`
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const StartButton = styled.button`
  background: ${(props) =>
    props.disabled
      ? "#e5e7eb"
      : "linear-gradient(135deg, #1CB0F6 0%, #0d9ed8 100%)"};
  border: none;
  color: ${(props) => (props.disabled ? "#9ca3af" : "white")};
  padding: 1rem 2rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 100%;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(28, 176, 246, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
  }
`;

const SkeletonItem = styled.div`
  height: 72px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 16px;

  @media (max-width: 768px) {
    height: 64px;
  }
`;

// ========== COMPONENT ==========
const Leaderboard = () => {
  const navigate = useNavigate();
  const [completedLessons, setCompletedLessons] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Mock data
  const leaderboardData = [
    { rank: 1, name: "yakuruto1234", xp: 474, badge: "🔥" },
    { rank: 2, name: "Sophia", xp: 326, badge: "" },
    { rank: 3, name: "あき", xp: 217, badge: "" },
    { rank: 4, name: "ひょうた", xp: 212, badge: "🚀" },
    { rank: 5, name: "どりんご", xp: 199, badge: "" },
  ];

  const bottomRankings = [
    { rank: 6, name: "Shinn", xp: 176, badge: "" },
    { rank: 7, name: "こんこ", xp: 173, badge: "🔥", years: 2 },
    { rank: 8, name: "기언", xp: 168, badge: "🔥", years: 1 },
  ];

  useEffect(() => {
    const completed = parseInt(localStorage.getItem("completedLessons") || "0");
    setCompletedLessons(completed);
    setIsUnlocked(true); // Đổi thành: completed >= 8 khi cần kiểm tra thực tế
  }, []);

  const handleStartLeague = () => {
    if (isUnlocked) {
      navigate("/learn");
    }
  };

  return (
    <PageWrapper>
      <LeftSidebar />
      <MainContent>
        <Container>
          <LeaderboardSection>
            {isUnlocked ? (
              <>
                <LeagueHeader>
                  <LeagueIcons>
                    <LeagueIcon badge="🛡️" locked>
                      <img src={bronzeMedal} alt="Bronze League" />
                    </LeagueIcon>
                    <LeagueIcon badge="🥈" locked>
                      <img src={silverMedal} alt="Silver League" />
                    </LeagueIcon>
                    <LeagueIcon badge="🥇" active>
                      <img src={goldMedal} alt="Gold League" />
                    </LeagueIcon>
                  </LeagueIcons>
                  <LeagueTitle>Giải đấu Hồng Ngọc</LeagueTitle>
                  <LeagueSubtitle>
                    Bạn sẽ được thăng hạng giải đấu khi lọt top 5{" "}
                    <span>2 ngày</span>
                  </LeagueSubtitle>
                </LeagueHeader>

                <RankingList>
                  {leaderboardData.map((user, index) => (
                    <RankingItem key={index} isCurrentUser={index === 0}>
                      <Rank rank={user.rank}>{user.rank}</Rank>
                      <UserAvatar isCurrentUser={index === 0}>
                        {user.name.charAt(0).toUpperCase()}
                      </UserAvatar>
                      <UserInfo>
                        <UserName>
                          {user.name}
                          {user.badge && <UserBadge>{user.badge}</UserBadge>}
                        </UserName>
                      </UserInfo>
                      <XPCount>{user.xp} KN</XPCount>
                    </RankingItem>
                  ))}
                </RankingList>

                <PromotionBanner>
                  <span>NHÓM THĂNG HẠNG</span>
                </PromotionBanner>

                <RankingList>
                  {bottomRankings.map((user, index) => (
                    <RankingItem key={index}>
                      <Rank rank={user.rank}>{user.rank}</Rank>
                      <UserAvatar>
                        {user.name.charAt(0).toUpperCase()}
                      </UserAvatar>
                      <UserInfo>
                        <UserName>
                          {user.name}
                          {user.years && (
                            <UserBadge>🔥 hơn {user.years} năm</UserBadge>
                          )}
                        </UserName>
                      </UserInfo>
                      <XPCount>{user.xp} KN</XPCount>
                    </RankingItem>
                  ))}
                </RankingList>
              </>
            ) : (
              <>
                <LeagueHeader>
                  <MedalIcons>
                    <MedalIcon src={bronzeMedal} alt="Bronze" locked />
                    <MedalIcon src={goldMedal} alt="Gold" locked />
                    <MedalIcon src={silverMedal} alt="Silver" locked />
                  </MedalIcons>
                  <UnlockTitle locked>Mở khóa Bảng xếp hạng!</UnlockTitle>
                  <UnlockDescription>
                    Hoàn thành thêm {8 - completedLessons} bài học để bắt đầu
                    thi đua với những người học khác trên bảng xếp hạng hàng
                    tuần
                  </UnlockDescription>
                  <StartButton
                    disabled={!isUnlocked}
                    onClick={handleStartLeague}
                  >
                    Bắt đầu học
                  </StartButton>
                </LeagueHeader>

                <RankingList>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
                    <SkeletonItem key={index} />
                  ))}
                </RankingList>
              </>
            )}
          </LeaderboardSection>
        </Container>
      </MainContent>
      <RightSidebar />
    </PageWrapper>
  );
};

export default Leaderboard;
