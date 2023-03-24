import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type HistoryDocument = GameHistory & Document;

@Schema()
export class GameHistory {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    startTime: number;

    @ApiProperty()
    @Prop({ required: true })
    endTime: number;

    @ApiProperty()
    @Prop({ required: true })
    username1: string;

    @ApiProperty()
    @Prop({ required: false })
    username2: string;

    @ApiProperty()
    @Prop({ required: true })
    gameMode: string;

    @ApiProperty()
    @Prop({ required: false })
    abandonned: string;

    @ApiProperty()
    @Prop({ required: false })
    winner: string;

    @ApiProperty()
    _id?: string;
}

export const gameHistorySchema = SchemaFactory.createForClass(GameHistory);
