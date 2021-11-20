import { UserInterface } from "src/interfaces/user.interface";

export type CreateUserResponse = UserInterface;
export type FindUserResponse = UserInterface;

export type FindManyUsersResponse = {
  users: UserInterface[];
  count: number;
  requiredPages: number;
  page: number;
};
