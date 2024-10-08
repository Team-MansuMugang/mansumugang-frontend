import { useState, useEffect } from 'react';
import './FilledDualInput.css';
import '../index.css';

/**
 * @typedef {Object} Props
 * @property {string[]} [placeholder=['입력칸 1', '입력칸 2']] - 두 개의 입력 필드에 표시할 자리 표시자 텍스트 배열
 * @property {function(string, string): void} [onInputChange] - 입력 필드 값이 변경될 때 호출되는 콜백 함수. 첫 번째 인자는 입력 필드의 name, 두 번째 인자는 입력된 value
 * @property {function(string): void} [onInputClick] - 입력 필드가 클릭될 때 호출되는 콜백 함수. 인자는 클릭된 입력 필드의 name
 * @property {string[]} [init=[]] - 각 입력 필드의 초기값을 설정하기 위한 배열
 * @property {boolean[]} [viewOnly=[false, false]] - 각 입력 필드를 읽기 전용으로 설정하기 위한 배열
 */

/**
 * @param {Props} props - 컴포넌트에 전달된 props
 * @returns {JSX.Element}
 */
const FilledDualInput = ({
  placeholder = ['입력칸 1', '입력칸 2'],
  init = ['', ''],
  onInputChange,
  onInputClick,
  viewOnly = [false, false],
}) => {
  const [input1, setInput1] = useState(init[0]);
  const [input2, setInput2] = useState(init[1]);

  useEffect(() => {
    setInput1(init[0]);
    setInput2(init[1]);
  }, [init[0], init[1]]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'input1') setInput1(value);
    if (name === 'input2') setInput2(value);

    if (onInputChange) onInputChange(name, value);
  };

  const handleClick = (event) => {
    const { name } = event.target;
    if (onInputClick) onInputClick(name);
  };

  return (
    <div className="dual-input">
      <input
        type="text"
        name="input1"
        placeholder={placeholder[0]}
        value={input1}
        onChange={handleChange}
        onClick={handleClick}
        readOnly={viewOnly[0]}
        className={`second-input ${viewOnly[0] ? 'view-only' : ''}`}
      />
      <input
        type="text"
        name="input2"
        placeholder={placeholder[1]}
        value={input2}
        onChange={handleChange}
        onClick={handleClick}
        readOnly={viewOnly[1]}
        className={`second-input ${viewOnly[1] ? 'view-only' : ''}`}
      />
    </div>
  );
};

export default FilledDualInput;
