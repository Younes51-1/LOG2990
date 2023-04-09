import { ApiProperty } from '@nestjs/swagger';
import { BestTime } from '@app/model/schema/best-times.schema';
import { Prop, Schema } from '@nestjs/mongoose';
import { IsNumber, IsString } from 'class-validator';

@Schema()
export class GameData {
    @ApiProperty()
    @Prop({ required: true })
    @IsString()
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    @IsNumber()
    nbDifference: number;

    @ApiProperty()
    @Prop({ required: true })
    @IsString()
    image1url: string;

    @ApiProperty()
    @Prop({ required: true })
    @IsString()
    image2url: string;

    @ApiProperty()
    @Prop({ required: true })
    @IsString()
    difficulty: string;

    @ApiProperty()
    @Prop({ required: true })
    @IsString()
    soloBestTimes: BestTime[];

    @ApiProperty()
    @Prop({ required: true })
    @IsString()
    vsBestTimes: BestTime[];

    @ApiProperty()
    _id?: string;

    @ApiProperty()
    differenceMatrix: number[][];
}
