import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DeleteUserResponse,
  GetAllUsersResponse,
  UpdateUserResponse,
} from 'src/interfaces/user';
import { User } from 'src/interfaces/user.schema';
import { GetUserDto } from 'src/user/dto/get-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-uder.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  private filter(user: User): GetUserDto {
    const { role, email, name, lastName, _id } = user;
    return { role, email, name, lastName, id: _id };
  }

  async getUsers(): Promise<GetAllUsersResponse> {
    const users = (await this.userModel.find({})).map((user) => {
      return this.filter(user);
    });

    return { ok: true, users };
  }

  async deleteUser(id: string): Promise<DeleteUserResponse> {
    try {
      const deletedUser = await this.userModel.deleteOne({ _id: id });
      if (deletedUser.deletedCount === 1) {
        return { ok: true };
      } else {
        return { ok: false };
      }
    } catch (e) {
      return { ok: false };
    }
  }

  async updateUser(
    id: string,
    updatedUser: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    try {
      const user = await this.userModel.findOne({ _id: id });

      if (!user) {
        return { ok: false, message: 'User not found' };
      }

      for (const property in updatedUser) {
        if (!updatedUser[property]) {
          continue;
        }
        user[property] = updatedUser[property];
      }

      await user.save();

      return { ok: true, message: 'User updated successfully' };
    } catch (e) {
      if (e.reason) {
        return { ok: false, message: e.reason.message };
      }

      return { ok: false, message: e.message };
    }
  }
}
