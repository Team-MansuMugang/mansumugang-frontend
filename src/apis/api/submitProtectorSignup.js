const baseURL = 'http://minnnisu.iptime.org';

export default submitProtectorSignup;

const submitProtectorSignup = async (params) => {
  validateParameters(params);
  const requestBody = { ...params };
  await callAPI(`${baseURL}/api/auth/signup/patient`, requestBody);
};

const validateParameters = ({
  username,
  password,
  passwordCheck,
  name,
  birthdate,
  email,
  nickname,
}) => {
  let missingFields = [];
  if (!username) missingFields.push('username');
  if (!password) missingFields.push('password');
  if (!passwordCheck) missingFields.push('passwordCheck');
  if (!name) missingFields.push('name');
  if (!birthdate) missingFields.push('birthdate');
  if (!email) missingFields.push('email');
  if (!nickname) missingFields.push('nickname');

  if (missingFields.length > 0) {
    throw new Error(`다음 필드를 채워주세요: ${missingFields.join(', ')}`);
  }
};

const callAPI = async (URL, body) => {
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(response.status);

    return await response.json();
  } catch (error) {
    console.error(`API 호출 실패: ${error.message}`);
    throw error;
  }
};
