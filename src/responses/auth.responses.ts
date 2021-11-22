import * as mongoose from 'mongoose';
import { UserType } from 'src/enums/user-type';

export type LoginResponse = {
  userId: mongoose.Schema.Types.ObjectId;
  login: string;
  jwt: string;
  type: UserType;
};

export type CheckMeResponse = {
  userId: mongoose.Schema.Types.ObjectId;
  login: string;
};
