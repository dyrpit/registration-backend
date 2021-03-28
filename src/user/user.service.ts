import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetUserResponse, RegisterUserResponse } from 'src/interfaces/user';
import { User } from 'src/interfaces/user.schema';
import { hashPassword } from 'src/utils/hashPassword';
import { GetUserDto } from './dto/get-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  private filter(user: User): GetUserDto {
    const { role, email, name, lastName } = user;

    return { email, role, name, lastName };
  }

  async createUser(user: RegisterUserDto): Promise<RegisterUserResponse> {
    const { email, password, name, lastName } = user;

    try {
      const newUser = await this.userModel.create({
        email,
        pwdHash: hashPassword(password),
        name,
        lastName,
      });

      const { _id } = newUser;

      return { ok: true, id: _id, email };
    } catch (e) {
      if (e.errors) {
        const { pwdHash, email } = e.errors;

        const { message } = pwdHash || email;

        return { ok: false, message };
      } else if (e.code === 11000) {
        return { ok: false, message: 'Email already registered' };
      }
    }
  }

  async getOne(user: User): Promise<GetUserResponse> {
    return { ok: true, user: this.filter(user) };
  }

  async getAllUsers(): Promise<null> {
    return null;
  }
}
