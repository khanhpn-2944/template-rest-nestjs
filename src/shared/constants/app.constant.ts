export const AppConStant = {
  jsonBodySizeLimit: '50mb',
  defaultTimezone: 'Asia/Tokyo',
  startTimeOfDay: '00:00:00',
  endTimeOfDay: '23:59:59',
  saltOrRounds: 10,
  savedRecordsNumber: 300,
  jwtExpiresIn: '24h',
  jwtRefreshExpiresIn: '30d',
  cookieOptions: {
    domain: process.env.APP_DOMAIN,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30days same with refresh token
    httpOnly: true,
    signed: true,
  },
  maxAllowedSizeUploaded: 100 * 1024 ** 2, // 100mb
  encodingFormat: {
    hex: 'hex',
    base64: 'base64',
    ASCII: 'ascii',
  },
  reg: {
    passwordRegex:
      /^((?=.*[A-Za-z])(?=.*[\041-\057\072-\100\133-\140\173-\176])|(?=.*\d)(?=.*[\041-\057\072-\100\133-\140\173-\176])|(?=.*[A-Za-z])(?=.*\d))[0-9a-zA-Z\041-\057\072-\100\133-\140\173-\176]{8,32}$/,
  },
  lengthUuid: 36,
  redis: {
    host: process.env.REDIS_HOST as string,
    port: process.env.REDIS_PORT as unknown as number,
  },
  maxFileSize: 5242880,
  fileType: {
    jpg: 'image/jpeg',
    png: 'image/png',
  },
};
