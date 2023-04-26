import * as bcrypt from 'bcrypt';

import { AppConStant } from '../constants/app.constant';

export const hash = async (str: string): Promise<string> => {
  const salt = await bcrypt.genSalt(AppConStant.saltOrRounds);

  return await bcrypt.hash(str, salt);
};

export const compare = async (str, hashed): Promise<boolean> => {
  return await bcrypt.compare(str, hashed);
};
