import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CreatePostDto, PostDto, UpdatePostDto } from './dto';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { Serialize } from '../interceptors/transform.interceptor';

@UseGuards(JwtAuthGuard)
@Controller('posts')
@Serialize(PostDto)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async findAll(@CurrentUser() currentUser: User): Promise<PostDto[]> {
    return await this.postService.findAll(currentUser.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PostDto> {
    return this.postService.findOneOrFail(currentUser.id, id);
  }

  @Post()
  create(
    @CurrentUser() currentUser: User,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostDto> {
    return this.postService.create(currentUser.id, createPostDto);
  }

  @Patch(':id')
  update(
    @CurrentUser() currentUser: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostDto> {
    return this.postService.update(currentUser.id, id, updatePostDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() currentUser: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<boolean> {
    return this.postService.remove(currentUser.id, id);
  }
}
