export class ParametersValidationError extends Error {
  constructor(missingFields) {
    super(`필수 입력란 누락: ${missingFields.join(', ')}`);
    this.name = this.constructor.name;
    this.missingFields = missingFields;
  }
}

export class HttpResponseError extends Error {
  constructor(status, message) {
    super(`HTTP Error ${status}: ${message}`);
    this.name = this.constructor.name;
    this.status = status;
  }
}

export class NotValidRequestError extends Error {
  constructor(errorDescriptions) {
    super('유효하지 않은 요청.');
    this.name = this.constructor.name;
    this.errorDescriptions = errorDescriptions;
  }
}

export class PasswordMismatchError extends Error {
  constructor() {
    super('비밀번호와 비밀번호 확인 값이 일치하지 않음.');
    this.name = this.constructor.name;
  }
}

export class DuplicatedUsernameError extends Error {
  constructor() {
    super('사용자 ID가 중복됨.');
    this.name = this.constructor.name;
  }
}

export class DuplicatedNicknameError extends Error {
  constructor() {
    super('사용자 닉네임이 중복됨.');
    this.name = this.constructor.name;
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('유저 정보를 찾을 수 없음.');
    this.name = this.constructor.name;
  }
}

export class PatientLoginNotAllowedError extends Error {
  constructor() {
    super('환자는 로그인할 수 없습니다.');
    this.name = this.constructor.name;
  }
}

export class AccessDeniedError extends Error {
  constructor() {
    super('접근 권한이 없습니다.');
    this.name = this.constructor.name;
  }
}

export class NotValidAccessTokenError extends Error {
  constructor() {
    super('유효하지 않은 엑세스 토큰.');
    this.name = this.constructor.name;
  }
}

export class NoSuchMedicineError extends Error {
  constructor() {
    super('약 정보를 찾을 수 없습니다.');
    this.name = this.constructor.name;
  }
}

export class ExpiredAccessTokenError extends Error {
  constructor() {
    super('만료된 엑세스 토큰.');
    this.name = this.constructor.name;
  }
}

export class AlreadyExistMedicineIntakeTimeError extends Error {
  constructor() {
    super('이미 존재하는 약 복용 시간입니다.');
    this.name = this.constructor.name;
  }
}

export class NoSuchMedicineIntakeTimeError extends Error {
  constructor() {
    super('존재하지 않는 약 복용 시간입니다.');
    this.name = this.constructor.name;
  }
}

export class AlreadyExistMedicineIntakeDayError extends Error {
  constructor() {
    super('이미 존재하는 약 복용 요일입니다.');
    this.name = this.constructor.name;
  }
}

export class UserLocationInfoNotFoundError extends Error {
  constructor() {
    super('해당 유저에 대한 위치 정보가 없음.');
    this.name = this.constructor.name;
  }
}

export class NoSuchMedicineIntakeDayError extends Error {
  constructor() {
    super('존재하지 않는 약 복용 요일입니다.');
    this.name = this.constructor.name;
  }
}

export class UserLocationInfoWithinRangeNotFoundError extends Error {
  constructor() {
    super('조회하려는 시간 범위 내 해당 유저의 위치 정보가 없음.');
    this.name = this.constructor.name;
  }
}

export class UserRecordInfoNotFoundError extends Error {
  constructor() {
    super('유저는 존재하지만, 유저의 음성녹음 정보가 존재하지 않습니다.');
    this.name = this.constructor.name;
  }
}

export class RecordInfoNotFound extends Error {
  constructor() {
    super('해당 고유번호를 가진 음성녹음 파일이 존재하지 않습니다.');
    this.name = this.constructor.name;
  }
}

export class RecordDeleteError extends Error {
  constructor() {
    super('녹음파일 삭제에 실패하였습니다.');
    this.name = this.constructor.name;
  }
}

export class OutOfBoundaryError extends Error {
  constructor() {
    super('경위도가 범위(대한민국 내)를 벗어남.');
    this.name = this.constructor.name;
  }
}

export class DuplicatedHospitalVisitingTimeError extends Error {
  constructor() {
    super('이미 존재하는 병원 방문 일정의 시간과 중복됩니다.');
    this.name = this.constructor.name;
  }
}

export class NeedLatitudeAndLongitudeError extends Error {
  constructor() {
    super('경위도 정보가 필요합니다.');
    this.name = this.constructor.name;
  }
}

export class NoSuchHospitalError extends Error {
  constructor() {
    super('존재하지 않은 병원 아이디로 접근했습니다.');
    this.name = this.constructor.name;
  }
}

export class S3_DELETE_OBJECT_ERROR extends Error {
  constructor() {
    super('S3 파일 삭제를 실패하였습니다');
    this.name = this.constructor.name;
  }
}

export class ImageDeleteError extends Error {
  constructor() {
    super('이미지 삭제에 실패하였습니다');
    this.name = this.constructor.name;
  }
}

export class InternalSeverError extends Error {
  constructor() {
    super('알 수 없는 오류가 발생하였습니다. 문제가 지속되면 관리자에게 문의하세요.');
    this.name = this.constructor.name;
  }
}

export class NoUserProfileImageError extends Error {
  constructor() {
    super('프로필 이미지가 존재하지 않습니다.');
    this.name = this.constructor.name;
  }
}

export class ProtectorHasActivePatientsError extends Error {
  constructor() {
    super('모든 환자가 탈퇴 되지 않았습니다.');
    this.name = this.constructor.name;
  }
}

export class NoSuchCategoryError extends Error {
  constructor() {
    super('존재하지 않는 카테고리입니다.');
    this.name = this.constructor.name;
  }
}

export class NoSuchPostError extends Error {
  constructor() {
    super('존재하지 않는 게시글입니다.');
    this.name = this.constructor.name;
  }
}

export class NoSuchCommentError extends Error {
  constructor() {
    super('존재하지 않은 댓글로 접근했습니다.');
    this.name = this.constructor.name;
  }
}

export class DeletedCommentError extends Error {
  constructor() {
    super('삭제된 댓글입니다.');
    this.name = this.constructor.name;
  }
}

export class NotTheAuthorOfTheComment extends Error {
  constructor() {
    super('댓글의 작성자가 아닙니다.');
    this.name = this.constructor.name;
  }
}

export class NoSuchReplyError extends Error {
  constructor() {
    super('존재하지 않는 답글입니다.');
    this.name = this.constructor.name;
  }
}

export class DeletedReplyError extends Error {
  constructor() {
    super('삭제된 답글입니다.');
    this.name = this.constructor.name;
  }
}

export class NotTheAuthorOfTheReply extends Error {
  constructor() {
    super('답글의 작성자가 아닙니다.');
    this.name = this.constructor.name;
  }
}

export class NoImageFileError extends Error {
  constructor() {
    super('이미지 파일이 없습니다.');
    this.name = this.constructor.name;
  }
}

export class ImageSaveError extends Error {
  constructor() {
    super('이미지 저장에 실패했습니다.');
    this.name = this.constructor.name;
  }
}

export class NotTheAuthorOfThePost extends Error {
  constructor() {
    super('게시글의 작성자가 아닙니다.');
    this.name = this.constructor.name;
  }
}

export class InvalidQueryError extends Error {
  constructor() {
    super('유효하지 않은 쿼리입니다.');
    this.name = this.constructor.name;
  }
}

export class ProtectorLoginNotAllowedError extends Error {
  constructor() {
    super('보호자는 로그인할 수 없습니다.');
    this.name = this.constructor.name;
  }
}
