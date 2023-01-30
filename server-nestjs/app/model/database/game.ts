import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { BestTime } from '../schema/bestTimes.schema';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    nbDifference: number;

    @ApiProperty()
    @Prop({ required: true })
    differenceMatrix: number[][];

    @ApiProperty()
    @Prop({ required: true })
    soloBestTimes: BestTime[];

    @ApiProperty()
    @Prop({ required: true })
    vsBestTimes: BestTime[];

    @ApiProperty()
    _id?: string;
}

export const gameSchema = SchemaFactory.createForClass(Game);
