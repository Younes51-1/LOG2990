import { Constants } from '@app/model/dto/config/constants.dto';
import { GameHistory } from '@app/model/dto/config/game-history.dto';
import { BestTime } from '@app/model/schema/best-times.schema';
import { Body, Controller, Delete, Get, HttpStatus, Param, Put, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Config')
@Controller('config')
export class ConfigController {
    @ApiOkResponse({
        description: 'Returns all history',
        type: GameHistory,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/history')
    async getAllHistory(@Res() response: Response) {
        try {
            // TODO: implement this
            response.status(HttpStatus.OK).json();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Returns constants',
        type: Constants,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/constants')
    async getConstants(@Res() response: Response) {
        try {
            // TODO: implement this
            response.status(HttpStatus.OK).json();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'update Best Time',
        type: BestTime,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Put('/times/:name')
    async updateBestTime(@Param('name') name: string, @Body() bestTimes: BestTime[], @Res() response: Response) {
        try {
            // TODO: implement this
            response.status(HttpStatus.OK).json();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'update constants',
        type: Constants,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Put('/constants')
    async updateConstants(@Body() constants: Constants, @Res() response: Response) {
        try {
            // TODO: implement this
            response.status(HttpStatus.OK).json();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'delete history',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/history')
    async deleteHistory(@Res() response: Response) {
        try {
            // TODO: implement this
            response.status(HttpStatus.OK).json();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'delete best times',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/times')
    async deleteBestTimes(@Res() response: Response) {
        try {
            // TODO: implement this
            response.status(HttpStatus.OK).json();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'delete best time',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/times/:name')
    async deleteBestTime(@Param('name') name: string, @Res() response: Response) {
        try {
            // TODO: implement this
            response.status(HttpStatus.OK).json();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
