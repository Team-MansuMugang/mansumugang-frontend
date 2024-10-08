import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BigButton from '../../components/BigButton';
import Input from '../../components/Input';
import InputWrapper from '../../components/InputWrapper';
import MainHeader from '../../components/MainHeader';
import SubButton from '../../components/SubButton';
import CheckButton from '../../components/CheckButton';
import { produce } from 'immer';
import './ChangeProfilePage.css';
import { validName, validNickname } from '../utility/accountValidation';
import checkNicknameUnique from '../../apis/api/checkNicknameUnique';
import submitProfileImage from '../../apis/api/submitProfileImage';
import deleteProfileImage from '../../apis/api/deleteProfileImage';
import { ExpiredAccessTokenError, NotValidAccessTokenError } from '../../apis/utility/errors';
import fetchMyInfo from '../../apis/api/fetchMyInfo';
import { toast } from 'react-toastify';
import updateMyInfo from '../../apis/api/updateMyInfo';
import ImageUploader from '../../components/ImageUploader';

const ChangeProfilePage = () => {
  const [originalUserInfo, setOriginalUserInfo] = useState(null);
  const [name, setName] = useState({ value: '', status: 'default', description: '' });
  const [nickname, setNickname] = useState({ value: '', status: 'default', description: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [initProfileImage, setInitProfileImage] = useState(null);
  const [profileImage, setProfileImage] = useState({ value: null, status: 'default' });
  const navigate = useNavigate();

  useEffect(() => {
    if (
      (name.status === 'success' && nickname.status === 'success') ||
      (name.status === 'success' && nickname.status === 'default') ||
      (name.status === 'default' && nickname.status === 'success')
    ) {
      setIsSuccess(true);
    } else {
      setIsSuccess(false);
    }
  }, [name.status, nickname.status]);

  const handleNameChange = (event) => {
    const { status, description } = validName(event.target.value);
    setName((currentName) =>
      produce(currentName, (draft) => {
        draft.value = event.target.value;
        draft.status = status;
        draft.description = description;
      }),
    );
  };

  useEffect(() => {
    const fetchAndSetMyInfo = async () => {
      try {
        const myInfo = await fetchMyInfo();
        setOriginalUserInfo(myInfo);

        if (myInfo.profileImageName !== null) {
          const response = await fetch(`${myInfo.imageApiUrl}${myInfo.profileImageName}`);
          const blob = await response.blob();
          const file = new File([blob], 'medicineImage.jpg', { type: blob.type });
          setInitProfileImage(URL.createObjectURL(file));
        }

        setName((currentName) => ({
          ...currentName,
          value: myInfo.name,
        }));

        setNickname((currentNickname) => ({
          ...currentNickname,
          value: myInfo.nickname,
        }));
      } catch (error) {
        if (error instanceof ExpiredAccessTokenError) {
          try {
            await renewRefreshToken();
            fetchAndSetMyInfo();
          } catch (error) {
            navigate('/');
          }
        } else if (error instanceof NotValidAccessTokenError) navigate('/');
      }
    };

    fetchAndSetMyInfo();
  }, []);

  useEffect;

  const handleNicknameChange = (event) => {
    const { status, description } = validNickname(event.target.value);

    setNickname((currentNickname) =>
      produce(currentNickname, (draft) => {
        draft.value = event.target.value;
        draft.status = status;
        draft.description = description;
      }),
    );
  };

  const handleProfileimageUpload = async () => {
    try {
      if (profileImage.value !== null && profileImage.status === 'changed') {
        await submitProfileImage(profileImage.value);

        // 상태 초기화
        setInitProfileImage(URL.createObjectURL(profileImage.value));
        setProfileImage({ value: null, status: 'default' });

        toast.info('새로운 프로필 이미지를 등록하였습니다.', {
          position: 'bottom-center',
        });
        return;
      }

      if (
        initProfileImage !== null &&
        profileImage.value === null &&
        profileImage.status === 'changed'
      ) {
        await deleteProfileImage();

        // 상태 초기화
        setInitProfileImage(null);
        setProfileImage({ value: null, status: 'default' });

        toast.info('프로필 이미지를 삭제하였습니다.', {
          position: 'bottom-center',
        });
        return;
      }

      toast.error('새로운 프로필 이미지를 선택해주세요', {
        position: 'bottom-center',
      });
    } catch (error) {
      if (error instanceof ExpiredAccessTokenError) {
        try {
          await renewRefreshToken();
          fetchAndSetMyInfo();
        } catch (error) {
          navigate('/');
        }
      } else if (error instanceof NotValidAccessTokenError) navigate('/');
    }
  };

  const handleImageChange = (image) => {
    setProfileImage({ value: image, status: 'changed' });
  };

  const handleUpload = async () => {
    if (originalUserInfo === null) {
      toast.error('오류가 발생했습니다. 잠시 후 다시 시도해주세요', {
        position: 'bottom-center',
      });
      return;
    }

    const requestBody = {
      userId: originalUserInfo.protectorId,
      name: name.value,
      birthdate: originalUserInfo.birthdate,
      telephone: originalUserInfo.telephone,
      email: originalUserInfo.email,
      nickname: nickname.value,
    };

    try {
      try {
        await updateMyInfo(requestBody);
      } catch (error) {
        if (error instanceof ExpiredAccessTokenError) {
          try {
            await renewRefreshToken();
            fetchAndSetMyInfo();
          } catch (error) {
            navigate('/');
          }
        } else if (error instanceof NotValidAccessTokenError) navigate('/');
      }

      try {
        navigate(-1);
      } catch (error) {
        toast.error('오류가 발생했습니다. 잠시 후 다시 시도해주세요', {
          position: 'bottom-center',
        });
      }
    } catch (error) {
      toast.warn('입력된 정보들을 확인해주세요', { position: 'top-center' });
    }
  };

  const handleNicknameUniqueCheck = async () => {
    try {
      const result = await checkNicknameUnique(nickname.value);
      let status = 'success';
      let description = '사용 가능한 닉네임입니다';

      if (!result) {
        status = 'warning';
        description = '이미 사용 중인 닉네임입니다';
      }

      setNickname((currentId) =>
        produce(currentId, (draft) => {
          draft.status = status;
          draft.description = description;
        }),
      );
    } catch (error) {
      if (error instanceof NotValidRequestError) {
        setNickname((currentId) =>
          produce(currentId, (draft) => {
            draft.status = 'warning';
            draft.description = error.errorDescriptions[0].message;
          }),
        );
      } else if (error instanceof HttpResponseError) {
        setNickname((currentId) =>
          produce(currentId, (draft) => {
            draft.status = 'warning';
            draft.description = error.message;
          }),
        );
      }
    }
  };

  return (
    <>
      <MainHeader title="프로필 수정하기" onClickLeft={() => navigate(-1)}></MainHeader>
      <div className="profile-change">
        <div className="profile-image-uploader-wrapper">
          <ImageUploader init={initProfileImage} onImageUpload={handleImageChange} />
          <SubButton className="sub-button" onClick={handleProfileimageUpload}>
            사진 수정하기
          </SubButton>
        </div>
        <InputWrapper
          description="이름 수정"
          status={name.status}
          statusDescription={name.description}
        >
          <Input
            placeholder="홍길동"
            status={name.status}
            onInput={handleNameChange}
            value={name.value}
          />
        </InputWrapper>
        <InputWrapper
          description="닉네임 (커뮤니티) 수정"
          status={nickname.status}
          statusDescription={nickname.description}
        >
          <Input
            placeholder="닉네임"
            status={nickname.status}
            onChange={handleNicknameChange}
            value={nickname.value}
          />
          <CheckButton disabled={nickname.status !== 'info'} onClick={handleNicknameUniqueCheck}>
            중복 확인
          </CheckButton>
        </InputWrapper>
        <div className="big-button-wrap">
          <BigButton disabled={!isSuccess} onClick={handleUpload}>
            수정하기
          </BigButton>
        </div>
      </div>
    </>
  );
};

export default ChangeProfilePage;
