// React 및 Router 관련
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import useInterval from '../../hooks/useInterval';

// CSS 스타일링 및 아이콘
import './MainPage.css';
import LocationOnIcon from '../../assets/svg/location-on.svg?react';

// 사용자 정의 컴포넌트
import SubTitle from '../../components/SubTitle';
import SmallVoiceMessageItem from '../../components/SmallVoiceMessageItem';
import RowScrollContainer from '../../components/RowScrollContainer';
import NavBar from '../../components/NavBar';
import BorderContainer from '../../components/BorderContainer';
import ScheduleListContainer from '../../components/ScheduleListContainer';
import ScheduleItem from '../../components/ScheduleItem';
import ItemSelector from '../../components/ItemSelector';
import MedicineDetailCard from '../../components/MedicineDetailCard';
import HospitalDetailCard from '../../components/HospitalDetailCard';
import FloatingActionButton from '../../components/FloatingActionButton';
import BigButton from '../../components/BigButton';

// API 호출
import fetchPatientList from '../../apis/api/fetchPatientList';
import medicineInfoRetrieval from '../../apis/api/medicineInfoRetrieval';
import fetchAllPatientVocieMessageList from '../../apis/api/fetchAllPatientVocieMessageList';
import renewRefreshToken from '../../apis/api/renewRefreshToken';
import medicineDetailRetrieval from '../../apis/api/medicineDetailRetrieval';
import hospitalDetailRetrieval from '../../apis/api/hospitalDetailRetrieval';
import fetchPatientLatestLocation from '../../apis/api/fetchPatientLatestLocation';

// 에러 처리
import {
  NotValidAccessTokenError,
  ExpiredAccessTokenError,
  UserRecordInfoNotFoundError,
  AccessDeniedError,
  UserNotFoundError,
} from '../../apis/utility/errors';

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseConfig, vapidKey } from '../../../config';
import submitFcmToken from '../../apis/api/submitFcmToken';

// 아이콘
import DrugsIcon from '../../assets/svg/drugs.svg?react';
import LocalHospitalIcon from '../../assets/svg/local-hospital.svg?react';

