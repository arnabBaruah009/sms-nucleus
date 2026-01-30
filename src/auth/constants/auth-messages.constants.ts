export enum AuthMessages {
  UNAUTHORIZED = 'You are not authorized to access this resource',
  NO_TOKEN_PRESENT = 'You are not authenticated to access this resource',
  SOMETHING_WENT_WRONG = 'Something went wrong, please try again later',
  INVALID_LOGIN_PAYLOAD = 'Please provide your email and password',
  INVALID_FORGOT_PASSWORD_PAYLOAD = 'Please provide your email and new password',
  USER_DOES_NOT_EXIST = 'You are not registered with us, Please sign up',
  NO_VALID_TOKEN = 'No valid token found!',
  INCORRECT_PASSWORD = 'Incorrect password',
  USER_ALREADY_EXISTS = 'You are already registered with us, Please login',
  USER_NOT_ALLOWED = 'You are not authorized to register, Please contact support',
  EMAIL_ALREADY_VERIFIED = 'You are already verified with us, Please login',
}
