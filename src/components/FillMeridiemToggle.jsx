import React, { useEffect, useState } from 'react';
import './FillMeridiemToggle.css';
import '../index.css';
import ArrowBack2Icon from '../assets/svg/arrow-back-2.svg?react';

const FillMeridiemToggle = ({ init = '', onChange }) => {
  const [isPM, setIsPM] = useState(false);

  const checkMeridiemPM = (meridiem) => {
    if (meridiem.toUpperCase() === 'PM') return true;
    if (meridiem.toUpperCase() === 'AM') return false;
    return meridiem;
  };

  useEffect(() => {
    setIsPM(checkMeridiemPM(init));
  }, [init]);

  const toggleMeridiem = () => {
    if (onChange) onChange(!isPM ? 'PM' : 'AM');
    setIsPM(!isPM);
  };

  return (
    <button className="filled-meridiem-toggle" onClick={toggleMeridiem}>
      <span>{isPM ? '오후' : '오전'}</span>
      <div className="toggle-icons">
        <ArrowBack2Icon />
        <ArrowBack2Icon />
      </div>
    </button>
  );
};

export default FillMeridiemToggle;
