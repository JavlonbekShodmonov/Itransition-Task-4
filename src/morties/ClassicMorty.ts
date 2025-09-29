// src/morties/ClassicMorty.ts
import { MortyBase, GameContext } from "./MortyBase";

export class ClassicMorty extends MortyBase {
  name = "ClassicMorty";
  describe() {
    return "ClassicMorty: never removes the portal box. If Rick's initial pick is correct, ClassicMorty uses a fair random draw to pick which other box to leave.";
  }

  async revealBoxes(context: GameContext): Promise<number[]> {
    const { boxes, chosenByRick, portalBox, fairRandom } = context;

    // If Rick guessed incorrectly, Monty keeps the portal box and Rick's pick.
    if (chosenByRick !== portalBox) {
      return [chosenByRick, portalBox].sort((a, b) => a - b);
    }

    // If Rick guessed correctly, pick one other box uniformly among other indices.
    const others: number[] = [];
    for (let i = 0; i < boxes; i++) {
      if (i !== chosenByRick) others.push(i);
    }

    // Request a fair random number in [0, others.length) to choose which other box stays.
    const commit = await fairRandom(others.length, "ClassicMorty-second");
    const idx = commit.final; // 0..others.length-1
    const otherBox = others[idx];
    return [chosenByRick, otherBox].sort((a, b) => a - b);
  }

  probabilityIfSwitched(n: number): number {
    // For ClassicMorty switching wins with probability (n-1)/n
    return (n - 1) / n;
  }
}
