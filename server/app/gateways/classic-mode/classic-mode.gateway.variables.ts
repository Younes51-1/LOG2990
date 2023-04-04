export enum ClassicModeEvents {
    Start = 'start',
    Started = 'started',
    ValidateDifference = 'validate',
    DifferenceValidated = 'validated',
    EndGame = 'endGame',
    GameFinished = 'GameFinished',
    Abandoned = 'abandoned',
    CheckGame = 'checkGame',
    GameFound = 'gameFound',
    CreateGame = 'createGame',
    GameCreated = 'gameCreated',
    GameDeleted = 'gameDeleted',
    CanJoinGame = 'canJoinGame',
    CannotJoinGame = 'cannotJoinGame',
    AskingToJoinGame = 'askingToJoinGame',
    GameInfo = 'gameInfo',
    AbortGameCreation = 'abortGameCreation',
    GameCanceled = 'gameCanceled',
    LeaveGame = 'leaveGame',
    PlayerRejected = 'playerRejected',
    PlayerAccepted = 'playerAccepted',
    AcceptPlayer = 'acceptPlayer',
    RejectPlayer = 'rejectPlayer',
    NewBestTimeScore = 'newBestTimeScore',
    Timer = 'timer',
    ChangeTime = 'changeTime',
}

export enum DelayBeforeEmittingTime {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    DELAY_BEFORE_EMITTING_TIME = 1000,
}
