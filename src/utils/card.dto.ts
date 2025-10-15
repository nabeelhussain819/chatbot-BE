/* eslint-disable prettier/prettier */
// src/card/dto/create-card.dto.ts
import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  card_holder: string;

  @IsString()
  @Matches(/^\d{16}$/, { message: 'Card number must be 16 digits' })
  card_number: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, { message: 'Invalid expiry date (MM/YY)' })
  expiry_date: string;

  @IsString()
  @Length(3, 4, { message: 'CVV must be 3 or 4 digits' })
  cvv: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  zip_code: string;

}
