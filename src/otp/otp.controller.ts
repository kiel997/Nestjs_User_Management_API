import {
  Controller,
  Post,
  Body,
  Query,
  Req,
  Headers,
  Get,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.otpService.forgotPassword(dto);
  }

  @Get('verify')
  async verifyOtpFromLink(@Query('email') email: string, @Query('otp') otp: string) {
  const verifyOtpDto = { email, otp };
  return this.otpService.verifyOtp(verifyOtpDto);
}

  @Post('verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.otpService.verifyOtp(dto);
  }

  
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1]; 
    return this.otpService.resetPassword(dto, token);
  }
}
