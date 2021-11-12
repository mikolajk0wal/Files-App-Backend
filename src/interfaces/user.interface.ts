import * as mongoose from 'mongoose';

export interface UserInterface {
  _id: mongoose.Schema.Types.ObjectId;
  login: string;
  createdAt: string;
  updatedAt: string;
}
