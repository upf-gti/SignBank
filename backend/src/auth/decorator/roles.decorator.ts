// src/auth/decorator/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../types/database';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
