import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { User } from 'src/interfaces/user.schema';
import { Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv';
import { InjectModel } from '@nestjs/mongoose';
dotenv.config();

export interface JwtPayload {
  id: string;
}

const cookieExtractor = (req: any): null | string => {
  return req && req.cookies ? req.cookies?.jwt ?? null : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.SECRET_JWT,
    });
  }

  async validate(payload: JwtPayload, done: (err, user) => void) {
    if (!payload || !payload.id) {
      return done(new UnauthorizedException(), false);
    }

    const user = await this.userModel.findOne({ currentTokenId: payload.id });

    if (!user) {
      return done(new UnauthorizedException(), false);
    }

    done(null, user);
  }
}
