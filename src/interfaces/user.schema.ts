import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Roles } from 'src/enums/role-enum';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  pwdHash: string;

  @Prop()
  name: string;

  @Prop()
  lastName: string;

  @Prop({ default: null })
  currentTokenId: string | null;

  @Prop({ default: [Roles.USER] })
  role: string[];
}

export const UserShema = SchemaFactory.createForClass(User);
