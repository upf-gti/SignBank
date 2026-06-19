import { Handedness } from 'src/types/enums';

export function isMultiHand(handedness: Handedness | string | null | undefined): boolean {
  return handedness === Handedness.TWO_A
    || handedness === Handedness.TWO_N
    || handedness === Handedness.TWO_S;
}

export type PhonologyDisplayMode = 'single' | 'merged' | 'split';

export function isPhonologyValueEmpty(value: string | null | undefined): boolean {
  return value == null || value === '';
}

export function getPhonologyDisplayMode(
  dominant: string | null | undefined,
  nonDominant: string | null | undefined,
  multiHand: boolean,
): PhonologyDisplayMode {
  if (!multiHand) return 'single';

  const dominantEmpty = isPhonologyValueEmpty(dominant);
  const nonDominantEmpty = isPhonologyValueEmpty(nonDominant);

  if (dominantEmpty && nonDominantEmpty) return 'merged';
  if (!dominantEmpty && !nonDominantEmpty && dominant === nonDominant) return 'merged';
  if (dominantEmpty !== nonDominantEmpty) return 'merged';

  return 'split';
}

export function mapFitxaHandednessCode(code: string): Handedness | null {
  const normalized = String(code).trim().toLowerCase();
  switch (normalized) {
    case '1':
      return Handedness.ONE;
    case '2a':
      return Handedness.TWO_A;
    case '2n':
      return Handedness.TWO_N;
    case '2s':
      return Handedness.TWO_S;
    case 'x':
      return Handedness.NA;
    default:
      return null;
  }
}

export function handednessToFitxaCode(handedness: Handedness): string {
  switch (handedness) {
    case Handedness.ONE:
      return '1';
    case Handedness.TWO_A:
      return '2a';
    case Handedness.TWO_N:
      return '2n';
    case Handedness.TWO_S:
      return '2s';
    case Handedness.NA:
      return 'x';
    default:
      return '1';
  }
}
