import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/schema/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { fullName, email, password } = dto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userModel.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const { password: _pw, ...sanitizedUser } = newUser.toObject();
    return {
      message: 'User registered successfully',
      user: sanitizedUser,
    };
  }

  async login(dto: LoginUserDto) {
    const { email, password } = dto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    const { password: _pw, ...sanitizedUser } = user.toObject();
    return {
      message: 'Login successful',
      access_token,
      user: sanitizedUser,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: any) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.email) user.email = dto.email;
    if (dto.password) user.password = await bcrypt.hash(dto.password, 10);

    await user.save();
    const { password: _pw, ...sanitizedUser } = user.toObject();
    return sanitizedUser;
  }

  async deleteProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    await this.userModel.findByIdAndDelete(userId);
    return { message: 'User deleted successfully' };
  }

  async logout(_userId: string) {
    return { message: 'User logged out successfully' };
  }
}
