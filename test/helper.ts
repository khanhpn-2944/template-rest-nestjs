import {
  BadRequestException,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import { load } from 'locter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import request from 'supertest';
import { DataSource, ObjectType } from 'typeorm';
import {
  resolveFilePaths,
  resolveFilePatterns,
  useSeederFactory,
} from 'typeorm-extension';

import { AppModule } from '../src/app.module';
import { AsyncRequestContext } from '../src/async-request-context/async-request-context.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import AppDataSource from '../src/datasource/index';
import { User } from '../src/entities/user.entity';
import { ErrorDto } from '../src/shared/dto/error.dto';
import { BadRequestExceptionFilter } from '../src/shared/filters/bad-request-exception.filter';
import { FileSizeValidationPipe } from '../src/shared/pipes/file-validation.pipe';
import { hash } from '../src/shared/utils/bcrypt.util';

export declare type EntityProperty<Entity> = {
  [Property in keyof Entity]?: Entity[Property];
};

export const initApp = async (): Promise<INestApplication> => {
  await mockFs();
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const filterParam = {
    asyncRequestContext: app.get(AsyncRequestContext),
    logger: app.get(WINSTON_MODULE_NEST_PROVIDER),
  };

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );
  app.useGlobalFilters(new BadRequestExceptionFilter(filterParam));

  await setFactories(['src/database/factories/*.ts']);

  await app.init();

  return app;
};

export const getJWTResponse = async (
  app: INestApplication,
  method: string,
  route: string,
  variables: any = {},
  file?: Buffer,
  token = '',
) => {
  route = route.startsWith('/') ? route : `/${route}`;
  const { status, text, header } = await request(app.getHttpServer())
    [method](route)
    .set('Authorization', `Bearer ${token}`)
    .set('x-authorization', token)
    .set('cookie', `accessToken=${token}`)
    .query(variables)
    .send({ ...variables });

  if (header['content-type'] === 'text/csv; charset=utf-8') {
    return [status, text, header];
  }

  return [status, isJsonString(text) ? JSON.parse(text) : text, header];
};

export const initDataSource = async (): Promise<DataSource> => {
  if (!AppDataSource?.isInitialized) {
    await AppDataSource.initialize();
  }

  return AppDataSource;
};

export const formatError = (
  code: string,
  message: string,
  property = null,
  resource = null,
  indexes = null,
) => {
  if (Array.isArray(indexes)) {
    return {
      errors: indexes.map((index) => {
        return { code, message, property, resource, index };
      }),
      data: null,
    };
  }

  return {
    errors: [{ code, message, property, resource, index: indexes }],
    data: null,
  };
};

export const formatMultipleError = (errors: ErrorDto[]) => {
  const objects = [];
  for (const error of errors) {
    const { message, property = null, resource = null, index = null } = error;
    objects.push({ resource, property, message, index });
  }

  return { errors: objects, data: null };
};

export const mockFs = async () => {
  jest.spyOn(fs, 'readFileSync').mockImplementation((path: string) => {
    if (path.includes('/auth') || path.includes('jwtRS256')) {
      return 'fake file content';
    }

    return;
  });
};

export async function make<T>(
  entity: ObjectType<T>,
  overrideParams?: EntityProperty<T>,
) {
  return await useSeederFactory(entity).make(overrideParams);
}

export async function create<T>(
  entity: ObjectType<T>,
  overrideParams?: EntityProperty<T>,
): Promise<T> {
  return await useSeederFactory(entity).save(overrideParams);
}

export async function createMany<T>(
  entity: ObjectType<T>,
  amount = 1,
  overrideParams?: EntityProperty<T>,
): Promise<T[]> {
  return await useSeederFactory(entity).saveMany(amount, overrideParams);
}

export const setFactories = async (factoryFiles: string[]): Promise<void> => {
  try {
    factoryFiles = await resolveFilePatterns(factoryFiles);
    factoryFiles = resolveFilePaths(factoryFiles);

    for (const factoryFile of factoryFiles) {
      await load(factoryFile);
    }
  } catch (error) {
    console.log(error);
  }
};

export const mockJwtVerified = (user: User = null) => {
  return jest
    .spyOn(JwtAuthGuard.prototype, 'canActivate')
    .mockImplementation(async (ctx: ExecutionContext) => {
      const req = ctx.switchToHttp().getRequest();
      req.user =
        user ||
        create<User>(User, {
          username: 'username',
          password: await hash('password'),
          code: 'code',
          email: 'email@example.com',
        });

      return Promise.resolve(true);
    });
};

export const mockWriteFile = () => {
  return jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
    return 'mock write file';
  });
};

export const mockDeleteFile = () => {
  return jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {
    return 'mock delete file';
  });
};

export const mockFileValidationPipe = () => {
  return jest
    .spyOn(FileSizeValidationPipe.prototype, 'transform')
    .mockImplementation(async (value: any, metadata) => {
      if (metadata.data === 'file') {
        return {
          size: 100,
          mimetype: 'image/jpeg',
          buffer: Buffer.from('abc'),
        };
      }

      return value;
    });
};

function isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }

  return true;
}
