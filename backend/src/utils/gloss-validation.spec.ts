import { validateGlossRequest } from './gloss-validation';

describe('validateGlossRequest', () => {
  it('requires a gloss name', () => {
    const errors = validateGlossRequest({
      requestedGlossData: { gloss: '  ', senses: [{ definitions: [{}] }] },
    });

    expect(errors).toContainEqual({ message: 'Gloss is required' });
  });

  it('requires at least one sense', () => {
    const errors = validateGlossRequest({
      requestedGlossData: { gloss: 'CASA', senses: [] },
    });

    expect(errors).toContainEqual({ message: 'At least one sense is required' });
  });

  it('requires at least one sign video', () => {
    const errors = validateGlossRequest({
      requestedGlossData: {
        gloss: 'CASA',
        senses: [
          {
            senseTitle: 'Home',
            lexicalCategory: 'NOUN',
            definitions: [{ definition: 'A dwelling' }],
            senseTranslations: [{ translation: 'casa', language: 'SPANISH' }],
          },
        ],
        glossVideos: [],
      },
    });

    expect(errors).toContainEqual({ message: 'Video is required' });
  });
});
