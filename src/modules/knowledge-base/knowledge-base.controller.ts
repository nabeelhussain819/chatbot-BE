/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Req() req,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const tenantId = req.headers['x-tenant-id'];
    const data = { ...body, tenantId };
    return this.kbService.createOrUpdate(data, file);
  }

  @Get('my-knowledge-base')
  async findMyKnowledgeBase(@Req() req) {
    const tenantId = req.headers['x-tenant-id'];
    return this.kbService.findByTenant(tenantId);
  }

  @Delete('/:knowledgeBaseId')
  async delete(@Param('knowledgeBaseId') knowledgeBaseId: string) {
    return this.kbService.delete(knowledgeBaseId);
  }

  @Post('/update-chatbot')
  async updateByChatbot(@Body() body: any) {
    return this.kbService.updateByChatbot(body);
  }
    @Put('/update/:knowledgeBaseId')
  async update(@Param('knowledgeBaseId') knowledgeBaseId: string,@Body() body: any) {
    return this.kbService.update(knowledgeBaseId,body);
  }
}
