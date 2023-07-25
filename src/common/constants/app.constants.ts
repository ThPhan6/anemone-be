export const Message = {
  notFound: (name = 'Data') => `${name} not found.`,
  badRequest: 'Bad request.',
  invalidInput: 'Input is invalid.',
  wrongPassword: 'Password is incorrect.',
  generalError: 'Something went wrong. Please try again later.',
  expiredToken: 'Token is expired.',
  badToken: 'Bad token.',
  wrongMailOrPassword: 'Please check email and password again.',
  invalidRefreshToken: 'Invalid refreshToken.',
  invalidResetPasswordCode: 'Code is invalid, expired or used',
  userIsDisabled: 'User is disabled',
  companyNotFound: 'Company not found',
  divisionNotFound: 'Division not found',
  invalidAuthSession: 'Invalid auth session.',
  userNotFound: 'User not found.',
  mobileWrongRegisterId: 'Wrong register id',
  mobileApplicantIsDisabled: 'Applicant is disabled',
  mobileApplicantNotFound: 'Applicant not found',
};

export const RegularExpression = {
  mail: /^([a-z\d\+_\-]+)(\.[a-z\d\+_\-]+)*@([a-z\d\-]+\.)+[a-z]{2,6}$/i,
  zip: /^(\d{3})-(\d{4})$/,
  tel: /^[\d\-\+\(\)\*\#]{0,32}$/i,
  fullSize: /^[^ -~｡-ﾟ\x00-\x1f]+$/u,
  hanNum: /^\d+$/,
  hanNumAlpha: /^[a-zA-Z\d\s]+$/,
  hanNumAlphaKigo: /^[a-zA-Z`,.\'\s]+$/,
  hanNumAlphaMix: /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d]+$/,
  hanAlpha: /^[a-zA-Z\s]+$/,
};

export const DateTimeFormat = {
  dateFromInput: 'yyyy-MM-DD',
  dateToDatabase: 'yyyyMMDD',
  dateFromDatabase: 'YYYYMMDD',
  dateInTabiReg: 'yyyy/MM/DD',
};

export const MediaType = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
  image: 'image/*',
};

export const MaxFileSize = {
  image: 5000000,
};

export const SpecifiedUserId = {
  sql: -1,
  app: -2,
};

export const SpecifiedMenuCode = {
  sql: 'sql',
  app: 'app',
};

export const ErrorCode = {
  itemNotFound: 'ITEM_NOT_FOUND',
  itemEmpty: 'ITEM_EMPTY',
  itemExisting: 'ITEM_EXISTING',
  notAllowedToUpload: 'NOT_ALLOWED_TO_UPLOAD',
  insuranceCodeExisting: 'INSURANCE_CODE_EXISTING',
  invalidInsuranceCodeRange: 'INVALID_INSURANCE_CODE_RANGE',
};
