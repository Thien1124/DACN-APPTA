import React, { useState } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import TeacherLayout from '../layouts/TeacherLayout';

// ========== STYLED COMPONENTS ==========

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ControlBar = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
`;

const DateInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
`;

const SaveButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
`;

const AttendanceGrid = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StudentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StudentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  }
`;

const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StudentAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: ${props => props.color || 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const StudentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StudentName = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const StudentClass = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const AttendanceButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AttendanceButton = styled.button`
  padding: 0.5rem 1.5rem;
  border-radius: 10px;
  border: 2px solid ${props => {
    if (props.active && props.status === 'present') return '#10b981';
    if (props.active && props.status === 'absent') return '#ef4444';
    if (props.active && props.status === 'late') return '#f59e0b';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  background: ${props => {
    if (props.active && props.status === 'present') return 'rgba(16, 185, 129, 0.1)';
    if (props.active && props.status === 'absent') return 'rgba(239, 68, 68, 0.1)';
    if (props.active && props.status === 'late') return 'rgba(245, 158, 11, 0.1)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.active && props.status === 'present') return '#10b981';
    if (props.active && props.status === 'absent') return '#ef4444';
    if (props.active && props.status === 'late') return '#f59e0b';
    return props.theme === 'dark' ? '#9ca3af' : '#6b7280';
  }};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.875rem;

  &:hover {
    transform: scale(1.05);
  }
`;

const SummaryCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.div`
  text-align: center;
  padding: 1rem;
  border-radius: 12px;
  background: ${props => props.color}22;
`;

const SummaryValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color};
  margin-bottom: 0.5rem;
`;

const SummaryLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

// ========== MOCK DATA ==========

const mockStudents = [
  {
    id: 1,
    name: 'Nguyen Van A',
    class: 'TOEIC Basic',
    avatar: '👨',
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
    attendance: 'present'
  },
  {
    id: 2,
    name: 'Tran Thi B',
    class: 'TOEIC Basic',
    avatar: '👩',
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
    attendance: 'present'
  },
  {
    id: 3,
    name: 'Le Van C',
    class: 'TOEIC Basic',
    avatar: '🧑',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    attendance: null
  },
];

// ========== COMPONENT ==========

const TeacherAttendance = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [students, setStudents] = useState(mockStudents);
  const [selectedClass, setSelectedClass] = useState('TOEIC Basic');
  const [selectedDate, setSelectedDate] = useState('2025-10-09');

  const summary = {
    present: students.filter(s => s.attendance === 'present').length,
    absent: students.filter(s => s.attendance === 'absent').length,
    late: students.filter(s => s.attendance === 'late').length,
  };

  const handleAttendance = (studentId, status) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, attendance: s.attendance === status ? null : status } : s
    ));
  };

  const handleSave = () => {
    Swal.fire({
      icon: 'success',
      title: 'Đã lưu!',
      text: 'Điểm danh đã được lưu thành công',
      confirmButtonColor: '#8b5cf6',
    });
  };

  return (
    <TeacherLayout pageTitle="📋 Điểm danh">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Control Bar */}
        <ControlBar theme={theme}>
          <FilterGroup>
            <FilterSelect
              theme={theme}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="TOEIC Basic">TOEIC Basic</option>
              <option value="Business English">Business English</option>
              <option value="IELTS Speaking">IELTS Speaking</option>
            </FilterSelect>
            
            <DateInput
              theme={theme}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </FilterGroup>
          
          <SaveButton onClick={handleSave}>
            <span>💾</span>
            Lưu điểm danh
          </SaveButton>
        </ControlBar>

        {/* Summary */}
        <SummaryCard theme={theme}>
          <SummaryItem color="#10b981">
            <SummaryValue color="#10b981">{summary.present}</SummaryValue>
            <SummaryLabel theme={theme}>Có mặt</SummaryLabel>
          </SummaryItem>
          <SummaryItem color="#ef4444">
            <SummaryValue color="#ef4444">{summary.absent}</SummaryValue>
            <SummaryLabel theme={theme}>Vắng</SummaryLabel>
          </SummaryItem>
          <SummaryItem color="#f59e0b">
            <SummaryValue color="#f59e0b">{summary.late}</SummaryValue>
            <SummaryLabel theme={theme}>Muộn</SummaryLabel>
          </SummaryItem>
        </SummaryCard>

        {/* Attendance Grid */}
        <AttendanceGrid theme={theme}>
          <SectionTitle theme={theme}>
            <span>👥</span>
            Danh sách học viên
          </SectionTitle>
          <StudentList>
            {students.map(student => (
              <StudentItem key={student.id} theme={theme}>
                <StudentInfo>
                  <StudentAvatar color={student.color}>
                    {student.avatar}
                  </StudentAvatar>
                  <StudentDetails>
                    <StudentName theme={theme}>{student.name}</StudentName>
                    <StudentClass theme={theme}>{student.class}</StudentClass>
                  </StudentDetails>
                </StudentInfo>
                <AttendanceButtons>
                  <AttendanceButton
                    theme={theme}
                    status="present"
                    active={student.attendance === 'present'}
                    onClick={() => handleAttendance(student.id, 'present')}
                  >
                    ✅ Có mặt
                  </AttendanceButton>
                  <AttendanceButton
                    theme={theme}
                    status="absent"
                    active={student.attendance === 'absent'}
                    onClick={() => handleAttendance(student.id, 'absent')}
                  >
                    ❌ Vắng
                  </AttendanceButton>
                  <AttendanceButton
                    theme={theme}
                    status="late"
                    active={student.attendance === 'late'}
                    onClick={() => handleAttendance(student.id, 'late')}
                  >
                    ⏰ Muộn
                  </AttendanceButton>
                </AttendanceButtons>
              </StudentItem>
            ))}
          </StudentList>
        </AttendanceGrid>
      </PageContainer>
    </TeacherLayout>
  );
};

export default TeacherAttendance;