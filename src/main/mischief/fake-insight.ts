import { INSIGHTS } from '@shared/data/insights';
import { playSound } from '../audio';
import type { Mischief } from './index';

export const fakeInsight: Mischief = {
  id: 'fake-insight',
  label: 'Fake insight',
  tier: 1,
  weight: 1,
  cooldownMs: 45_000,
  moodWeights: { curious: 2, happy: 1.2, mischievous: 1.2, angry: 0.6, tired: 0.3 },
  run: ({ pickRandom, showDialogue }) => {
    playSound('ding');
    showDialogue(pickRandom(INSIGHTS), { kind: 'speak', holdMs: 5_500 });
  },
};
