import { randomBytes } from 'crypto';

import { AppConStant } from '../constants/app.constant';

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getKey = (obj: object, value: any): string => {
  return Object.keys(obj).find((key) => obj[key] === value);
};

export const getObjectByKey = (obj: object, key: string) => {
  const newObject: any[] = [];
  JSON.stringify(obj, (_, nestedValue) => {
    if (nestedValue && nestedValue[key]) {
      newObject.push(nestedValue);
    }
    return nestedValue;
  });
  return newObject;
};

export const getObjectByValue = (obj: object, value: string) => {
  let newObject: any;
  JSON.stringify(obj, (_, nestedValue) => {
    if (nestedValue && getKey(nestedValue, value)) {
      newObject = nestedValue;
    }
    return nestedValue;
  });
  return newObject;
};

export const generateToken = () => {
  return randomBytes(24).toString('hex' as BufferEncoding);
};

export const getFileType = (fileType: string): string => {
  return getKey(AppConStant.fileType, fileType);
};
