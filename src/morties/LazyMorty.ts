// src/morties/LazyMorty.ts
import { MortyBase, GameContext } from "./MortyBase";

export class LazyMorty extends MortyBase {
  name = "LazyMorty";
  describe() {
    return "LazyMorty: removes boxes deterministically (lowest indices possible), no randomness.";
  }

  async revealBoxes(context: GameContext): Promise<number[]> {
    const { boxes, chosenByRick, portalBox } = context;

    // If Rick's pick is incorrect, leave chosen and portal.
    if (chosenByRick !== portalBox) {
      return [chosenByRick, portalBox].sort((a, b) => a - b);
    }

    // Rick picked portal: keep chosen + the lowest index that is not chosen
    for (let i = 0; i < boxes; i++) {
      if (i !== chosenByRick) {
        return [chosenByRick, i].sort((a, b) => a - b);
      }
    }
    // fallback
    return [chosenByRick].slice(0, 2);
  }

  probabilityIfSwitched(n: number): number {
    // Same as classic in practical terms
    return (n - 1) / n;
  }
}
