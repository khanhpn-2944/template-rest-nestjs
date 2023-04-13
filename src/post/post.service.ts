import { Injectable } from '@nestjs/common';
import fs from 'fs';
import { EntityNotFoundError } from 'typeorm';

import { CreatePostDto, UpdatePostDto } from './dto';
import { PostRepository } from './post.repository';
import { Post } from '../entities/post.entity';
import { generateToken, getFileType } from '../shared/utils/app.util';

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

  async create(
    userId: string,
    createPostDto: CreatePostDto,
    file: Buffer,
    mimeType: string,
  ): Promise<Post> {
    if (file) {
      createPostDto = {
        ...createPostDto,
        fileName: `${generateToken()}.${getFileType(mimeType)}`,
      };

      fs.writeFileSync(`uploads/${createPostDto.fileName}`, file, 'binary');
    }

    let post: Post;

    try {
      post = await this.postRepository.savePostAndTags(userId, createPostDto);
    } catch (error) {
      if (fs.existsSync(`uploads/${createPostDto.fileName}`)) {
        fs.unlinkSync(`uploads/${createPostDto.fileName}`);
      }

      throw error;
    }

    return post;
  }

  async update(
    userId: string,
    id: string,
    updatePostDto: UpdatePostDto,
    file: Buffer,
    mimeType: string,
  ): Promise<Post> {
    await this.findOneOrFail(userId, id);

    if (file) {
      updatePostDto = {
        ...updatePostDto,
        fileName: `${generateToken()}.${getFileType(mimeType)}`,
      };

      try {
        fs.writeFileSync(`uploads/${updatePostDto.fileName}`, file, 'binary');
        fs.unlinkSync(`uploads/${updatePostDto.fileName}`);
      } catch (error) {
        if (fs.existsSync(`uploads/${updatePostDto.fileName}`)) {
          fs.unlinkSync(`uploads/${updatePostDto.fileName}`);
        }

        throw error;
      }
    }

    return await this.postRepository.savePostAndTags(userId, {
      id,
      ...updatePostDto,
    });
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const post = await this.findOneOrFail(userId, id);
    await this.postRepository.softDelete(id);

    if (post.fileName) {
      fs.unlinkSync(post.fileName);
    }

    return true;
  }
}
