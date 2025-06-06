export interface ValidationError {
  message: string;
}

export function validateGlossRequest(glossRequest: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check if gloss has a value
  if (!glossRequest.requestedGlossData?.gloss || glossRequest.requestedGlossData.gloss.trim() === '') {
    errors.push({
      message: 'Gloss is required'
    });
  }

  // Check if gloss has at least one sense
  if (!glossRequest.requestedGlossData?.senses || glossRequest.requestedGlossData.senses.length === 0) {
    errors.push({
      message: 'At least one sense is required'
    });
    return errors; // Return early since we can't validate senses if there are none
  }

  // Validate each sense
  glossRequest.requestedGlossData.senses.forEach((sense: any, index: number) => {
    const senseErrors = validateSense(sense, index + 1);
    errors.push(...senseErrors);
  });

  return errors;
}

function validateSense(sense: any, senseNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Generate sense title for error messages
  let senseTitle = '';
  if (sense.senseTitle && sense.senseTitle.trim() !== '') {
    senseTitle = sense.senseTitle;
  } else {
    senseTitle = `Sense #${senseNumber} - ${sense.lexicalCategory || 'Unknown'}`;
  }

  // Check for at least one definition
  if (!sense.definitions || sense.definitions.length === 0) {
    errors.push({
      message: `Definition is required for ${senseTitle}`
    });
  } else {
    // Validate each definition
    sense.definitions.forEach((definition: any) => {
      const definitionErrors = validateDefinition(definition, senseTitle);
      errors.push(...definitionErrors);
    });
  }

  // Check for at least one video
  if (!sense.signVideos || sense.signVideos.length === 0) {
    errors.push({
      message: `Video is required for ${senseTitle}`
    });
  } else {
    // Validate each video
    sense.signVideos.forEach((video: any) => {
      const videoErrors = validateSignVideo(video, senseTitle);
      errors.push(...videoErrors);
    });
  }

  // Validate examples if they exist
  if (sense.examples && sense.examples.length > 0) {
    sense.examples.forEach((example: any) => {
      const exampleErrors = validateExample(example, senseTitle);
      errors.push(...exampleErrors);
    });
  }

  // Validate sense translations if they exist
  if (sense.senseTranslations) {
    sense.senseTranslations.forEach((translation: any) => {
      if (!translation.translation || translation.translation.trim() === '') {
        errors.push({
          message: `Sense translation is required for ${senseTitle}`
        });
      }
    });
  }

  return errors;
}

function validateDefinition(definition: any, senseTitle: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check definition value
  if (!definition.definition || definition.definition.trim() === '') {
    errors.push({
      message: `Definition value is required for ${senseTitle}`
    });
  }

  // Check definition translations if they exist
  if (definition.definitionTranslations) {
    definition.definitionTranslations.forEach((translation: any) => {
      if (!translation.translation || translation.translation.trim() === '') {
        errors.push({
          message: `Definition translation is required for ${senseTitle}`
        });
      }
    });
  }

  return errors;
}

function validateExample(example: any, senseTitle: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check example value
  if (!example.example || example.example.trim() === '') {
    errors.push({
      message: `Example value is required for ${senseTitle}`
    });
  }

  // Check example translations if they exist
  if (example.exampleTranslations) {
    example.exampleTranslations.forEach((translation: any) => {
      if (!translation.translation || translation.translation.trim() === '') {
        errors.push({
          message: `Example translation is required for ${senseTitle}`
        });
      }
    });
  }

  return errors;
}

function validateSignVideo(signVideo: any, senseTitle: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if videos array exists and has at least one video
  if (!signVideo.videos || signVideo.videos.length === 0) {
    errors.push({
      message: `Video is required for ${senseTitle}`
    });
  } else {
    // Get the video title from SignVideo or use a default
    const videoTitle = signVideo.title && signVideo.title.trim() !== '' 
      ? signVideo.title 
      : 'Video #1';

    // Validate each video
    signVideo.videos.forEach((video: any) => {
      if (!video.angle || video.angle.trim() === '') {
        errors.push({
          message: `Video angle is required for video in ${senseTitle}`
        });
      } else if (!video.url || video.url.trim() === '') {
        errors.push({
          message: `Video URL is required for ${video.angle} angle in ${senseTitle}`
        });
      }
    });
  }

  return errors;
} 