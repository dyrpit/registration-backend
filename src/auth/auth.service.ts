import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';
import { User } from 'src/interfaces/user.schema';
import { hashPassword } from 'src/utils/hashPassword';
import { AuthLoginDto } from './dto/auth-login.dto';
import { v4 as uuid } from 'uuid';
import { sign } from 'jsonwebtoken';
import { JwtPayload } from './jwt.strategy';
import * as dotenv from 'dotenv';
import { GetUserDto } from 'src/user/dto/get-user.dto';
dotenv.config();

const mode =
  process.env.NODE_ENV === 'production' ? process.env.NODE_ENV : 'development';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  private createToken(
    currentTokenId: string,
  ): { accessToken: string; expiresIn: number } {
    const payload: JwtPayload = { id: currentTokenId };
    const expiresIn = 60 * 60 * 24;

    const accessToken = sign(payload, process.env.SECRET_JWT);

    return {
      accessToken,
      expiresIn,
    };
  }

  private filter(user: User): GetUserDto {
    const { role, email, name, lastName } = user;

    return { email, role, name, lastName };
  }

  private async generateToken(user: User): Promise<string> {
    let token;
    let userWithThisToken = null;
    do {
      token = uuid();
      userWithThisToken = await this.userModel.findOne({
        currentTokenId: token,
      });
    } while (!!userWithThisToken);

    user.currentTokenId = token;
    await user.save();

    return token;
  }

  async login(req: AuthLoginDto, res: Response): Promise<any> {
    try {
      const user = await this.userModel.findOne({
        email: req.email,
        pwdHash: hashPassword(req.password),
      });

      if (!user) {
        return res
          .status(401)
          .json({ ok: false, message: 'Invalid login data!' });
      }

      const token = await this.createToken(await this.generateToken(user));

      return res
        .status(200)
        .cookie('jwt', token.accessToken, {
          secure: false,
          // domain: mode === 'development' ? 'localhost' : process.env.DOMAIN,
          domain: process.env.DOMAIN,
          httpOnly: true,
          maxAge: Date.now() + token.expiresIn,
        })
        .json({ ok: true, user: this.filter(user) });
    } catch (e) {
      return res.status(500).json({ ok: false, message: e.message });
    }
  }

  async logout(user: User, res: Response): Promise<any> {
    try {
      user.currentTokenId = null;
      await user.save();

      res.clearCookie('jwt', {
        secure: false,
        // domain: mode === 'development' ? 'localhost' : process.env.DOMAIN,
        domain: process.env.DOMAIN,
        httpOnly: true,
      });

      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ ok: false, message: e.message });
    }
  }
}
