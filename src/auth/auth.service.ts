import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginPayload } from 'src/interfaces/login-payload.interface';
import { CheckMeResponse, LoginResponse } from 'src/responses/auth.responses';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<LoginPayload | null> {
    const user = await this.userModel.findOne({ login });
    if (!user) {
      return null;
    }
    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
    if (user && passwordsMatch) {
      const { _id, login } = user;
      return {
        _id,
        login,
      };
    }
    return null;
  }

  login(user: any): LoginResponse {
    const payload = { login: user.login, _id: user._id };
    return {
      jwt: this.jwtService.sign(payload),
      userId: user._id,
      login: user.login,
    };
  }

  async checkMe(req: any): Promise<CheckMeResponse> {
    const bearer = req.headers.authorization;
    const user = this.jwtService.verify(bearer.slice(7)) ?? null;
    return {
      userId: user?._id,
      login: user.login,
    };
  }
}
