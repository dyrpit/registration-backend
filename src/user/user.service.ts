import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetUserResponse, RegisterUserResponse } from 'src/interfaces/user';
import { User } from 'src/interfaces/user.schema';
import { hashPassword } from 'src/utils/hashPassword';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  private filter(user: User): GetUserResponse {
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

      return { id: _id, email };
    } catch (e) {
      if (e.errors) {
        const { pwdHash, email } = e.errors;

        const { message } = pwdHash || email;

        return { message };
      } else if (e.code === 11000) {
        return { message: 'Email already registered' };
      }
    }
  }

  async getOne(user: User): Promise<GetUserResponse> {
    return this.filter(user);
  }

  async getAllUsers(): Promise<null> {
    return null;
  }
}
