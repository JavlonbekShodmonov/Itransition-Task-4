// src/ArgParser.ts
export type CLIOptions = {
  boxes: number;
  morty: string;      // builtin name or path
  rounds?: number;    // optional max rounds
  mortyPath?: string;
  mortyClass?: string;
};

export class ArgParser {
  public options: CLIOptions;

  constructor(argv?: string[]) {
    this.options = this.parse(argv ?? process.argv.slice(2));
  }

  private usage(): string {
    return [
      "Usage examples:",
      "  node dist/index.js --boxes 3 --morty classic --rounds 3",
      "  node dist/index.js 3 ./dist/morties/ClassicMorty.js ClassicMorty",
      "",
      "Notes:",
      "- --boxes : integer > 2 (default: 3)",
      "- --morty  : builtin name (classic|lazy) or path to module",
      "- --rounds : optional number of rounds to run then exit",
    ].join("\n");
  }

  parse(argv: string[]): CLIOptions {
    let boxes: number | undefined;
    let morty: string | undefined;
    let rounds: number | undefined;

    for (let i = 0; i < argv.length; i++) {
      const a = argv[i];
      if (a === "--boxes") {
        const v = argv[++i];
        if (!v) throw new Error("--boxes requires a value.\n\n" + this.usage());
        const n = Number(v);
        if (!Number.isInteger(n) || n <= 2) throw new Error("boxes must be an integer > 2.");
        boxes = n;
      } else if (a === "--morty") {
        morty = argv[++i];
        if (!morty) throw new Error("--morty requires a value.\n\n" + this.usage());
      } else if (a === "--rounds") {
        const v = argv[++i];
        if (!v) throw new Error("--rounds requires a value.");
        const n = Number(v);
        if (!Number.isInteger(n) || n <= 0) throw new Error("--rounds must be a positive integer.");
        rounds = n;
      } else if (!a.startsWith("-") && !boxes && !morty) {
        // allow positional: first positional may be boxes or morty
        const asNum = Number(a);
        if (Number.isInteger(asNum) && asNum > 0) boxes = asNum;
        else morty = a;
      } else {
        throw new Error(`Unknown argument: ${a}\n\n${this.usage()}`);
      }
    }

    // sensible defaults
    // src/ArgParser.ts
// ...
// sensible defaults
if (!boxes) boxes = 3;
if (!morty) {
  throw new Error("Incorrect parameters: --morty is required.\n\n" + this.usage());
}
return { boxes, morty, rounds };

  }
}
