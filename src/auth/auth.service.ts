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
import { GetUserResponse } from 'src/interfaces/user';
import { resourceLimits } from 'node:worker_threads';
dotenv.config();

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

  private filter(user: User): GetUserResponse {
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
        return res.status(401).json({ message: 'Invalid login data!' });
      }

      const token = await this.createToken(await this.generateToken(user));

      return res
        .cookie('jwt', token.accessToken, {
          secure: false,
          domain: 'localhost',
          httpOnly: true,
          maxAge: Date.now() + token.expiresIn,
        })
        .json({ ok: true, user: this.filter(user) });
    } catch (e) {
      return res.json({ error: e.message });
    }
  }

  async logout(user: User, res: Response): Promise<any> {
    try {
      user.currentTokenId = null;
      await user.save();

      console.log(user);

      res.clearCookie('jwt', {
        secure: false,
        domain: 'localhost',
        httpOnly: true,
      });

      return res.json({ ok: true });
    } catch (e) {
      return res.json({ error: e.message });
    }
  }
}
