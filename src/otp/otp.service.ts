import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Otp } from './schema/otp.schema';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from 'src/user/schema/user.schema';
import { InjectModel as InjectUserModel } from '@nestjs/mongoose';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    @InjectUserModel(User.name) private readonly userModel: Model<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendForgotPasswordOtp({ email }: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await this.otpModel.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await this.mailService.sendOtpEmail(email, otp);
    return { message: 'OTP sent to your email' };
  }

  async verifyOtp({ email, otp }: VerifyOtpDto) {
    const record = await this.otpModel.findOne({ email }).sort({ createdAt: -1 });
    if (!record) throw new BadRequestException('OTP not found');

    if (record.expiresAt < new Date()) throw new BadRequestException('OTP expired');

    const valid = await bcrypt.compare(otp, record.otpHash);
    if (!valid) throw new BadRequestException('Invalid OTP');

    record.verified = true;
    await record.save();

    const accessToken = this.jwtService.sign({ email }, { expiresIn: '15m' });

    return { message: 'OTP verified', accessToken };
  }

  async resetPassword({ newPassword, accessToken }: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(accessToken);
      const user = await this.userModel.findOne({ email: payload.email });
      if (!user) throw new NotFoundException('User not found');

      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      await user.save();

      return { message: 'Password reset successful' };
    } catch (err) {
      throw new BadRequestException('Invalid or expired access token');
    }
  }
}
