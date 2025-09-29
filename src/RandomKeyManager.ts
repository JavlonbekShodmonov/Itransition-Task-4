// src/RandomKeyManager.ts
import { randomBytes } from "crypto";

export class RandomKeyManager {
  // returns Buffer (256 bits)
  static generateKey(): Buffer {
    return randomBytes(32); // 256 bits
  }
}
