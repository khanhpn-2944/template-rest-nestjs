import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import fs from 'fs';
import { EntityNotFoundError } from 'typeorm';

import { CreatePostDto, PostDto, UpdatePostDto } from './dto';
import { PostRepository } from './post.repository';
import { Post } from '../entities/post.entity';
import { JobService } from '../jobs/job.service';
import { generateToken, getFileType } from '../shared/utils/app.util';
import { EventConstant } from '../constants/event.constant';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly jobService: JobService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(userId: string): Promise<PostDto[]> {
    const posts = await this.postRepository.findAllPostsByUserId(userId);

    return plainToInstance(PostDto, posts);
  }

  async findOneOrFail(userId: string, id: string): Promise<PostDto> {
    const post = await this.postRepository.findPostById(userId, id);
    if (!post) {
      throw new EntityNotFoundError(Post.name, undefined);
    }

    return plainToInstance(PostDto, post);
  }

  async create(
    userId: string,
    userEmail: string,
    createPostDto: CreatePostDto,
    file: Buffer,
    mimeType: string,
  ): Promise<PostDto> {
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

    this.eventEmitter.emit(EventConstant.postCreated, { userEmail, post });

    return plainToInstance(PostDto, post);
  }

  async update(
    userId: string,
    userEmail: string,
    id: string,
    updatePostDto: UpdatePostDto,
    file: Buffer,
    mimeType: string,
  ): Promise<PostDto> {
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

    const post = await this.postRepository.savePostAndTags(userId, {
      id,
      ...updatePostDto,
    });

    this.eventEmitter.emit(EventConstant.postUpdated, { userEmail, post });

    return plainToInstance(PostDto, post);
  }

  async remove(
    userId: string,
    userEmail: string,
    id: string,
  ): Promise<boolean> {
    const post = await this.postRepository.findOneOrFail({
      where: { id, userId },
    });
    await this.postRepository.softDelete(id);

    if (post.fileName) {
      fs.unlinkSync(`uploads/${post.fileName}`);
    }

    this.eventEmitter.emit(EventConstant.postDeleted, { userEmail, post });

    return true;
  }

  async sendMailCreatedPost(userEmail: string, post: Post) {
    await this.jobService.sendMailJob({
      to: userEmail,
      subject: 'Create a post',
      text: 'You have created a post!',
      template: 'create-post',
      context: { post },
    });
  }

  async sendMailUpdatedPost(userEmail: string, post: Post) {
    await this.jobService.sendMailJob({
      to: userEmail,
      subject: 'Update a post',
      text: 'You have updated a post!',
      template: 'update-post',
      context: { post },
    });
  }

  async sendMailDeletedPost(userEmail: string, post: Post) {
    await this.jobService.sendMailJob({
      to: userEmail,
      subject: 'Delete a post',
      text: 'You have deleted a post!',
      template: 'delete-post',
      context: { post },
    });
  }
}
