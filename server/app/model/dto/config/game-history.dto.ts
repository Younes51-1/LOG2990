import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class GameHistory {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    startTime: number;

    @ApiProperty()
    @IsNumber()
    endTime: string;

    @ApiProperty()
    @IsString()
    username1: string;

    @ApiProperty()
    @IsString()
    username2?: string;

    @ApiProperty()
    @IsString()
    gameMode: string;

    @ApiProperty()
    @IsString()
    abandonned?: string;

    @ApiProperty()
    @IsString()
    winner: string;
}
