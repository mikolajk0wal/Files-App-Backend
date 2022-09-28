import { UserInterface } from 'src/interfaces/user.interface';
import { FindFilesResponse } from './files.responses';

export type CreateUserResponse = UserInterface;
export type FindUserResponse = UserInterface;

export type FindUserWithFiles = {
  filesData: FindFilesResponse;
  user: UserInterface;
};

export type FindManyUsersResponse = {
  users: UserInterface[];
  count: number;
  requiredPages: number;
  page: number;
};
