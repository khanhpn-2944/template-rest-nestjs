import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';

import { Tag } from '../../entities/tag.entity';

export default setSeederFactory(Tag, async (faker: Faker) => {
  const tag = new Tag();
  tag.name = faker.commerce.product();
  return tag;
});
