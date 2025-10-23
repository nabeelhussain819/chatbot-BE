/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, IsOptional, IsHexColor } from 'class-validator';

export class CreateChatbotDto {

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  cardId: string;

  @IsNotEmpty()
  @IsString()
  url?: string;
  
  @IsNotEmpty()
  @IsString()
  planId: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  color?: string;


}

export class UpdateChatbotStatusDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  tenantId: string;
}

export class ResubscribeChatbotDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  tenantId: string;
}


export class GetChatbotDto {
  @IsNotEmpty()
  @IsString()
  tenantId: string;
}
