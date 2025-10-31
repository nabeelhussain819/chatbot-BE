/* eslint-disable prettier/prettier */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { MailerService } from 'src/mailer/mailer.service';
import { Card } from 'src/schemas/card.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { decrypt, encrypt } from 'src/utils/crypto.utils';
@Injectable()
export class CardService {
  constructor(
    private readonly mailer: MailerService,
    @Inject('TENANT_CONNECTION') private readonly tenantConnection: Connection,
    @Inject('TENANT_MODELS')
    private readonly models: { CardModel: Model<Card> },
  ) {}

    private getUserModel(): Model<User> {
      if (this.tenantConnection.models['User']) {
        return this.tenantConnection.models['User'];
      }
      return this.tenantConnection.model<User>('User', UserSchema);
    }
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
    const UserModel = this.getUserModel();
    const user = await UserModel.findOne({ tenantId: tenantId });
    const userData = user?.toObject();

    const CardModel = this.models.CardModel;

    const encryptedCard = {
      ...card,
      card_number: encrypt(card.card_number),
      cvv: encrypt(card.cvv),
      expiry_date: encrypt(card.expiry_date),
    };

    const newCard = new CardModel(encryptedCard);
    if (userData?.email) {
      const html = `
      <h2>Your Card Details</h2>
      <p>Your Card has been added successfully.</p>
      <p>Card Name: **** **** **** ${card.card_holder}</p>
      <p>Card Number: **** **** **** ${card.card_number.slice(-4)}</p>
      <br />
      <p>added at: ${new Date(newCard?.createdAt).toLocaleDateString()}</p>
    `;
      await this.mailer.sendMail(userData.email, 'Subscription Details', html);
    }
    return newCard.save();
  }

  async getCards(tenantId: string) {
    if (!tenantId) throw new NotFoundException('Tenant ID missing in request');

    const CardModel = this.models.CardModel;
    const cards = await CardModel.find({ tenantId });
    const safeCards = cards.map((card: any) => {
      const cardNumber = decrypt(card.card_number);
      const expiryDate = decrypt(card.expiry_date);

      return {
        ...card.toObject(),
        card_number: `**** **** **** ${cardNumber.slice(-4)}`,
        expiry_date: expiryDate,
      };
    });
    return safeCards;
  }
  async updateCard(cardId: string, card: any) {
    const CardModel = this.models.CardModel;
    if (card.cvv) {
      card.cvv = encrypt(card.cvv);
    }
    if (card.card_number) {
      card.card_number = encrypt(card.card_number);
    }
    if (card.expiry_date) {
      card.expiry_date = encrypt(card.expiry_date);
    }
    const updatedCard = await CardModel.findOneAndUpdate({ _id: cardId }, card);
    return updatedCard;
  }
  async deleteCard(cardId: string) {
    const deletedCard = await this.models.CardModel.findOneAndDelete({
      _id: cardId,
    });
    if (!deletedCard) {
      throw new NotFoundException('Card not found.');
    }

    return { message: 'Card deleted successfully.' };
  }
}
