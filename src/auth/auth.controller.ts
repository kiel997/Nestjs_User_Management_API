import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Patch,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/user/jwt strategy/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return await this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const userPayload = (req as any).user;
    const user = await this.authService.getProfile(userPayload._id);

    return {
      message: 'Profile fetched successfully',
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: Request, @Body() dto: any) {
    const userPayload = (req as any).user;
    const updatedUser = await this.authService.updateProfile(
      userPayload._id,
      dto,
    );

    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteProfile(@Req() req: Request) {
    const userPayload = (req as any).user;
    await this.authService.deleteProfile(userPayload._id);

    return {
      message: 'Profile deleted successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    const userPayload = (req as any).user;
    await this.authService.logout(userPayload._id);
    return {
      message: 'Logout successful',
    };
  }
}
