// src/morties/ClassicMorty.ts
import { MortyBase, GameContext } from "./MortyBase";

export class ClassicMorty extends MortyBase {
  name = "ClassicMorty";

  describe(): string {
    return `${this.name}: never removes the portal box. If Rick's initial pick is correct, ClassicMorty uses a fair random draw to pick which other box to leave.`;
  }

  async revealBoxes(context: GameContext): Promise<number[]> {
    const { boxes, chosenByRick, portalBox, fairRandom } = context;

    // if Rick already chose the portal box, Morty must fairly choose another box to leave closed
    if (chosenByRick === portalBox) {
      const otherBoxes = Array.from({ length: boxes }, (_, i) => i).filter(
        (b) => b !== portalBox
      );

      // use collaborative fair random to choose which "other box" to keep closed
      const randResult = await fairRandom(otherBoxes.length, "ClassicMorty-choice");
      const keepBox = otherBoxes[randResult.final];

      return [portalBox, keepBox];
    }

    // otherwise, Morty always keeps Rick’s choice and the portal box
    return [chosenByRick, portalBox];
  }

  probabilityIfSwitched(n: number): number {
    // Monty Hall standard probability if switched
    return (n - 1) / n;
  }
}
