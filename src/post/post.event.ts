import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PostService } from './post.service';
import { EventConstant } from '../constants/event.constant';

@Injectable()
export class PostEvent {
  constructor(private readonly postService: PostService) {}

  @OnEvent(EventConstant.postCreated)
  async handlePostCreatedEvent({ userEmail, post }): Promise<void> {
    await this.postService.sendMailCreatedPost(userEmail, post);
  }

  @OnEvent(EventConstant.postUpdated)
  async handlePostUpdatedEvent({ userEmail, post }): Promise<void> {
    await this.postService.sendMailUpdatedPost(userEmail, post);
  }

  @OnEvent(EventConstant.postUpdated)
  async handlePostDeletedEvent({ userEmail, post }): Promise<void> {
    await this.postService.sendMailDeletedPost(userEmail, post);
  }
}
