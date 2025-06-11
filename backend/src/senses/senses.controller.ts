import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SensesService } from './senses.service';
import { UpdateSenseDto, ReorderSenseDto } from './dto/update-sense.dto';

@Controller('senses')
export class SensesController {
  constructor(private readonly sensesService: SensesService) {}

  @Post(':glossDataId')
  async addSense(
    @Param('glossDataId') glossDataId: string,
    @Body() data: UpdateSenseDto
  ) {
    return this.sensesService.addSense(glossDataId, data);
  }

  @Put(':glossDataId/:senseId')
  async updateSense(
    @Param('glossDataId') glossDataId: string,
    @Param('senseId') senseId: string,
    @Body() data: UpdateSenseDto
  ) {
    return this.sensesService.updateSense(glossDataId, senseId, data);
  }

  @Put(':glossDataId/reorder')
  async reorderSense(
    @Param('glossDataId') glossDataId: string,
    @Body() data: ReorderSenseDto
  ) {
    return this.sensesService.updateSensePriority(glossDataId, data);
  }

  @Delete(':glossDataId/:senseId')
  async deleteSense(
    @Param('glossDataId') glossDataId: string,
    @Param('senseId') senseId: string
  ) {
    return this.sensesService.deleteSense(glossDataId, senseId);
  }
} 