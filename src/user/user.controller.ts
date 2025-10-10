/* eslint-disable prettier/prettier */
import { 
  Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request, 
  Req
} from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/user/jwt strategy/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get()
  async findAll() {
    return this.usersService.getUsers();
  }

  
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user._id; 
    return this.usersService.updateProfile(userId, updateUserDto);
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return this.usersService.getUserByEmail(email);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
