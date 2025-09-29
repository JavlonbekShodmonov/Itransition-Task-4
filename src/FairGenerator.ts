// src/FairGenerator.ts
import { createHmac, randomInt } from "crypto";
import { RandomKeyManager } from "./RandomKeyManager";

export type Commit = {
  mortyValue: number;
  keyHex: string;
  hmacHex: string;
};

export class FairGenerator {
  // create morty commit (mortyValue kept secret until reveal)
  static createCommit(range: number): Commit {
    const key = RandomKeyManager.generateKey();
    const mortyValue = randomInt(0, range);
    // HMAC using sha3-256 (if not available on older Node, it will throw)
    const hmac = createHmac("sha3-256", key).update(String(mortyValue)).digest("hex");
    return { mortyValue, keyHex: key.toString("hex"), hmacHex: hmac };
  }

  static verify(mortyValue: number, keyHex: string): string {
    const key = Buffer.from(keyHex, "hex");
    return createHmac("sha3-256", key).update(String(mortyValue)).digest("hex");
  }

  static combine(mortyValue: number, rickValue: number, n: number): number {
    return (mortyValue + rickValue) % n;
  }
}
