import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schema/post.schema';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  // ✅ Create a post
  async createPost(data: any, userId: string) {
    const post = new this.postModel({ ...data, author: userId });
    return post.save();
  }

  // ✅ Update post (only the owner)
  async updatePost(id: string, data: any, userId: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');

    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to edit this post');
    }

    Object.assign(post, data);
    return post.save();
  }

  // ✅ Delete post (only the owner)
  async deletePost(id: string, userId: string) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    await post.deleteOne();
    return { message: 'Post deleted successfully' };
  }

  // ✅ Find all posts
  async findAll() {
    return this.postModel.find().populate('author', 'email');
  }
}
