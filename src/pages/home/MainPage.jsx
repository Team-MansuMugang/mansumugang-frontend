import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import SubTitle from '../../components/SubTitle';
import SmallVoiceMessageItem from '../../components/SmallVoiceMessageItem';
import RowScrollContainer from '../../components/RowScrollContainer';
import NavBar from '../../components/NavBar';
import BorderContainer from '../../components/BorderContainer';
import ScheduleListContainer from '../../components/ScheduleListContainer';
import ScheduleItem from '../../components/ScheduleItem';
import ItemSelector from '../../components/ItemSelector';
import fetchPatientList from '../../apis/api/fetchPatientList';
import medicineInfoRetrieval from '../../apis/api/medicineInfoRetrieval';
import FloatingActionButton from '../../components/FloatingActionButton';
import fetchAllPatientVocieMessageList from '../../apis/api/fetchAllPatientVocieMessageList';

const MainPage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [voiceMessages, setVoiceMessages] = useState([]);
  const [medicineSchedules, setMedicineSchedules] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const patientList = await fetchPatientList();
        setPatients(patientList);
      } catch (error) {
        console.error('Failed to load patients:', error);
      }
    };

    const loadAllPatientVocieMessages = async () => {
      try {
        const voiceMessages = await fetchAllPatientVocieMessageList();
        setVoiceMessages(voiceMessages);
      } catch (error) {
        if (error instanceof UserRecordInfoNotFoundError) {
          setVoiceMessages([]);
        } else {
          console.error('Failed to load all patient voice messages:', error);
        }
      }
    };

    loadPatients();

    loadAllPatientVocieMessages();
  }, []);

  useEffect(() => {
    if (patients.length > 0) {
      handleSelectPatient(0);
    }
  }, [patients]);

  const handleSelectPatient = async (patientIndex) => {
    if (patientIndex < 0 || patientIndex >= patients.length) return;

    const selectedPatientId = patients[patientIndex].patientId;
    setSelectedPatient(patientIndex);

    try {
      const result = await medicineInfoRetrieval({ patientId: selectedPatientId });
      setMedicineSchedules(result.medicineSchedules);
    } catch (error) {
      console.error('Failed to retrieve medicine schedule:', error);
    }
  };

  const renderScheduleItems = (schedule) => {
    if (schedule.medicines.length > 0) {
      return schedule.medicines.map((medicine) => (
        <ScheduleItem
          key={medicine.medicineId}
          status={medicine.status === 'TAKEN' ? 'checked' : 'unchecked'}
          title={medicine.medicineName}
          data={medicine.hospitalName || ''}
        />
      ));
    }

    return (
      <ScheduleItem
        status={schedule.hospital?.status ? 'checked' : 'unchecked'}
        title={schedule.hospital?.hospitalName || '병원'}
        data={schedule.hospital?.hospitalAddress || ''}
      />
    );
  };

  return (
    <div className="main-page">
      <h1>홈</h1>

      <SubTitle title="음성 메세지" linkTo="/voice-message" />

      <RowScrollContainer>
        {voiceMessages.map((voiceMessage, index) => (
          <SmallVoiceMessageItem
            key={index}
            profileImage={'https://picsum.photos/200/300'}
            name={voiceMessage.name}
            time={voiceMessage.uploadedTime}
            onClick={() => navigate('/voice-message/detail', { state: voiceMessage })}
          />
        ))}
      </RowScrollContainer>

      <hr />

      <ItemSelector
        items={patients.map((patient) => patient.patientName)}
        onSelect={handleSelectPatient}
      />

      <SubTitle title="일정" linkTo="/schedule" />
      <BorderContainer>
        {medicineSchedules.map((schedule) => (
          <ScheduleListContainer key={schedule.time} time={schedule.time}>
            {renderScheduleItems(schedule)}
          </ScheduleListContainer>
        ))}
      </BorderContainer>

      <SubTitle title="현재 위치" showButton={false} />
      <div style={{ backgroundColor: 'red', width: '100%', height: '100px' }}>구현중</div>

      <NavBar activeTab="홈" />
      <FloatingActionButton
        items={[
          { title: '약 일정 추가하기', url: '/schedule/medicine-add' },
          { title: '병원 일정 추가하기', url: '/schedule/hospital-add' },
        ]}
      />
    </div>
  );
};

export default MainPage;
