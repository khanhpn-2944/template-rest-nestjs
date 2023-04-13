import { Injectable } from '@nestjs/common';
import { Repository, DataSource, EntityManager } from 'typeorm';

import { CreatePostDto, UpdatePostDto } from './dto';
import { Post } from '../entities/post.entity';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(private readonly dataSource: DataSource) {
    super(Post, dataSource.manager);
  }

  async findAllPostsByUserId(userId: string): Promise<Post[]> {
    return await this.createQueryBuilder('post')
      .where('post.user_id = :userId', { userId })
      .leftJoinAndSelect('post.tags', 'tags', 'tags.deleted IS NULL')
      .getMany();
  }

  async findPostById(userId: string, id: string): Promise<Post> {
    return await this.createQueryBuilder('post')
      .where('post.user_id = :userId', { userId })
      .andWhereInIds(id)
      .leftJoinAndSelect('post.tags', 'tags', 'tags.deleted IS NULL')
      .getOne();
  }

  async savePostAndTags(
    userId: string,
    postDto: CreatePostDto | UpdatePostDto,
  ): Promise<Post> {
    let post: Post;
    await this.dataSource.transaction(
      async (entityManager: EntityManager): Promise<void> => {
        post = await entityManager.save(Post, { userId, ...postDto });
        if (postDto.tags) {
          let tags = postDto.tags.map((tag) => ({ postId: post.id, ...tag }));
          tags = await entityManager.save(Tag, tags);

          Object.assign(post, { tags });
        }
      },
    );

    return post;
  }
}
