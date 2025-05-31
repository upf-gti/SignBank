import { GlossData, Sense, Definition, Example, SignVideo, VideoData } from 'src/types/models';
import translate from 'src/utils/translate';

export interface ValidationError {
  message: string;
}

export function validateGloss(glossData: GlossData): ValidationError[] {
  const errors: ValidationError[] = [];
  // Check if gloss has a value
  if (!glossData.gloss || glossData.gloss.trim() === '') {
    errors.push({
      message: translate('validation.glossRequired')
    });
  }

  // Check if gloss has at least one sense
  if (!glossData.senses || glossData.senses.length === 0) {
    errors.push({
      message: translate('validation.senseRequired')
    });
    return errors; // Return early since we can't validate senses if there are none
  }

  // Validate each sense
  glossData.senses.forEach((sense, index) => {
    const senseErrors = validateSense(sense, index + 1);
    errors.push(...senseErrors);
  });

  return errors;
}

function validateSense(sense: Sense, senseNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // If sense has a title, use it. If not, use the lexical category. If neither exists, use the number.
  let senseTitle = '';
  if (sense.senseTitle && sense.senseTitle.trim() !== '') {
    senseTitle = sense.senseTitle;
  } else {
    senseTitle = `#${senseNumber} - ${translate(sense.lexicalCategory)}`;
  }

  // Check for at least one definition
  if (!sense.definitions || sense.definitions.length === 0) {
    errors.push({
      message: translate('validation.definitionRequired', { senseTitle })
    });
  } else {
    // Validate each definition
    sense.definitions.forEach((definition) => {
      const definitionErrors = validateDefinition(definition, senseTitle);
      errors.push(...definitionErrors);
    });
  }

  // Check for at least one video
  if (!sense.signVideos || sense.signVideos.length === 0) {
    errors.push({
      message: translate('validation.videoRequired', { senseTitle })
    });
  } else {
    // Validate each video
    sense.signVideos.forEach((video) => {
      const videoErrors = validateSignVideo(video, senseTitle);
      errors.push(...videoErrors);
    });
  }

  // Validate examples if they exist
  if (sense.examples && sense.examples.length > 0) {
    sense.examples.forEach((example) => {
      const exampleErrors = validateExample(example, senseTitle);
      errors.push(...exampleErrors);
    });
  }

  // Validate sense translations if they exist
  if (sense.senseTranslations) {
    sense.senseTranslations.forEach((translation) => {
      if (!translation.translation || translation.translation.trim() === '') {
        errors.push({
          message: translate('validation.senseTranslationRequired', { senseTitle })
        });
      }
    });
  }

  return errors;
}

function validateDefinition(definition: Definition, senseTitle: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check definition value
  if (!definition.definition || definition.definition.trim() === '') {
    errors.push({
        message: translate('validation.definitionValueRequired', { senseTitle })
    });
  }

  // Check definition translations if they exist
  if (definition.definitionTranslations) {
    definition.definitionTranslations.forEach((translation) => {
      if (!translation.translation || translation.translation.trim() === '') {
        errors.push({
          message: translate('validation.definitionTranslationRequired', { senseTitle })
        });
      }
    });
  }

  return errors;
}

function validateExample(example: Example, senseTitle: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check example value
  if (!example.example || example.example.trim() === '') {
    errors.push({
      message: translate('validation.exampleValueRequired', { senseTitle })
    });
  }

  // Check example translations if they exist
  if (example.exampleTranslations) {
    example.exampleTranslations.forEach((translation) => {
      if (!translation.translation || translation.translation.trim() === '') {
        errors.push({
          message: translate('validation.exampleTranslationRequired', { senseTitle })
        });
      }
    });
  }

  return errors;
}

function validateSignVideo(signVideo: SignVideo, senseTitle: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if videos array exists and has at least one video
  if (!signVideo.videos || signVideo.videos.length === 0) {
    errors.push({
      message: translate('validation.videoRequired', { senseTitle })
    });
  } else {
    // Get the video title from SignVideo or use a default
    const videoTitle = signVideo.title && signVideo.title.trim() !== '' 
      ? signVideo.title 
      : `${translate('video')} #1`;

    // Validate each video
    signVideo.videos.forEach((video) => {
      if (!video.angle || video.angle.trim() === '') {
        errors.push({
          message: translate('validation.videoAngleRequiredForVideo', { senseTitle, videoTitle })
        });
      } else if (!video.url || video.url.trim() === '') {
        errors.push({
          message: translate('validation.videoUrlRequiredForAngleAndVideo', { senseTitle, angle: video.angle, videoTitle })
        });
      }
    });
  }

  // VideoData (fonology) is not strictly necessary, so we don't validate it
  return errors;
} 