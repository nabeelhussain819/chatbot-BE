/* eslint-disable prettier/prettier */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Card } from 'src/schemas/card.schema';

@Injectable()
export class CardService {
  constructor(
    @Inject('TENANT_MODELS')
    private readonly models: { CardModel: Model<Card> },
  ) {}

  /** Add new card for a tenant */
  async addCard(card: {
    card_holder: string;
    card_number: string;
    expiry_date: string;
    cvv: string;
    country: string;
    zip_code: string;
    tenantId: string;
  }) {
    const { tenantId } = card;
    if (!tenantId) throw new NotFoundException('Tenant ID missing in request');

    // Create or get tenant-specific model
    const CardModel = this.models.CardModel;
    const newCard = new CardModel(card);
    return newCard.save();
  }

  /** Get cards for a tenant */
  async getCards(tenantId: string) {
    if (!tenantId) throw new NotFoundException('Tenant ID missing in request');

    const CardModel = this.models.CardModel;
    const cards = await CardModel.find({ tenantId });
    return cards;
  }
}
