import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserObj } from 'src/decorators/user-obj.decorator';
import {
  GetUserResponse,
  RegisterUserResponse,
  UpdateUserResponse,
} from 'src/interfaces/user';
import { User } from 'src/interfaces/user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-uder.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(@Inject(UserService) private userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/profile')
  getOneUser(@UserObj() user: User): Promise<GetUserResponse> {
    return this.userService.getOne(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/edit')
  updateUser(
    @Body() updatedUser: UpdateUserDto,
    @UserObj() user: User,
  ): Promise<UpdateUserResponse> {
    return this.userService.updateUser(user, updatedUser);
  }

  @Post('/register')
  registerUser(@Body() user: RegisterUserDto): Promise<RegisterUserResponse> {
    return this.userService.createUser(user);
  }
}
