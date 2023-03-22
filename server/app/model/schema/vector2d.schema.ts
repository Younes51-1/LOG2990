import { ApiProperty } from '@nestjs/swagger';

export class Vector2D {
    @ApiProperty()
    x: number;

    @ApiProperty()
    y: number;
}
