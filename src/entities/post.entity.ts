import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Base } from './base.entity';
import { Tag } from './tag.entity';
import { User } from './user.entity';
import { EntityConstant } from '../shared/constants/entity.constant';

@Entity('posts')
@Index(['title'], { unique: true, where: 'deleted IS NULL' })
export class Post extends Base {
  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Tag, (tag) => tag.post)
  tags: Tag[];

  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: false,
  })
  userId: string;

  @Column({
    type: 'varchar',
    name: 'title',
    length: EntityConstant.shortLength,
    nullable: false,
    unique: true,
  })
  title: string;

  @Column({
    type: 'varchar',
    name: 'description',
    length: EntityConstant.longLength,
    nullable: true,
  })
  description: string;

  @Column({
    type: 'varchar',
    name: 'file_name',
    length: EntityConstant.shortLength,
    nullable: true,
  })
  fileName: string;
}
