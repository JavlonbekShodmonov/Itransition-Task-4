// src/GameCore.ts
import readline from "readline";
import Table from "cli-table3";
import chalk from "chalk";
import { MortyBase, GameContext, FairRandomFn } from "./morties/MortyBase";
import { FairGenerator } from "./FairGenerator";
import { Statistics } from "./Statistics";

export class GameCore {
  private morty: MortyBase;
  private boxes: number;
  private stats: Statistics;
  private rl: readline.Interface;
  private maxRounds?: number;
  private commitCounter = 0;

  constructor(boxes: number, morty: MortyBase, maxRounds?: number) {
    this.boxes = boxes;
    this.morty = morty;
    this.maxRounds = maxRounds;
    this.stats = new Statistics();
    this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  }

  private question(prompt: string): Promise<string> {
    return new Promise((resolve) => this.rl.question(prompt, (ans) => resolve(ans.trim())));
  }

  // Implements the HMAC-based collaborative protocol:
  // - create commit (morty value + key), show HMAC
  // - ask Rick for his number in [0, range)
  // - compute final = (morty + rick) % range
  // - reveal mortyValue + key and show check
  private async fairRandom(range: number, label?: string): Promise<{
    final: number;
    mortyValue: number;
    keyHex: string;
    hmacHex: string;
    rickValue: number;
  }> {
    const commit = FairGenerator.createCommit(range);
    this.commitCounter++;
    console.log(chalk.gray(`Morty HMAC${this.commitCounter}=${commit.hmacHex}`));

    // ask user for Rick's number in [0, range)
    let rickNum: number | null = null;
    while (rickNum === null) {
      const ans = await this.question(`Rick, enter your number [0,${range}): `);
      const n = Number(ans);
      if (Number.isInteger(n) && n >= 0 && n < range) {
        rickNum = n;
      } else {
        console.log(chalk.red(`Invalid number. Enter an integer in [0,${range}).`));
      }
    }

    const final = FairGenerator.combine(commit.mortyValue, rickNum, range);

    console.log(chalk.gray(`Morty: Aww man, my random value is ${commit.mortyValue}.`));
    console.log(chalk.gray(`Morty KEY=${commit.keyHex}`));
    const verify = FairGenerator.verify(commit.mortyValue, commit.keyHex);
    console.log(chalk.gray(`Check HMAC: ${verify === commit.hmacHex ? "OK" : "MISMATCH"}`));

    return { final, mortyValue: commit.mortyValue, keyHex: commit.keyHex, hmacHex: commit.hmacHex, rickValue: rickNum };
  }

  private async oneRound(): Promise<void> {
    console.log(chalk.yellow(`\nMorty: I'm gonna hide your portal gun in one of the ${this.boxes} boxes.`));

    // 1) collaborative generation for portal box
    const portalCommit = await this.fairRandom(this.boxes, "portal");
    const portalIndex = portalCommit.final;

    // 2) Rick chooses a box (his guess)
    let guess: number | null = null;
    while (guess === null) {
      const ans = await this.question(`Morty: What's your guess [0,${this.boxes})? `);
      const n = Number(ans);
      if (Number.isInteger(n) && n >= 0 && n < this.boxes) guess = n;
      else console.log(chalk.red("Invalid guess."));
    }

    // 3) Morty decides which boxes to leave (may call fairRandom again via context)
    const context: GameContext = {
      boxes: this.boxes,
      chosenByRick: guess,
      portalBox: portalIndex,
      fairRandom: (range: number, label?: string) => this.fairRandom(range, label),
      stats: this.stats,
    };

    const remaining = await this.morty.revealBoxes(context);
    // ensure at least the player's pick is in remaining
    if (!remaining.includes(guess)) remaining.push(guess);

    // If more than 2 left, keep first two (shouldn't normally happen)
    const two = (remaining.length >= 2) ? remaining.slice(0, 2) : remaining.concat([]).slice(0, 2);

    console.log(chalk.yellow(`Morty: I removed ${this.boxes - two.length} boxes. Remaining boxes: ${two.join(", ")}`));

    // 4) Player chooses to switch or stay
    const choiceAns = await this.question("Morty: You can switch your box (enter 0), or stick with it (enter 1): ");
    const c = Number(choiceAns);
    const switched = c === 0;
    let finalBox = guess;
    if (switched) {
      const other = two.find((x) => x !== guess);
      if (other !== undefined) finalBox = other;
    }

    const rickWon = finalBox === portalIndex;
    console.log(chalk.blue(`Morty: The portal gun is in the box ${portalIndex}.`));
    console.log(chalk.blue(rickWon ? "Morty: Aww man, you won, Rick!" : "Morty: Aww man, you lost, Rick."));

    this.stats.addRound(switched, rickWon);
  }

  private showStats() {
    const table = new Table({ head: ["Game results", "Rick switched", "Rick stayed"] });
    table.push(["Rounds", this.stats.switchedRounds, this.stats.stayedRounds]);
    table.push(["Wins", this.stats.switchedWins, this.stats.stayedWins]);
    table.push(["P (estimate)", this.stats.estimateSwitched.toFixed(3), this.stats.estimateStayed.toFixed(3)]);
    const exactSwitched = this.morty.probabilityIfSwitched(this.boxes);
    const exactStayed = 1 - exactSwitched;
    table.push(["P (exact)", exactSwitched.toFixed(3), exactStayed.toFixed(3)]);

    console.log("\nGAME STATS");
    console.log(table.toString());
  }

  async run() {
    console.log(chalk.green(`Loaded Morty: ${this.morty.name}`));
    console.log(this.morty.describe());

    let roundsDone = 0;
    while (true) {
      await this.oneRound();
      roundsDone++;
      if (this.maxRounds && roundsDone >= this.maxRounds) break;

      // if maxRounds not set, ask whether to continue
      if (!this.maxRounds) {
        const again = await this.question("Do you want to play another round (y/n)? ");
        if (!/^y(es)?$/i.test(again)) break;
      }
    }

    this.showStats();
    this.rl.close();
  }
}
