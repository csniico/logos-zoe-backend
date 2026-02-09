import { Injectable } from '@nestjs/common';
import { IsMongoId } from 'class-validator';
import type { ObjectId } from 'mongoose';

@Injectable()
export class IdParamsDto {
  @IsMongoId()
  id: ObjectId;
}
