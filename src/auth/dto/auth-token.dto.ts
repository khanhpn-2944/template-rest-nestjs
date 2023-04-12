export class AuthTokenDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresOn: Date;
  refreshTokenExpiresOn: Date;
}