const MainPage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(0);
  const [isPatientNull, setIsPatientNull] = useState(undefined);
  const [voiceMessages, setVoiceMessages] = useState(null);
  const [medicineSchedules, setMedicineSchedules] = useState([]);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [detailType, setDetailType] = useState('');
  const [latLng, setLatLng] = useState({ lat: 35.86224780000001, lng: 129.195123 });
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  const loadPatientLatestLocation = async () => {
    try {
      const patientLocation = await fetchPatientLatestLocation(patients[selectedPatient].patientId);
      setLatLng({ lat: patientLocation.latitude, lng: patientLocation.longitude });

      let geocoder = new kakao.maps.services.Geocoder();
      let coord = new kakao.maps.LatLng(patientLocation.latitude, patientLocation.longitude);

      geocoder.coord2Address(coord.getLng(), coord.getLat(), (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          setAddress(result[0].address.address_name);
        }
      });
    } catch (error) {
      if (error instanceof ExpiredAccessTokenError) {
        try {
          await renewRefreshToken();
          loadPatientLatestLocation();
        } catch (error) {
          navigate('/');
        }
      } else if (error instanceof NotValidAccessTokenError) navigate('/');
    }
  };

  useInterval(() => {
    loadPatientLatestLocation();
  }, 30 * 1000);

  useEffect(() => {
    const fetchAndSetPatientList = async () => {
      try {
        const patientList = await fetchPatientList();
        setPatients(patientList.patients);
        if (patientList.patients.length === 0) setIsPatientNull(true);
        else setIsPatientNull(false);
      } catch (error) {
        if (error instanceof ExpiredAccessTokenError) {
          try {
            await renewRefreshToken();
            fetchAndSetPatientList();
          } catch (error) {
            navigate('/');
          }
        } else if (error instanceof NotValidAccessTokenError) navigate('/');
        else if (error instanceof UserNotFoundError) {
          setIsPatientNull(true);
        } else if (error instanceof AccessDeniedError) setIsPatientNull(true);
      }
    };

    const loadAllPatientVocieMessages = async () => {
      try {
        const voiceMessages = await fetchAllPatientVocieMessageList();

        setVoiceMessages(voiceMessages);
      } catch (error) {
        if (error instanceof UserRecordInfoNotFoundError) {
          setVoiceMessages(null);
        } else if (error instanceof ExpiredAccessTokenError) {
          try {
            await renewRefreshToken();
            loadAllPatientVocieMessages();
          } catch (error) {
            navigate('/');
          }
        } else if (error instanceof NotValidAccessTokenError) navigate('/');
        else if (error instanceof UserNotFoundError) setVoiceMessages(null);
      }
    };

    fetchAndSetPatientList();
    loadAllPatientVocieMessages();
  }, []);

  // FCM 토큰 등록
  useEffect(() => {
    const assignFcmToken = async () => {
      initializeApp(firebaseConfig);

      const messaging = getMessaging();

      const permission = await Notification.requestPermission();

      if (isTokenSentToServer() === false) {
        if (permission === 'granted') {
          try {
            const currentToken = await getToken(messaging, { vapidKey });
            if (currentToken) {
              sendTokenToServer(currentToken);
            } else {
              setTokenSentToServer(false);
            }
          } catch (error) {
            setTokenSentToServer(false);
          }
        }
      }
    };

    assignFcmToken();
  }, []);

  useEffect(() => {
    if (patients !== null) {
      if (patients.length > 0) handlePatientSelection(0);
      if (patients[selectedPatient]) loadPatientLatestLocation();
    }
  }, [patients]);

  const handlePatientSelection = async (patientIndex) => {
    if (patientIndex < 0 || patientIndex >= patients.length) return;

    const selectedPatientId = patients[patientIndex].patientId;
    setSelectedPatient(patientIndex);

    try {
      const result = await medicineInfoRetrieval({ patientId: selectedPatientId });
      setMedicineSchedules(result.medicineSchedules);
    } catch (error) {}
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

  const isTokenSentToServer = () => {
    return window.localStorage.getItem('sentToServer') === '1';
  };

  const setTokenSentToServer = (sent) => {
    window.localStorage.setItem('sentToServer', sent ? '1' : '0');
  };

  const sendTokenToServer = async (fcmToken) => {
    try {
      await submitFcmToken({ fcmToken });
      setTokenSentToServer(true);
    } catch (error) {
      if (error instanceof ExpiredAccessTokenError) {
        // 엑세스토큰 만료되었을때
        setTokenSentToServer(false);
        try {
          await renewRefreshToken();
          sendTokenToServer(); // API 함수 재실행 (재귀함수)
        } catch (error) {
          navigate('/'); // 엑세스토큰 재발급 실패했을때
        }
      } else if (error instanceof NotValidAccessTokenError) navigate('/'); // 아예 존재하지 않던 엑세스토큰일때
    }
  };

  const renderPatientContent = () => (
    <div className="patient-content">
      <h1>홈</h1>

      <>
        {voiceMessages !== null && (
          <SubTitle
            title="음성 메세지"
            showButton={voiceMessages.records.length !== 0}
            linkTo="/voice-message"
          />
        )}

        <RowScrollContainer>
          {voiceMessages !== null &&
            voiceMessages.records.map((voiceMessage, index) => (
              <SmallVoiceMessageItem
                key={index}
                profileImage={
                  voiceMessage.profileImageName !== null
                    ? `${voiceMessages.imageApiUrl}${voiceMessage.profileImageName}`
                    : null
                }
                name={voiceMessage.name}
                time={voiceMessage.uploadedTime}
                onClick={() =>
                  navigate('/voice-message/detail', {
                    state: {
                      imageApiUrlPrefix: voiceMessages.imageApiUrl,
                      audioApiUrlPrefix: voiceMessages.audioApiUrlPrefix,
                      voiceMessage,
                    },
                  })
                }
              />
            ))}
          {voiceMessages === null && <p>아직 받으신 음성 메시지가 없습니다</p>}
        </RowScrollContainer>
      </>

      <hr />

      <ItemSelector
        items={patients.map((patient) => patient.patientName)}
        onSelect={handlePatientSelection}
      />

      <SubTitle title="일정" linkTo={`/schedule/${patients[selectedPatient]?.patientId}`} />
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
          <p>오늘은 일정이 없습니다</p>
        )}
      </BorderContainer>

      <SubTitle title="현재 위치" showButton={false} />
      <div className="address-info">
        <div className="left-wrap">
          <LocationOnIcon />
          <span>{address ? address : '아직 최근 위치정보가 존재하지 않습니다'}</span>
        </div>
        {address && (
          <span
            className="copy-button"
            onClick={() => {
              navigator.clipboard.writeText(address);
              alert('주소가 복사되었습니다.');
            }}
          >
            복사
          </span>
        )}
      </div>
      <div id="map-wrap">
        <Map
          id="map"
          center={{
            lat: latLng.lat,
            lng: latLng.lng,
          }}
          level={5} // 지도의 확대 레벨
          draggable={false}
          zoomable={false}
        >
          <MapMarker
            position={{
              lat: latLng.lat,
              lng: latLng.lng,
            }}
          />
        </Map>
        <div id="map-cover" className={address ? '' : 'blur'} />
      </div>

      <FloatingActionButton
        title={`${patients[selectedPatient]?.patientName}님의 일정에`}
        items={[
          {
            title: '약 일정 추가하기',
            icon: <DrugsIcon />,
            url: `/schedule/medicine-add/${patients[selectedPatient]?.patientId}`,
          },
          {
            title: '병원 일정 추가하기',
            icon: <LocalHospitalIcon />,
            url: `/schedule/hospital-add/${patients[selectedPatient]?.patientId}`,
          },
        ]}
      />
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
            hospitalDescription={detailData.hospitalDescription}
            hospitalVisitingDate={new Date(detailData.hospitalVisitingTime).toLocaleDateString(
              'ko-KR',
              { month: 'long', day: 'numeric' },
            )}
            hospitalVisitingTime={detailData.thisTime}
          />
        )}
      </div>
    </div>
  );

  const renderSignUpPatientSuggestion = () => (
    <div className="sign-up-patient-suggestion">
      <h3>케어 멤버를 추가해주세요</h3>
      <p>
        케어 멤버를 추가하면 약 일정 관리, 병원 일정 관리뿐만 아니라 실시간 위치 확인도 가능합니다.
      </p>

      <BigButton onClick={() => navigate('/sign-up/patient')}>케어 멤버 추가하기</BigButton>
    </div>
  );

  return (
    <div className="main-page">
      {isPatientNull !== undefined &&
        (isPatientNull ? renderSignUpPatientSuggestion() : renderPatientContent())}
      <NavBar activeTab="홈" />
    </div>
  );
};

export default MainPage;
