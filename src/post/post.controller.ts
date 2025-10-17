import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/user/jwt strategy/jwt-auth.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createPost(@Body() body: any, @Req() req) {
    return this.postService.createPost(body, req.user._id);
  }

  @Get()
  getAllPosts() {
    return this.postService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updatePost(@Param('id') id: string, @Body() body: any, @Req() req) {
    return this.postService.updatePost(id, body, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deletePost(@Param('id') id: string, @Req() req) {
    return this.postService.deletePost(id, req.user._id);
  }
}
