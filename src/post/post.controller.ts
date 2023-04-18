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
  UseInterceptors,
  UsePipes,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CreatePostDto, PostDto, UpdatePostDto } from './dto';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { Serialize } from '../interceptors/transform.interceptor';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { FileSizeValidationPipe } from '../shared/pipes/file-validation.pipe';

@UseGuards(JwtAuthGuard)
@Controller('posts')
@Serialize(PostDto)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async findAll(@CurrentUser() { id: userId }: User): Promise<PostDto[]> {
    return await this.postService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() { id: userId }: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PostDto> {
    return this.postService.findOneOrFail(userId, id);
  }

  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new FileSizeValidationPipe())
  @Post()
  create(
    @CurrentUser() { id: userId, email: userEmail }: User,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile('file') file: Express.Multer.File,
  ): Promise<PostDto> {
    return this.postService.create(
      userId,
      userEmail,
      createPostDto,
      file.buffer,
      file.mimetype,
    );
  }

  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new FileSizeValidationPipe())
  @Patch(':id')
  update(
    @CurrentUser() { id: userId, email: userEmail }: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile('file') file: Express.Multer.File,
  ): Promise<PostDto> {
    return this.postService.update(
      userId,
      userEmail,
      id,
      updatePostDto,
      file.buffer,
      file.mimetype,
    );
  }

  @Delete(':id')
  remove(
    @CurrentUser() { id: userId, email: userEmail }: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<boolean> {
    return this.postService.remove(userId, userEmail, id);
  }
}
