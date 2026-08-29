export function isMultiHand(handedness: string | null | undefined): boolean {
  return handedness === 'TWO_A'
    || handedness === 'TWO_N'
    || handedness === 'TWO_S';
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

export function mapFitxaHandednessCode(code: string): string | null {
  const normalized = String(code).trim().toLowerCase();
  switch (normalized) {
    case '1':
      return 'ONE';
    case '2a':
      return 'TWO_A';
    case '2n':
      return 'TWO_N';
    case '2s':
      return 'TWO_S';
    case 'x':
      return 'NA';
    default:
      return null;
  }
}

export function handednessToFitxaCode(handedness: string): string {
  switch (handedness) {
    case 'ONE':
      return '1';
    case 'TWO_A':
      return '2a';
    case 'TWO_N':
      return '2n';
    case 'TWO_S':
      return '2s';
    case 'NA':
      return 'x';
    default:
      return '1';
  }
}
