/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from 'src/utils/card.dto';

@Controller('card')
export class CardController {
  constructor(private cardService: CardService) {}

  @Get('my-cards')
  getCards(@Req() req) {
    const tenantId = req.headers['x-tenant-id'];
    return this.cardService.getCards(tenantId);
  }

  @Post('add-card')
  addCard(
    @Req() req,
    @Body() createCardDto: CreateCardDto,
  ) {
     const tenantId = req.headers['x-tenant-id'];
     const payload = { ...createCardDto, tenantId };
    return this.cardService.addCard(payload);
  }
}
