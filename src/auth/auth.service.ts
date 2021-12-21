import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CheckMeResponse, LoginResponse } from 'src/responses/auth.responses';
import { UserInterface } from 'src/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<UserInterface | null> {
    const user = await this.userModel.findOne({ login });
    if (!user) {
      return null;
    }
    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
    if (user && passwordsMatch) {
      const { _id, login, type, createdAt, updatedAt } = user as any;
      return {
        _id,
        login,
        type,
        createdAt,
        updatedAt,
      };
    }
    return null;
  }

  login({
    login,
    _id,
    type,
    createdAt,
    updatedAt,
  }: UserInterface): LoginResponse {
    const payload = { login, _id, type, createdAt, updatedAt };
    return {
      jwt: this.jwtService.sign(payload),
      login,
      userId: _id,
      type
    };
  }

  async checkMe(req: any): Promise<CheckMeResponse> {
    const bearer = req.headers.authorization;
    const user = this.jwtService.verify(bearer.slice(7)) ?? null;
    return {
      userId: user?._id,
      login: user.login,
      type: user.type
    };
  }
}
