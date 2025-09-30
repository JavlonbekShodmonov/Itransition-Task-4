// src/morties/MortyBase.ts
import { Statistics } from "../Statistics";

// Result type returned by the fairRandom function
export type FairRandomResult = {
  final: number;
  mortyValue: number;
  keyHex: string;
  hmacHex: string;
  rickValue: number;
};

// the fairRandom function that GameCore provides to morties
export type FairRandomFn = (range: number, label?: string) => Promise<FairRandomResult>;

export type GameContext = {
  boxes: number;
  chosenByRick: number;
  portalBox: number;
  fairRandom: FairRandomFn;
  stats: Statistics;
};

export abstract class MortyBase {
  name = "MortyBase";
  abstract describe(): string;
  // returns the indices of boxes left (should include player's pick)
  abstract revealBoxes(context: GameContext): Promise<number[]>;
  abstract probabilityIfSwitched(n: number): number;
}
