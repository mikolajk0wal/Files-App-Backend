import * as mongoose from 'mongoose';

export type LoginResponse = {
  userId: mongoose.Schema.Types.ObjectId;
  login: string;
  jwt: string;
};

export type CheckMeResponse = {
  userId: mongoose.Schema.Types.ObjectId;
  login: string;
};
