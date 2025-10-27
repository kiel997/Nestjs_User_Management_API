import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('forgotten-password')
  forgottenPassword(@Body() dto: ForgotPasswordDto) {
    return this.otpService.sendForgotPasswordOtp(dto);
  }

  @Post('verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.otpService.verifyOtp(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.otpService.resetPassword(dto);
  }
}
