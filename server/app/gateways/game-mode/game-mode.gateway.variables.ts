export enum GameModeEvents {
    ValidateDifference = 'validate',
    DifferenceValidated = 'validated',
    EndGame = 'endGame',
    GameFinished = 'GameFinished',
    Abandoned = 'abandoned',
    CheckGame = 'checkGame',
    GameFound = 'gameFound',
    GameDeleted = 'gameDeleted',
    CanJoinGame = 'canJoinGame',
    CannotJoinGame = 'cannotJoinGame',
    NewBestTimeScore = 'newBestTimeScore',
    GameCanceled = 'gameCanceled',
    Timer = 'timer',
    ChangeTime = 'changeTime',
    NextGame = 'nextGame',
}

export enum DelayBeforeEmittingTime {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    DELAY_BEFORE_EMITTING_TIME = 1000,
}
