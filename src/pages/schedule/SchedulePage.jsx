// React 및 Router 관련
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// CSS 스타일링
import './SchedulePage.css';

// 사용자 정의 컴포넌트
import Calendar from '../../components/Calendar';
import BorderContainer from '../../components/BorderContainer';
import ScheduleItem from '../../components/ScheduleItem';
import ScheduleListContainer from '../../components/ScheduleListContainer';
import SubTitle from '../../components/SubTitle';
import MedicineDetailCard from '../../components/MedicineDetailCard';
import HospitalDetailCard from '../../components/HospitalDetailCard';

// API 호출
import fetchPatientList from '../../apis/api/fetchPatientList';
import medicineInfoRetrieval from '../../apis/api/medicineInfoRetrieval';
import renewRefreshToken from '../../apis/api/renewRefreshToken';
import medicineDetailRetrieval from '../../apis/api/medicineDetailRetrieval';
import hospitalDetailRetrieval from '../../apis/api/hospitalDetailRetrieval';

// 에러 처리
import { NotValidAccessTokenError, ExpiredAccessTokenError } from '../../apis/utility/errors';

const SchedulePage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicineSchedules, setMedicineSchedules] = useState([]);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [detailType, setDetailType] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0],
  );

  useEffect(() => {
    const fetchAndSetPatientList = async () => {
      try {
        const patientList = await fetchPatientList();
        setPatients(patientList.patients);
        const patientIndex = patientList.patients.findIndex(
          (patient) => patient.patientId === Number(params.patientId),
        );
        setSelectedPatient(patientIndex);
      } catch (error) {
        if (error instanceof ExpiredAccessTokenError) {
          try {
            await renewRefreshToken();
            fetchAndSetPatientList();
          } catch (error) {
            navigate('/');
          }
        } else if (error instanceof NotValidAccessTokenError) navigate('/');
      }
    };

    fetchAndSetPatientList();
  }, []);

  useEffect(() => {
    if (patients.length > 0) selectPatientAndFetchMedicineInfo(selectedPatient);
  }, [patients, selectedDate]);

  const selectPatientAndFetchMedicineInfo = async (patientIndex) => {
    if (patientIndex < 0 || patientIndex >= patients.length) return;

    const selectedPatientId = patients[patientIndex].patientId;
    setSelectedPatient(patientIndex);

    try {
      const result = await medicineInfoRetrieval({
        patientId: selectedPatientId,
        date: selectedDate,
      });
      setMedicineSchedules(result.medicineSchedules);
    } catch (error) {
      if (error instanceof ExpiredAccessTokenError) {
        try {
          await renewRefreshToken();
          medicineInfoRetrieval();
        } catch (error) {
          navigate('/');
        }
      } else if (error instanceof NotValidAccessTokenError) navigate('/');
    }
  };

  const generateScheduleItems = (schedule) => {
    const items = [];

    if (schedule.medicines.length > 0) {
      schedule.medicines.forEach((medicine) => {
        items.push(
          <ScheduleItem
            key={medicine.medicineId}
            status={medicine.status === 'TAKEN' ? 'checked' : 'unchecked'}
            title={medicine.medicineName}
            data={medicine.hospitalName || ''}
            onClick={() =>
              displayDetailOverlay('medicine', medicine.medicineId, schedule.time, medicine.status)
            }
          />,
        );
      });
    }

    if (schedule.hospital) {
      items.push(
        <ScheduleItem
          key={schedule.hospital.hospitalId}
          status={schedule.hospital.status ? 'checked' : 'unchecked'}
          title={schedule.hospital.hospitalName || '병원'}
          data={schedule.hospital.hospitalAddress || ''}
          onClick={() =>
            displayDetailOverlay(
              'hospital',
              schedule.hospital.hospitalId,
              schedule.time,
              schedule.hospital.status,
            )
          }
        />,
      );
    }

    return items;
  };

  const fetchAndSetDetailData = async (type, id, thisTime, thisStatus) => {
    try {
      let result;
      if (type === 'medicine') result = await medicineDetailRetrieval(id);
      if (type === 'hospital') result = await hospitalDetailRetrieval(id);
      setDetailData({ ...result, thisTime, thisStatus });
    } catch (error) {
      if (error instanceof ExpiredAccessTokenError) {
        try {
          await renewRefreshToken();
          fetchAndSetDetailData(type, id, thisTime, thisStatus);
        } catch (error) {
          navigate('/');
        }
      } else if (error instanceof NotValidAccessTokenError) navigate('/');
    }
  };

  const handleDateSelection = (date) => {
    setSelectedDate(date);
  };

  const displayDetailOverlay = (type, Id, thisTime, thisStatus) => {
    setDetailType(type);
    setOverlayVisible(true);
    fetchAndSetDetailData(type, Id, thisTime, thisStatus);
  };

  const hideDetailOverlay = (event) => {
    if (event.target.className.includes('schedule-page-overlay')) {
      setOverlayVisible(false);
      setDetailType('');
    }
  };

  return (
    <>
      <Calendar backUrl="/home" onSelect={handleDateSelection} />
      <div className="schedule-page">
        <hr />
        <SubTitle
          showButton={false}
          title={`${patients[selectedPatient]?.patientName}님의 ${
            new Date(selectedDate).getMonth() + 1
          }월 ${new Date(selectedDate).getDate()}일 일정`}
        />
        <BorderContainer>
          {medicineSchedules.length > 0 ? (
            medicineSchedules.map((schedule) => (
              <ScheduleListContainer
                key={schedule.time}
                time={`${schedule.time.split(':')[0] < 12 ? '오전' : '오후'} ${schedule.time.split(':')[0] % 12 || 12}시 ${schedule.time.split(':')[1]}분`}
              >
                {generateScheduleItems(schedule)}
              </ScheduleListContainer>
            ))
          ) : (
            <p>해당 날짜에 일정이 없습니다.</p>
          )}
        </BorderContainer>
      </div>
      <div
        className={`schedule-page-overlay ${isOverlayVisible ? 'show' : ''}`}
        onClick={hideDetailOverlay}
      >
        {detailType === 'medicine' && (
          <MedicineDetailCard
            editLink={`/schedule/medicine-edit/${detailData.patientId}/${detailData.medicineId}`}
            medicineName={detailData.medicineName}
            hospitalName={detailData.hospitalName}
            medicineDescription={detailData.medicineDescription}
            medicineIntakeTime={detailData.thisTime}
            medicineIntakeDays={detailData.medicineIntakeDays}
            medicineImage={detailData.medicineImage}
            status={detailData.thisStatus === 'TAKEN' ? 'checked' : 'unchecked'}
          />
        )}
        {detailType === 'hospital' && (
          <HospitalDetailCard
            editLink={`/schedule/hospital-edit/${detailData.patientId}/${detailData.hospitalId}`}
            hospitalName={detailData.hospitalName}
            hospitalAddress={detailData.hospitalAddress}
            hospitalDescription={detailData.medicineDescription}
            hospitalVisitingDate={new Date(detailData.hospitalVisitingTime).toLocaleDateString(
              'ko-KR',
              { month: 'long', day: 'numeric' },
            )}
            hospitalVisitingTime={detailData.thisTime}
          />
        )}
      </div>
    </>
  );
};

export default SchedulePage;
