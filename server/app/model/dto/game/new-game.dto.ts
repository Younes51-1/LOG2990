import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class NewGame {
    @ApiProperty({
        minimum: 1,
        maximum: 30,
    })
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    image1: string;

    @ApiProperty()
    @IsString()
    image2: string;

    @ApiProperty({
        minimum: 3,
        maximum: 9,
    })
    @IsNumber()
    nbDifference: number;

    @ApiProperty()
    differenceMatrix: number[][];
}
