import { useState, useEffect } from 'react';
import './FilledDateInput.css';
import '../index.css';

const FilledDateInput = ({ init = '', onInput, type = 'years', year = 2024, month = 4 }) => {
  const [input, setInput] = useState(init);
  const typeText = (type) => {
    if (type === 'years') return '년';
    if (type === 'months') return '월';
    if (type === 'days') return '일';
    return type;
  };

  useEffect(() => setInput(init), [init]);

  const getMaxDays = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const handleInput = (e) => {
    let value = e.target.value;

    value = value.replace(/^0+/, '');

    if (type === 'years') {
      value = value.slice(0, 4); // 최대 4자리로 제한
      value = value.replace(/\D/g, ''); // 숫자 이외의 문자 제거
    }

    if (type === 'months') {
      value = Math.max(1, Math.min(parseInt(value, 10), 12));
    }

    if (type === 'days') {
      const maxDays = year && month ? getMaxDays(year, month) : 31;
      value = Math.max(1, Math.min(parseInt(value, 10), maxDays));
    }

    setInput(value);
    if (onInput) onInput(value);
  };

  return (
    <label className={`filled-date-input ${type}`}>
      <input
        type="number"
        pattern="\d*"
        value={input}
        placeholder="0"
        onChange={handleInput}
        maxLength={type === 'years' ? 4 : undefined}
      />
      <span>{typeText(type)}</span>
    </label>
  );
};

export default FilledDateInput;
