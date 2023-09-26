import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreatePostDto, PostDto, UpdatePostDto } from './dto';
import { PostService } from './post.service';

@Resolver(() => PostDto)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Query(() => [PostDto])
  async findAll(
    @Args({ name: 'userId', type: () => String }) userId: string,
  ): Promise<PostDto[]> {
    return await this.postService.findAll(userId);
  }

  @Query(() => PostDto)
  async findOneOrFail(
    @Args({ name: 'userId', type: () => String }) userId: string,
    @Args({ name: 'id', type: () => String }) id: string,
  ): Promise<PostDto> {
    return await this.postService.findOneOrFail(userId, id);
  }

  @Mutation(() => PostDto)
  async create(
    @Args({ name: 'userId', type: () => String }) userId: string,
    @Args({ name: 'userEmail', type: () => String }) userEmail: string,
    @Args('createPostDto') createPostDto: CreatePostDto,
    @Args('file') file: Buffer,
    @Args('mimeType') mimeType: string,
  ): Promise<PostDto> {
    return await this.postService.create(
      userId,
      userEmail,
      createPostDto,
      file,
      mimeType,
    );
  }

  @Mutation(() => PostDto)
  async update(
    @Args({ name: 'userId', type: () => String }) userId: string,
    @Args({ name: 'userEmail', type: () => String }) userEmail: string,
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('updatePostDto') updatePostDto: UpdatePostDto,
    @Args('file') file: Buffer,
    @Args('mimeType') mimeType: string,
  ): Promise<PostDto> {
    return await this.postService.update(
      userId,
      userEmail,
      id,
      updatePostDto,
      file,
      mimeType,
    );
  }

  @Mutation(() => Boolean)
  async remove(
    @Args({ name: 'userId', type: () => String }) userId: string,
    @Args({ name: 'userEmail', type: () => String }) userEmail: string,
    @Args({ name: 'id', type: () => String }) id: string,
  ): Promise<boolean> {
    return await this.postService.remove(userId, userEmail, id);
  }
}
