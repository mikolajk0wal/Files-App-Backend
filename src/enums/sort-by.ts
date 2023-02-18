import { FileSchema } from '../files/schema/file.schema';
import { UserSchema } from '../users/schemas/user.schema';

export const fileSortProperties = Object.keys(FileSchema.paths);
export type FilesSortByProperty = typeof fileSortProperties[number];

export const userSortProperties = Object.keys(UserSchema.paths);
export type UsersSortByProperty = typeof userSortProperties[number];
