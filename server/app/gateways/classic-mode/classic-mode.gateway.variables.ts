export enum ClassicModeEvents {
    Start = 'start',
    Started = 'started',
    ValidateDifference = 'validate',
    DifferenceValidated = 'validated',
    GameFinished = 'GameFinished',
    EndGame = 'endGame',
    Timer = 'timer',
    CheckGame = 'checkGame',
    GameFound = 'gameFound',
    GameDeleted = 'gameDeleted',
    CreateGame = 'createGame',
    AbortGameCreation = 'abortGameCreation',
    GameInfo = 'gameInfo',
    LeaveGame = 'leaveGame',
    PlayerRejected = 'playerRejected',
    PlayerAccepted = 'playerAccepted',
    AcceptPlayer = 'acceptPlayer',
    RejectPlayer = 'rejectPlayer',
    CanJoinGame = 'canJoinGame',
    CannotJoinGame = 'cannotJoinGame',
    GameCanceled = 'gameCanceled',
    AskingToJoinGame = 'askingToJoinGame',
    GameCreated = 'gameCreated',
    Abandoned = 'abandoned',
}

export enum DelayBeforeEmittingTime {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    DELAY_BEFORE_EMITTING_TIME = 1000,
}
