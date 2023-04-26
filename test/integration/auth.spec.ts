import { HttpStatus, INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { setDataSource } from 'typeorm-extension';

import {
  create,
  getJWTResponse,
  initApp,
  initDataSource,
  mockJwtVerified,
} from '../helper';
import { User } from '../../src/entities/user.entity';
import { AuthErrorConstant } from '../../src/errors/auth-errors.constant';
import { hash } from '../../src/shared/utils/bcrypt.util';

describe('Auth controller', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let server: any;
  let user: User;

  beforeAll(async () => {
    app = await initApp();
    server = app.getHttpServer();
    dataSource = await initDataSource();
    setDataSource(dataSource);

    user = await create<User>(User, {
      password: await hash('password'),
    });
  });

  afterAll(async () => {
    server.close();
    jest.clearAllMocks();

    await dataSource.getRepository(User).delete({});
    await app.close();
  });

  describe('Sign in', () => {
    const route = 'auth/login';

    describe('Success', () => {
      it('Should login success', async () => {
        const [status, res] = await getJWTResponse(app, 'post', route, {
          username: user.username,
          password: 'password',
        });

        expect(res.accessToken).not.toBeNull();
        expect(res.refreshToken).not.toBeNull();
        expect(status).toEqual(HttpStatus.OK);
      });
    });

    describe('Error', () => {
      it('Should return error when invalid credentials', async () => {
        const [status, res] = await getJWTResponse(app, 'post', route, {
          username: user.username,
          password: 'wrong_password',
        });

        expect(res.message).toEqual('Email or password is invalid');
        expect(status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('Profile', () => {
    const route = 'auth/profile';
    let mock = null;

    describe('Error', () => {
      it('Should return error when invalid token', async () => {
        const [status, res] = await getJWTResponse(app, 'get', route);

        expect(res.message).toEqual('Token is invalid');
        expect(status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('Success', () => {
      beforeEach(() => {
        mock = mockJwtVerified(user);
      });

      afterEach(() => {
        mock.mockRestore();
      });

      it('Should save patient success if params valid', async () => {
        const [status, res] = await getJWTResponse(app, 'get', route);

        expect(res.id).toEqual(user.id);
        expect(res.username).toEqual(user.username);
        expect(res.email).toEqual(user.email);
        expect(res.code).toEqual(user.code);
        expect(status).toEqual(HttpStatus.OK);
      });
    });
  });
});
