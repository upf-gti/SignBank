import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('users')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Put(':id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto
  ) {
    return this.usersService.updateUserRole(id, updateUserRoleDto.role);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
} 