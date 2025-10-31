/* eslint-disable prettier/prettier */
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsHexColor,
  IsBoolean,
} from 'class-validator';

export class CreateChatbotDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  cardId: string;

  @IsNotEmpty()
  @IsString()
  packageId: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsNotEmpty()
  @IsString()
  knowledgeBaseId?: string;

  @IsNotEmpty()
  @IsString()
  position?: string;

  @IsNotEmpty()
  @IsString()
  default_message?: string;

  @IsNotEmpty()
  @IsString()
  sub_title?: string;

  @IsNotEmpty()
  @IsString()
  is_avatar?: string;

  @IsOptional()
  file?: File;
}

export class UpdateChatbotStatusDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
export class DeleteChatbotStatusDto {
  @IsNotEmpty()
  @IsString()
  id: string;

    @IsNotEmpty()
  @IsString()
  planId: string;
     @IsNotEmpty()
  @IsString()
  knowledgeId: string;
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
