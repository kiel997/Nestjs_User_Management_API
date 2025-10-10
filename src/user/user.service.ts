/* eslint-disable prettier/prettier */
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  
  async createUser(dto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = new this.userModel({ ...dto, password: hashedPassword });
    const savedUser = await newUser.save();

    const sanitizedUser = savedUser.toObject?.() ?? savedUser;
    delete (sanitizedUser as any)?.password;

    return { message: 'User created successfully', user: sanitizedUser };
  }

 
  async getUsers() {
    return this.userModel.find().select('-password');
  }

  
  async getUserById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserByUsername(username: string) {
    const user = await this.userModel.findOne({ username }).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  
  async updateUser(id: string, dto: UpdateUserDto) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-password');

    if (!updatedUser) throw new NotFoundException('User not found');
    return { message: 'User updated successfully', user: updatedUser };
  }

  // ✅ Delete user
  async deleteUser(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const allowedUpdates: Partial<UpdateUserDto> = {};
    if (dto.fullName !== undefined) allowedUpdates.fullName = dto.fullName;
    if (dto.phoneNumber !== undefined) allowedUpdates.phoneNumber = dto.phoneNumber;

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, allowedUpdates, { new: true })
      .select('-password');

    if (!updatedUser) throw new NotFoundException('User not found');
    return { message: 'Profile updated successfully', user: updatedUser };
  }
}
