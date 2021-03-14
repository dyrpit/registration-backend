export type RegisterUserResponse =
  | {
      id: string;
      email: string;
    }
  | {
      message: string;
    };

export type GetUserResponse = {
  name: string;
  lastName: string;
  role: string[];
  email: string;
};
