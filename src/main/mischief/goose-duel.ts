import { IpcChannels, type DuelStartPayload } from '@shared/types';
import { playSound } from '../audio';
import type { Mischief } from './index';

const DUEL_DURATION_MS = 11_000;

const INTRO_LINES = [
  'Not today, goose.',
  'I have been waiting for you.',
  'Honk on this.',
  'Pretzel time.',
];

export const gooseDuel: Mischief = {
  id: 'goose-duel',
  label: 'Summon a goose ⚔🦢',
  tier: 1,
  weight: 0.4,
  cooldownMs: 200_000,
  // Bored Claude reaches for a fight. Disabled when tired / very chill.
  moodWeights: { bored: 3, mischievous: 1.2, angry: 1.5, happy: 0.4, tired: 0, curious: 0.3 },
  run: ({ claudeWindow, rand, pickRandom, showDialogue }) => {
    const entryEdge: 'left' | 'right' = rand(0, 1) < 0.5 ? 'left' : 'right';
    playSound('honk');

    showDialogue(pickRandom(INTRO_LINES), { kind: 'speak', holdMs: 1_400 });

    // Slight delay so the bubble appears before the helmet comes on.
    setTimeout(() => {
      if (claudeWindow.isDestroyed()) return;
      const payload: DuelStartPayload = {
        entryEdge,
        durationMs: DUEL_DURATION_MS,
      };
      claudeWindow.webContents.send(IpcChannels.DuelStart, payload);
    }, 700);

    // Victory line after the goose is gone.
    setTimeout(() => {
      showDialogue('Mighty pretzel.', { kind: 'speak', holdMs: 2_000 });
    }, DUEL_DURATION_MS + 800);
  },
};
