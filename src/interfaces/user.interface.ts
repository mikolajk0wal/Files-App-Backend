import * as mongoose from 'mongoose';
import { UserType } from 'src/enums/user-type';

export interface UserInterface {
  _id: mongoose.Schema.Types.ObjectId;
  login: string;
  type: UserType;
  createdAt: string;
  updatedAt: string;
}
