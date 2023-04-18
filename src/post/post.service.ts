import { Injectable } from '@nestjs/common';
import fs from 'fs';
import { EntityNotFoundError } from 'typeorm';

import { CreatePostDto, UpdatePostDto } from './dto';
import { PostRepository } from './post.repository';
import { Post } from '../entities/post.entity';
import { JobService } from '../jobs/job.service';
import { generateToken, getFileType } from '../shared/utils/app.util';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly jobService: JobService,
  ) {}

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
    userEmail: string,
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

    await this.sendMailCreatedPost(userEmail, post);

    return post;
  }

  async update(
    userId: string,
    userEmail: string,
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

    const post = await this.postRepository.savePostAndTags(userId, {
      id,
      ...updatePostDto,
    });

    await this.sendMailUpdatedPost(userEmail, post);

    return post;
  }

  async remove(
    userId: string,
    userEmail: string,
    id: string,
  ): Promise<boolean> {
    const post = await this.findOneOrFail(userId, id);
    await this.postRepository.softDelete(id);

    if (post.fileName) {
      fs.unlinkSync(`uploads/${post.fileName}`);
    }

    await this.sendMailDeletedPost(userEmail, post);

    return true;
  }

  private async sendMailCreatedPost(userEmail: string, post: Post) {
    await this.jobService.sendMailJob({
      to: userEmail,
      subject: 'Create a post',
      text: 'You have created a post!',
      template: 'create-post',
      context: { post },
    });
  }

  private async sendMailUpdatedPost(userEmail: string, post: Post) {
    await this.jobService.sendMailJob({
      to: userEmail,
      subject: 'Update a post',
      text: 'You have updated a post!',
      template: 'update-post',
      context: { post },
    });
  }

  private async sendMailDeletedPost(userEmail: string, post: Post) {
    await this.jobService.sendMailJob({
      to: userEmail,
      subject: 'Delete a post',
      text: 'You have deleted a post!',
      template: 'delete-post',
      context: { post },
    });
  }
}
