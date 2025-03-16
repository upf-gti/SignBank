import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  UseGuards, 
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { WordEditsService } from './word-edits.service';
import { CreateWordEditDto } from './dto/create-word-edit.dto';
import { UpdateWordEditDto, EditStatus } from './dto/update-word-edit.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('word-edits')
@UseGuards(JwtGuard)
export class WordEditsController {
  constructor(private readonly wordEditsService: WordEditsService) {}

  @Post()
  create(
    @GetUser('id') userId: number,
    @Body() createWordEditDto: CreateWordEditDto
  ) {
    return this.wordEditsService.create(userId, createWordEditDto);
  }

  @Get()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  findAll(@Query('status') status?: string) {
    const editStatus = status as EditStatus;
    return this.wordEditsService.findAll(editStatus);
  }

  @Get('user')
  findUserEdits(@GetUser('id') userId: number) {
    return this.wordEditsService.findUserEdits(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wordEditsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWordEditDto: UpdateWordEditDto
  ) {
    return this.wordEditsService.updateStatus(id, updateWordEditDto);
  }
} 