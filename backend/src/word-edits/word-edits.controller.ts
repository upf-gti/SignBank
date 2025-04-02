import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { WordEditsService } from './word-edits.service';
import { CreateWordEditDto } from './dto/create-word-edit.dto';
import { UpdateWordEditDto, EditStatus } from './dto/update-word-edit.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';

@Controller('word-edits')
@UseGuards(JwtGuard)
export class WordEditsController {
  constructor(private readonly wordEditsService: WordEditsService) {}

} 