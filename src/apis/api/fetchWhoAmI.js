import {
  HttpResponseError,
  NotValidAccessTokenError,
  ExpiredAccessTokenError,
  UserNotFoundError,
  AccessDeniedError,
} from '../utility/errors';

const baseURL = 'http://minnnisu.iptime.org';

const fetchWhoAmI = async () => {
  const response = await fetch(`${baseURL}/api/user/inquiry/protectorInfo`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    if (result.errorType === 'NotValidAccessTokenError') throw new NotValidAccessTokenError();
    if (result.errorType === 'ExpiredAccessTokenError') throw new ExpiredAccessTokenError();
    if (result.errorType === 'UserNotFoundError') throw new UserNotFoundError();
    if (result.errorType === 'AccessDeniedError') throw new AccessDeniedError();

    throw new HttpResponseError(response.status, result.message);
  }

  return result;
};

export default fetchWhoAmI;
