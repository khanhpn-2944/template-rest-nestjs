import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';

import { Post } from '../../entities/post.entity';

export default setSeederFactory(Post, async (faker: Faker) => {
  const post = new Post();
  post.title = faker.helpers.unique(faker.name.jobTitle);
  post.description = faker.lorem.paragraph();
  post.fileName = faker.system.fileName();
  return post;
});
