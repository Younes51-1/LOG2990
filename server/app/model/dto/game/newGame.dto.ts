import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class NewGame {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    image1: string;

    @ApiProperty()
    @IsString()
    image2: string;

    @ApiProperty()
    @IsNumber()
    nbDifference: number;

    @ApiProperty()
    differenceMatrix: number[][];
}
