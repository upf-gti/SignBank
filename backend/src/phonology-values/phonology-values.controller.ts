import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { PhonologyValuesService } from './phonology-values.service';
import { CreatePhonologyValueDto } from './dto/create-phonology-value.dto';
import { UpdatePhonologyValueDto } from './dto/update-phonology-value.dto';
import { QueryPhonologyValuesDto } from './dto/query-phonology-values.dto';

@Controller('phonology-values')
export class PhonologyValuesController {
  constructor(private readonly phonologyValuesService: PhonologyValuesService) {}

  @Get()
  findAll(@Query() query: QueryPhonologyValuesDto) {
    return this.phonologyValuesService.findAll(query);
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreatePhonologyValueDto) {
    return this.phonologyValuesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdatePhonologyValueDto) {
    return this.phonologyValuesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Query('confirmCode') confirmCode?: string) {
    return this.phonologyValuesService.remove(id, confirmCode);
  }
}
