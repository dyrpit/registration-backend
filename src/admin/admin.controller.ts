import {
  Controller,
  Delete,
  Get,
  Inject,
  UseGuards,
  Query,
  Patch,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import {
  DeleteUserResponse,
  GetAllUsersResponse,
  UpdateUserResponse,
} from 'src/interfaces/user';
import { UpdateUserDto } from 'src/user/dto/update-uder.dto';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(@Inject(AdminService) private adminService: AdminService) {}

  @UseGuards(AuthGuard('jwt'), AuthorizationGuard)
  @Roles('admin')
  @Get('/all-users')
  getAllusers(): Promise<GetAllUsersResponse> {
    return this.adminService.getUsers();
  }

  @UseGuards(AuthGuard('jwt'), AuthorizationGuard)
  @Roles('admin')
  @Delete('delete-user')
  deleteUser(@Query('id') id: string): Promise<DeleteUserResponse> {
    return this.adminService.deleteUser(id);
  }

  @UseGuards(AuthGuard('jwt'), AuthorizationGuard)
  @Roles('admin')
  @Patch('update-user')
  updateUser(
    @Body() updatedUser: UpdateUserDto,
    @Query('id') id: string,
  ): Promise<UpdateUserResponse> {
    return this.adminService.updateUser(id, updatedUser);
  }
}
