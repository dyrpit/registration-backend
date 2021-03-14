import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserObj } from 'src/decorators/user-obj.decorator';
import { GetUserResponse, RegisterUserResponse } from 'src/interfaces/user';
import { User } from 'src/interfaces/user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(@Inject(UserService) private userService: UserService) {}

  @Get('/')
  getUsers(): null {
    return null;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/profile')
  getOneUser(@UserObj() user: User): Promise<GetUserResponse> {
    return this.userService.getOne(user);
  }

  @Post('/register')
  registerUser(@Body() user: RegisterUserDto): Promise<RegisterUserResponse> {
    return this.userService.createUser(user);
  }
}
