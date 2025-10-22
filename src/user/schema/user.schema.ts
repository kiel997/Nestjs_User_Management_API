import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ trim: true })
  phoneNumber?: string;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: string;

  // 🔹 OTP for password reset
  @Prop({ trim: true })
  resetOtp?: string;

  @Prop()
  resetOtpExpires?: Date;

  // 🔹 JWT-based reset token (for final password reset confirmation)
  @Prop({ trim: true })
  resetToken?: string;

  @Prop()
  resetTokenExpires?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});
