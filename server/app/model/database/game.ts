import { BestTime } from '@app/model/schema/best-time.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
// TODO: find a way to import this without using a relative path
// eslint-disable-next-line no-restricted-imports

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
    soloBestTimes: BestTime[];

    @ApiProperty()
    @Prop({ required: true })
    vsBestTimes: BestTime[];

    @ApiProperty()
    _id?: string;
}

export const gameSchema = SchemaFactory.createForClass(Game);
