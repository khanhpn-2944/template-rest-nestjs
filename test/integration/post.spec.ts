import { HttpStatus, INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { setDataSource } from 'typeorm-extension';

import {
  create,
  createMany,
  getJWTResponse,
  initApp,
  initDataSource,
  make,
  mockDeleteFile,
  mockFileValidationPipe,
  mockJwtVerified,
  mockWriteFile,
} from '../helper';
import { Post } from '../../src/entities/post.entity';
import { Tag } from '../../src/entities/tag.entity';
import { User } from '../../src/entities/user.entity';
import { AuthErrorConstant } from '../../src/errors/auth-errors.constant';
import { HTTP_ERR_MSGS } from '../../src/errors/error.constant';
import { hash } from '../../src/shared/utils/bcrypt.util';

const createPostsAndTags = async (user, posts, tags) => {
  posts = await createMany<Post>(Post, 5, { userId: user.id });
  tags = [];
  for (const post of posts) {
    const postTags = await createMany<Tag>(Tag, 3, { postId: post.id });
    tags = [...tags, ...postTags];
  }
  return [posts, tags];
};

describe('Post controller', () => {
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
      password: await hash('123456'),
    });
  });

  afterAll(async () => {
    server.close();
    jest.clearAllMocks();

    await dataSource.getRepository(User).delete({});
    await app.close();
  });

  describe('List all posts', () => {
    let posts: Post[];
    let tags: Tag[];

    const route = 'posts';
    let mock = null;

    beforeEach(async () => {
      [posts, tags] = await createPostsAndTags(user, posts, tags);
    });

    afterEach(async () => {
      await dataSource.getRepository(Tag).delete({});
      await dataSource.getRepository(Post).delete({});
    });

    describe('Invalid token', () => {
      it('Should return error', async () => {
        const [status, res] = await getJWTResponse(app, 'get', route);

        expect(res.message).toEqual('Token is invalid');
        expect(status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('Success', () => {
      beforeEach(async () => {
        mock = mockJwtVerified(user);
      });

      afterEach(async () => {
        mock.mockRestore();
      });

      it('Should return all posts', async () => {
        const [status, res] = await getJWTResponse(app, 'get', route);

        expect(res).toHaveLength(posts.length);
        expect(status).toEqual(HttpStatus.OK);
      });
    });
  });

  describe('Show a post', () => {
    let post: Post;
    let posts: Post[];
    let tags: Tag[];

    let route: string;
    let mock = null;

    beforeEach(async () => {
      [posts, tags] = await createPostsAndTags(user, posts, tags);
      post = await posts[Math.floor(Math.random() * posts.length)];
      route = `posts/${post.id}`;
    });

    afterEach(async () => {
      await dataSource.getRepository(Tag).delete({});
      await dataSource.getRepository(Post).delete({});
    });

    describe('Invalid token', () => {
      it('Should return error', async () => {
        const [status, res] = await getJWTResponse(app, 'get', route);

        expect(res.message).toEqual('Token is invalid');
        expect(status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('Post not exist', () => {
      beforeEach(async () => {
        route = `posts/${-1}`;
        mock = mockJwtVerified(user);
      });

      afterEach(async () => {
        mock.mockRestore();
      });

      it('Should return error', async () => {
        const [status, res] = await getJWTResponse(app, 'get', route);

        expect(res.messages).toEqual('リクエストパラメータが正しくない。');
        expect(status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    describe('Success', () => {
      beforeEach(async () => {
        mock = mockJwtVerified(user);
      });

      afterEach(async () => {
        mock.mockRestore();
      });

      it('Should return exact post', async () => {
        const [status, res] = await getJWTResponse(app, 'get', route);

        expect(res.id).toEqual(post.id);
        expect(res.title).toEqual(post.title);
        expect(res.description).toEqual(post.description);
        expect(status).toEqual(HttpStatus.OK);
      });
    });
  });

  describe('Create a post', () => {
    let post: Post;

    const route = 'posts';
    let mockJwtVerifiedVar = null;
    let mockWriteFileVar = null;
    let mockDeleteFileVar = null;
    let mockFileValidationPipeVar = null;

    beforeEach(async () => {
      post = await make<Post>(Post);
    });

    afterEach(async () => {
      await dataSource.getRepository(Tag).delete({});
      await dataSource.getRepository(Post).delete({});
    });

    describe('Invalid token', () => {
      beforeEach(async () => {
        mockWriteFileVar = mockWriteFile();
        mockDeleteFileVar = mockDeleteFile();
        mockFileValidationPipeVar = mockFileValidationPipe();
      });

      afterEach(async () => {
        mockWriteFileVar.mockRestore();
        mockDeleteFileVar.mockRestore();
        mockFileValidationPipeVar.mockRestore();
      });

      it('Should return error', async () => {
        const [status, res] = await getJWTResponse(
          app,
          'post',
          route,
          post,
          Buffer.from('abc'),
        );

        expect(res.message).toEqual('Token is invalid');
        expect(status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('Success', () => {
      beforeEach(async () => {
        mockJwtVerifiedVar = mockJwtVerified(user);
        mockWriteFileVar = mockWriteFile();
        mockDeleteFileVar = mockDeleteFile();
        mockFileValidationPipeVar = mockFileValidationPipe();
      });

      afterEach(async () => {
        mockJwtVerifiedVar.mockRestore();
        mockWriteFileVar.mockRestore();
        mockDeleteFileVar.mockRestore();
        mockFileValidationPipeVar.mockRestore();
      });

      it('Should return created post', async () => {
        const [status, res] = await getJWTResponse(
          app,
          'post',
          route,
          post,
          Buffer.from('abc'),
        );

        expect(res.title).toEqual(post.title);
        expect(res.description).toEqual(post.description);
        expect(status).toEqual(HttpStatus.CREATED);
      });
    });
  });

  describe('Update a post', () => {
    let post: Post;
    let posts: Post[];
    let tags: Tag[];

    let route: string;
    let mockJwtVerifiedVar = null;
    let mockWriteFileVar = null;
    let mockDeleteFileVar = null;
    let mockFileValidationPipeVar = null;

    beforeEach(async () => {
      [posts, tags] = await createPostsAndTags(user, posts, tags);
      post = await posts[Math.floor(Math.random() * posts.length)];
      route = `posts/${post.id}`;
    });

    afterEach(async () => {
      await dataSource.getRepository(Tag).delete({});
      await dataSource.getRepository(Post).delete({});
    });

    describe('Invalid token', () => {
      beforeEach(async () => {
        mockWriteFileVar = mockWriteFile();
        mockDeleteFileVar = mockDeleteFile();
        mockFileValidationPipeVar = mockFileValidationPipe();
      });

      afterEach(async () => {
        mockWriteFileVar.mockRestore();
        mockDeleteFileVar.mockRestore();
        mockFileValidationPipeVar.mockRestore();
      });

      it('Should return error', async () => {
        const [status, res] = await getJWTResponse(
          app,
          'patch',
          route,
          post,
          Buffer.from('abc'),
        );

        expect(res.message).toEqual('Token is invalid');
        expect(status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('Success', () => {
      beforeEach(async () => {
        mockJwtVerifiedVar = mockJwtVerified(user);
        mockWriteFileVar = mockWriteFile();
        mockDeleteFileVar = mockDeleteFile();
        mockFileValidationPipeVar = mockFileValidationPipe();
      });

      afterEach(async () => {
        mockJwtVerifiedVar.mockRestore();
        mockWriteFileVar.mockRestore();
        mockDeleteFileVar.mockRestore();
        mockFileValidationPipeVar.mockRestore();
      });

      it('Should return updated post', async () => {
        const [status, res] = await getJWTResponse(
          app,
          'patch',
          route,
          post,
          Buffer.from('abc'),
        );

        expect(res.id).toEqual(post.id);
        expect(res.title).toEqual(post.title);
        expect(res.description).toEqual(post.description);
        expect(status).toEqual(HttpStatus.OK);
      });
    });
  });

  describe('Delete a post', () => {
    let id: string;
    let posts: Post[];
    let tags: Tag[];

    let route: string;
    let mockJwtVerifiedVar = null;
    let mockDeleteFileVar = null;

    beforeEach(async () => {
      [posts, tags] = await createPostsAndTags(user, posts, tags);
      id = posts[Math.floor(Math.random() * posts.length)].id;
      route = `posts/${id}`;
    });

    afterEach(async () => {
      await dataSource.getRepository(Tag).delete({});
      await dataSource.getRepository(Post).delete({});
    });

    describe('Invalid token', () => {
      beforeEach(async () => {
        mockDeleteFileVar = mockDeleteFile();
      });

      afterEach(async () => {
        mockDeleteFileVar.mockRestore();
      });

      it('Should return error', async () => {
        const [status, res] = await getJWTResponse(app, 'delete', route);

        expect(res.message).toEqual('Token is invalid');
        expect(status).toEqual(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('Success', () => {
      beforeEach(async () => {
        mockJwtVerifiedVar = mockJwtVerified(user);
        mockDeleteFileVar = mockDeleteFile();
      });

      afterEach(async () => {
        mockJwtVerifiedVar.mockRestore();
        mockDeleteFileVar.mockRestore();
      });

      it('Should return true', async () => {
        const [status, res] = await getJWTResponse(app, 'delete', route);

        expect(res).toBeTruthy();
        expect(status).toEqual(HttpStatus.OK);
      });
    });
  });
});
