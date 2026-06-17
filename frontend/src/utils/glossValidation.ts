import type { GlossData, Definition, Example, SignVideo } from 'src/types/models';
import translate from 'src/utils/translate';

export interface ValidationError {
  message: string;
}

export function validateGloss(glossData: GlossData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!glossData.gloss || glossData.gloss.trim() === '') {
    errors.push({ message: translate('validation.glossRequired') });
  }

  if (!glossData.definitions || glossData.definitions.length === 0) {
    errors.push({ message: translate('validation.definitionRequired', { senseTitle: glossData.gloss }) });
    return errors;
  }

  glossData.definitions.forEach((definition, index) => {
    errors.push(...validateDefinition(definition, index + 1));
  });

  if (!glossData.glossVideos || glossData.glossVideos.length === 0) {
    errors.push({ message: translate('validation.videoRequired') });
  } else {
    glossData.glossVideos.forEach((video) => {
      errors.push(...validateSignVideo(video));
    });
  }

  if (glossData.examples?.length) {
    glossData.examples.forEach((example) => {
      errors.push(...validateExample(example));
    });
  }

  if (glossData.glossTranslations) {
    glossData.glossTranslations.forEach((translation) => {
      if (!translation.translation || translation.translation.trim() === '') {
        errors.push({ message: translate('validation.senseTranslationRequired', { senseTitle: glossData.gloss }) });
      }
    });
  }

  return errors;
}

function validateDefinition(definition: Definition, definitionNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const label = definition.title?.trim() || `#${definitionNumber}`;

  if (!definition.definition || definition.definition.trim() === '') {
    errors.push({ message: translate('validation.definitionValueRequired', { senseTitle: label }) });
  }

  if (definition.definitionTranslations) {
    definition.definitionTranslations.forEach(() => {
      // optional nested validation
    });
  }

  return errors;
}

function validateExample(example: Example): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!example.example || example.example.trim() === '') {
    errors.push({ message: translate('validation.exampleValueRequired', { senseTitle: '' }) });
  }

  return errors;
}

function validateSignVideo(signVideo: SignVideo): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!signVideo.videos || signVideo.videos.length === 0) {
    errors.push({ message: translate('validation.videoRequired') });
  } else {
    const videoTitle = signVideo.title?.trim() || `${translate('video')} #1`;

    signVideo.videos.forEach((video) => {
      if (!video.angle || video.angle.trim() === '') {
        errors.push({ message: translate('validation.videoAngleRequiredForVideo', { videoTitle }) });
      } else if (!video.url || video.url.trim() === '') {
        errors.push({ message: translate('validation.videoUrlRequiredForAngleAndVideo', { angle: video.angle, videoTitle }) });
      }
    });
  }

  return errors;
}
