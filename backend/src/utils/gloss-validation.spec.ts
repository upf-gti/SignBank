import { validateGlossRequest } from './gloss-validation';

describe('validateGlossRequest', () => {
  it('requires gloss', () => {
    const errors = validateGlossRequest({
      requestedGlossData: { gloss: '  ', definitions: [{ definition: 'x' }] },
    });
    expect(errors.some((e) => e.message === 'Gloss is required')).toBe(true);
  });

  it('requires at least one definition', () => {
    const errors = validateGlossRequest({
      requestedGlossData: { gloss: 'CASA', definitions: [] },
    });
    expect(errors.some((e) => e.message === 'At least one definition is required')).toBe(true);
  });

  it('requires video', () => {
    const errors = validateGlossRequest({
      requestedGlossData: {
        gloss: 'CASA',
        definitions: [{ definition: 'house' }],
        glossVideos: [],
      },
    });
    expect(errors.some((e) => e.message === 'Video is required')).toBe(true);
  });
});
