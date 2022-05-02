
export class UserError extends Error {}

export class RemindError extends UserError {}
export class PasswordError extends UserError {}
export class LoginError extends UserError {}
export class AuthenticationError extends UserError {}
export class UserDetailsError extends UserError {}

export class UserFinderError extends UserError {}

export class VerifyError extends UserError {}

export class TwoFAError extends UserError {}