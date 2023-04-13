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

  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new FileSizeValidationPipe())
  @Post()
  create(
    @CurrentUser() currentUser: User,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile('file') file: Express.Multer.File,
  ): Promise<PostDto> {
    return this.postService.create(
      currentUser.id,
      createPostDto,
      file.buffer,
      file.mimetype,
    );
  }

  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new FileSizeValidationPipe())
  @Patch(':id')
  update(
    @CurrentUser() currentUser: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile('file') file: Express.Multer.File,
  ): Promise<PostDto> {
    return this.postService.update(
      currentUser.id,
      id,
      updatePostDto,
      file.buffer,
      file.mimetype,
    );
  }

  @Delete(':id')
  remove(
    @CurrentUser() currentUser: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<boolean> {
    return this.postService.remove(currentUser.id, id);
  }
}
