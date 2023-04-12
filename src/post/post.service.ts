import { Injectable } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';

import { CreatePostDto, UpdatePostDto } from './dto';
import { PostRepository } from './post.repository';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async findAll(userId: string): Promise<Post[]> {
    return await this.postRepository.findAllPostsByUserId(userId);
  }

  async findOneOrFail(userId: string, id: string): Promise<Post> {
    const post = await this.postRepository.findPostById(userId, id);
    if (!post) {
      throw new EntityNotFoundError(Post.name, undefined);
    }

    return post;
  }

  async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    return await this.postRepository.savePostAndTags(userId, createPostDto);
  }

  async update(
    userId: string,
    id: string,
    updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    return await this.postRepository.savePostAndTags(userId, {
      id,
      ...updatePostDto,
    });
  }

  async remove(userId: string, id: string): Promise<boolean> {
    await this.findOneOrFail(userId, id);
    await this.postRepository.softDelete(id);

    return true;
  }
}
