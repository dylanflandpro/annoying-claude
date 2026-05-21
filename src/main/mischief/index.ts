import type { BrowserWindow } from 'electron';
import type { CharacterCommand, DialogueKind, DialogueShowPayload } from '@shared/types';
import { IpcChannels } from '@shared/types';
import type { Mood } from '@shared/mood';

export interface MischiefContext {
  /** Send a character command to the Claude window. */
  sendToCharacter: (cmd: CharacterCommand) => void;
  /** Show a dialogue bubble above Claude. */
  showDialogue: (text: string, opts?: { kind?: DialogueKind; holdMs?: number }) => void;
  /** Current screen size in CSS pixels. */
  screen: { width: number; height: number };
  /** The Claude renderer window (for special-case mischief). */
  claudeWindow: BrowserWindow;
  /** Random in [min, max). */
  rand: (min: number, max: number) => number;
  /** Pick a uniformly-random element from a non-empty array. */
  pickRandom: <T>(arr: readonly T[]) => T;
  /** Current mood at fire time. */
  mood: Mood;
}

export interface Mischief {
  id: string;
  label: string;
  tier: 1 | 2 | 3;
  /** Relative weight inside its tier. */
  weight: number;
  /** Cooldown after run (ms). */
  cooldownMs: number;
  /**
   * Multipliers applied to {@link weight} when the corresponding mood is
   * active. Moods absent from this map default to multiplier 1. A multiplier
   * of 0 disables the mischief for that mood entirely.
   */
  moodWeights?: Partial<Record<Mood, number>>;
  run: (ctx: MischiefContext) => Promise<void> | void;
}

export function makeContext(
  claudeWindow: BrowserWindow,
  screen: { width: number; height: number },
  getMood: () => Mood,
): MischiefContext {
  return {
    claudeWindow,
    screen,
    rand: (min, max) => Math.random() * (max - min) + min,
    pickRandom: <T>(arr: readonly T[]): T => {
      return arr[Math.floor(Math.random() * arr.length)]!;
    },
    sendToCharacter: (cmd) => {
      if (claudeWindow.isDestroyed()) return;
      claudeWindow.webContents.send(IpcChannels.CharacterCommand, cmd);
    },
    showDialogue: (text, opts) => {
      if (claudeWindow.isDestroyed()) return;
      const payload: DialogueShowPayload = {
        text,
        kind: opts?.kind ?? 'speak',
        holdMs: opts?.holdMs ?? 3_000,
      };
      claudeWindow.webContents.send(IpcChannels.DialogueShow, payload);
    },
    get mood() {
      return getMood();
    },
  };
}
