import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AllowListDocument = AllowList & Document;

@Schema({ timestamps: true })
export class AllowList {
  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ default: null })
  deleted_at?: Date;
}

export const AllowListSchema = SchemaFactory.createForClass(AllowList);

AllowListSchema.index(
  { phone: 1 },
  {
    partialFilterExpression: { deleted_at: null },
  },
);
