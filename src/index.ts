import { ArgParser } from "./ArgParser";
import { MortyLoader } from "./MortyLoader";
import { GameCore } from "./GameCore";

const USAGE_MSG = `Incorrect parameters:
No arguments: npm start
Only one argument like npm start -- 1
A non-existent Morty: npm start -- --boxes 3 --morty unknownMorty`;

async function main() {
  try {
    const rawArgs = process.argv.slice(2);

    if (rawArgs.length === 0) {
      console.error(USAGE_MSG);
      process.exit(1);
    }

    if (rawArgs.length === 1) {
      console.error(USAGE_MSG);
      process.exit(1);
    }

    const parser = new ArgParser(rawArgs);
    const opts = parser.options;

    let MortyClass;
    try {
      MortyClass = await MortyLoader.load(opts.morty);
    } catch (e: any) {
      console.error(USAGE_MSG);
      console.error(`\nDetails: ${e.message ?? String(e)}`);
      process.exit(1);
    }

    const morty = new MortyClass();
    const core = new GameCore(opts.boxes, morty, opts.rounds);
    await core.run();
  } catch (err: any) {
    console.error("Error:", err.message ?? String(err));
    process.exit(1);
  }
}

main();
