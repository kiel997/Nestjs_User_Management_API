import { ForbiddenException } from "@nestjs/common";

export class RoleException extends ForbiddenException {
    constructor(role: string) {
        super(`You don't the required role ${role} `);
    }
}
