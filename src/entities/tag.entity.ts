import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Base } from './base.entity';
import { Post } from './post.entity';
import { EntityConstant } from '../shared/constants/entity.constant';

@Entity('tags')
export class Tag extends Base {
  @ManyToOne(() => Post, (post) => post.tags)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({
    type: 'uuid',
    name: 'post_id',
    nullable: false,
  })
  postId: string;

  @Column({
    type: 'varchar',
    name: 'name',
    length: EntityConstant.shortLength,
    nullable: false,
  })
  name: string;
}
