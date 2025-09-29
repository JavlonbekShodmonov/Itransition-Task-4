// src/MortyLoader.ts
import path from "path";
import fs from "fs";
import { MortyBase } from "./morties/MortyBase";
import { ClassicMorty } from "./morties/ClassicMorty";
import { LazyMorty } from "./morties/LazyMorty";

type MortyCtor = new () => MortyBase;

export class MortyLoader {
  static async load(nameOrPath: string): Promise<MortyCtor> {
    const low = nameOrPath.toLowerCase();
    if (low === "classic" || low === "classicmorty") return ClassicMorty;
    if (low === "lazy" || low === "lazymorty") return LazyMorty;

    // assume path to module
    const resolved = path.resolve(nameOrPath);
    if (!fs.existsSync(resolved)) throw new Error(`Morty module not found at ${resolved}`);
    // require the module (compiled JS file)
    const mod = require(resolved);
    // try several exports
    if (mod.default) return mod.default;
    if (mod.ClassicMorty) return mod.ClassicMorty;
    if (mod.LazyMorty) return mod.LazyMorty;
    // fallback: first export that looks like a constructor
    const keys = Object.keys(mod);
    for (const k of keys) {
      const val = mod[k];
      if (typeof val === "function") return val;
    }
    throw new Error("Unable to load Morty class from module. Export a class.");
  }
}
