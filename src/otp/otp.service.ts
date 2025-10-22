import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Otp } from './schema/otp.schema';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/user/schema/user.schema';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  // 🔹 Generate a random 6-digit OTP
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 🔹 Step 1: Generate and send OTP
  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    const code = this.generateCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 mins

    await this.otpModel.deleteMany({ email });
    await this.otpModel.create({ email, otp: hashedCode, expiresAt });

    // Log OTP in console instead of sending email
    console.log(
      `🔗 OTP for ${email}: ${code} (valid for 5 minutes)\n👉 Verify at: http://localhost:3000/otp/verify?email=${email}&otp=${code}`,
    );

    // Optional email sending if MailService configured
    await this.mailService.sendMail(
      email,
      'Your OTP Code',
      `Your OTP is ${code}. It expires in 5 minutes.`,
    );

    return { message: 'OTP sent successfully (check console)' };
  }

  
  async verifyOtp(dto: VerifyOtpDto) {
    const { email, otp } = dto;

    const otpRecord = await this.otpModel.findOne({ email });
    if (!otpRecord) throw new BadRequestException('Invalid OTP');

    if (otpRecord.expiresAt < new Date()) {
      await this.otpModel.deleteMany({ email });
      throw new BadRequestException('OTP expired');
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isValid) throw new BadRequestException('Incorrect OTP');

    
    const payload = { email, purpose: 'reset-password' };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '10m' });

    
    otpRecord.verified = true;
    await otpRecord.save();

    return {
      message: 'OTP verified successfully',
      accessToken,
      expiresIn: '10m',
    };
  }

  
  async resetPassword(dto: ResetPasswordDto, token: string) {
    if (!token) throw new BadRequestException('Missing access token');

    let decoded: any;
    try {
      decoded = this.jwtService.verify(token);
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }

    if (decoded.purpose !== 'reset-password')
      throw new BadRequestException('Invalid token purpose');

    const user = await this.userModel.findOne({ email: decoded.email });
    if (!user) throw new NotFoundException('User not found');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await user.save();

    await this.otpModel.deleteMany({ email: decoded.email });

    return { message: 'Password reset successfully' };
  }
}
