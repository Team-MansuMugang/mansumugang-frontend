import { useNavigate } from 'react-router-dom';
import BigButton from '../../components/BigButton';
import Input from '../../components/Input';
import InputWrapper from '../../components/InputWrapper';
import MainHeader from '../../components/MainHeader';
import './AddMemberPage.css';

const AddMemberPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <MainHeader title="나의 구성원 추가하기" onClickLeft={() => navigate(-1)}></MainHeader>
      <div className="add-member">
        <InputWrapper description="환자 아이디">
          <Input placeholder="환자 아이디" />
        </InputWrapper>
        <InputWrapper description="환자 비밀번호">
          <Input placeholder="환자 비밀번호" />
        </InputWrapper>
        <div className="big-button-wrap">
          <BigButton>추가하기</BigButton>
        </div>
      </div>
    </>
  );
};

export default AddMemberPage;
