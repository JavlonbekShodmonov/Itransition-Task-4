// src/morties/ClassicMorty.ts
import { MortyBase, GameContext } from "./MortyBase";

export class ClassicMorty extends MortyBase {
  name = "ClassicMorty";

  describe(): string {
    return `${this.name}: never removes the portal box. If Rick's initial pick is correct, ${this.name} uses a fair random draw to pick which other box to leave.`;
  }

  async revealBoxes(context: GameContext): Promise<number[]> {
    const remaining = [context.chosenByRick, context.portalBox];

    if (context.chosenByRick === context.portalBox) {
      // Rick guessed the portal — ClassicMorty must fairly pick another box to keep
      let other: number | null = null;

      while (other === null || other === context.portalBox || other === context.chosenByRick) {
        const fair = await context.fairRandom(context.boxes - 1, "ClassicMorty-choice");
        // shift if fair result >= portalBox
        const fairValue = typeof fair === "number" ? fair : (fair as any).result;
        const candidate = fairValue >= context.portalBox ? fairValue + 1 : fairValue;
        if (candidate !== context.portalBox && candidate !== context.chosenByRick) {
          other = candidate;
        }
      }

      remaining.push(other);
    }

    return remaining;
  }

  probabilityIfSwitched(n: number): number {
    return (n - 1) / n;
  }
}
