import { GetUserDto } from 'src/user/dto/get-user.dto';

export type RegisterUserResponse =
  | {
      ok: boolean;
      id: string;
      email: string;
    }
  | {
      ok: boolean;
      message: string;
    };

export type GetUserResponse = {
  ok: boolean;
  user: GetUserDto;
};
