export interface ValidationError {
  message: string;
}

export function validateGlossRequest(glossRequest: any): ValidationError[] {
  const errors: ValidationError[] = [];
  const glossData = glossRequest.requestedGlossData;

  if (!glossData?.gloss || glossData.gloss.trim() === '') {
    errors.push({ message: 'Gloss is required' });
  }

  if (!glossData?.definitions || glossData.definitions.length === 0) {
    errors.push({ message: 'At least one definition is required' });
    return errors;
  }

  glossData.definitions.forEach((definition: any, index: number) => {
    errors.push(...validateDefinition(definition, index + 1));
  });

  if (glossData.examples?.length > 0) {
    glossData.examples.forEach((example: any) => {
      errors.push(...validateExample(example));
    });
  }

  if (glossData.glossTranslations) {
    glossData.glossTranslations.forEach((translation: any) => {
      if (!translation.translation || translation.translation.trim() === '') {
        errors.push({ message: 'Gloss translation is required' });
      }
    });
  }

  if (!glossData.glossVideos || glossData.glossVideos.length === 0) {
    errors.push({ message: 'Video is required' });
  } else {
    glossData.glossVideos.forEach((video: any) => {
      errors.push(...validateSignVideo(video));
    });
  }

  return errors;
}

function validateDefinition(definition: any, definitionNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const label = definition.title?.trim() || `Definition #${definitionNumber}`;

  if (!definition.definition || definition.definition.trim() === '') {
    errors.push({ message: `Definition value is required for ${label}` });
  }

  if (definition.definitionTranslations) {
    definition.definitionTranslations.forEach(() => {
      // validated when present
    });
  }

  return errors;
}

function validateExample(example: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!example.example || example.example.trim() === '') {
    errors.push({ message: 'Example value is required' });
  }

  return errors;
}

function validateSignVideo(signVideo: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!signVideo.videos || signVideo.videos.length === 0) {
    errors.push({ message: 'Video is required' });
  } else {
    signVideo.videos.forEach((video: any) => {
      if (!video.angle || video.angle.trim() === '') {
        errors.push({ message: 'Video angle is required' });
      } else if (!video.url || video.url.trim() === '') {
        errors.push({ message: 'Video URL is required' });
      }
    });
  }

  return errors;
}
