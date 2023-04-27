import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';

import { User } from '../../entities/user.entity';
import { hash } from '../../shared/utils/bcrypt.util';

export default setSeederFactory(User, async (faker: Faker) => {
  const user = new User();
  user.username = faker.internet.userName();
  user.password = await hash(faker.internet.password());
  user.email = faker.internet.email();
  user.code = faker.random.alphaNumeric(5);
  return user;
});
