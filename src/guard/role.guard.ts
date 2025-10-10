import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsersService } from "src/user/user.service";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true; 

    const request = context.switchToHttp().getRequest();
    const userFromJwt = request.user; 

    if (!userFromJwt) return false;

    
    const user = await this.userService.getUserById(userFromJwt.userId);

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    
    if (!roles.includes(user.role)) {
      throw new ForbiddenException(`Access denied: Requires ${roles.join(' or ')}`);
    }

    return true;
  }
}
