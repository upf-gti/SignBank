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
    @Body() createWordEditDto: { wordId: number; editData: any; comment: string }
  ) {
    return this.wordEditsService.createWordEdit(
      createWordEditDto.wordId,
      userId,
      createWordEditDto.editData,
      createWordEditDto.comment
    );
  }

  @Get('word/:wordId')
  findWordEdits(@Param('wordId', ParseIntPipe) wordId: number) {
    return this.wordEditsService.getWordEdits(wordId);
  }

  @Get('pending')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  findPendingEdits() {
    return this.wordEditsService.getPendingEdits();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wordEditsService.getEditById(id);
  }

  @Patch(':id/approve')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  approveEdit(@Param('id', ParseIntPipe) id: number) {
    return this.wordEditsService.approveEdit(id);
  }

  @Patch(':id/reject')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  rejectEdit(
    @Param('id', ParseIntPipe) id: number,
    @Body('denyReason') denyReason: string
  ) {
    return this.wordEditsService.rejectEdit(id, denyReason);
  }
} 