import * as mongoose from 'mongoose';

export interface LoginPayload {
  login: string;
  _id: mongoose.Schema.Types.ObjectId;
}
