import { GameConstants } from '@app/model/database/game-constants';
import { GameHistory } from '@app/model/dto/game-history/game-history.dto';
import { NewBestTime } from '@app/model/dto/game/new-best-time.dto';
import { BestTime } from '@app/model/schema/best-time.schema';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Put, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Config')
@Controller('config')
export class ConfigController {
    constructor(
        private readonly gameHistoryService: GameHistoryService,
        private readonly gameService: GameService,
        private readonly gameConstantsService: GameConstantsService,
    ) {}
    @ApiOkResponse({
        description: 'Returns all history',
        type: GameHistory,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Get('/history')
    async getAllHistories(@Res() response: Response) {
        try {
            const allHistory = await this.gameHistoryService.getGamesHistories();
            response.status(HttpStatus.OK).json(allHistory);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Returns constants',
        type: GameConstants,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/constants')
    async getConstants(@Res() response: Response) {
        try {
            const gameConstants = await this.gameConstantsService.getGameConstants();
            response.status(HttpStatus.OK).json(gameConstants);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Returns best times for a specific game',
        type: BestTime,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/times/:name')
    async getBestTime(@Param('name') name: string, @Res() response: Response) {
        try {
            const bestTimes = await this.gameService.getBestTime(name);
            response.status(HttpStatus.OK).json(bestTimes);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'update Best Time',
        type: Number,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Put('/times/:name')
    async updateBestTime(@Param('name') name: string, @Body() newBestTime: NewBestTime, @Res() response: Response) {
        try {
            const bestTimePosition = await this.gameService.updateBestTime(name, newBestTime);
            response.status(HttpStatus.CREATED).json(bestTimePosition);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'update game constants',
        type: GameConstants,
    })
    @ApiNotFoundResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Put('/constants')
    async updateConstants(@Body() gameConstants: GameConstants, @Res() response: Response) {
        try {
            await this.gameConstantsService.updateGameConstants(gameConstants);
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'delete all histories',
    })
    @ApiNotFoundResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Delete('/history')
    async deleteAllHistories(@Res() response: Response) {
        try {
            await this.gameHistoryService.deleteGamesHistories();
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'delete all best times',
    })
    @ApiNotFoundResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Delete('/times')
    async deleteAllBestTimes(@Res() response: Response) {
        try {
            await this.gameService.deleteBestTimes();
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
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
            await this.gameService.deleteBestTime(name);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
