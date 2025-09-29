// src/Statistics.ts
export type RoundResult = { switched: boolean; rickWon: boolean };

export class Statistics {
  private _rounds = 0;
  private _switchedRounds = 0;
  private _switchedWins = 0;
  private _stayedRounds = 0;
  private _stayedWins = 0;

  addRound(switched: boolean, rickWon: boolean) {
    this._rounds++;
    if (switched) {
      this._switchedRounds++;
      if (rickWon) this._switchedWins++;
    } else {
      this._stayedRounds++;
      if (rickWon) this._stayedWins++;
    }
  }

  get total() {
    return this._rounds;
  }
  get switchedRounds() {
    return this._switchedRounds;
  }
  get stayedRounds() {
    return this._stayedRounds;
  }
  get switchedWins() {
    return this._switchedWins;
  }
  get stayedWins() {
    return this._stayedWins;
  }

  get estimateSwitched() {
    return this._switchedRounds === 0 ? 0 : this._switchedWins / this._switchedRounds;
  }
  get estimateStayed() {
    return this._stayedRounds === 0 ? 0 : this._stayedWins / this._stayedRounds;
  }
}
