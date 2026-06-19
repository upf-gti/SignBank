import {
  PrismaClient,
  Language,
  LexicalCategory,
  GlossStatus,
  Handedness,
  HandConfiguration,
  ConfigurationChange,
  RelationBetweenArticulators,
  Location,
  MovementRelatedOrientation,
  OrientationRelatedToLocation,
  OrientationChange,
  ContactType,
  MovementType,
  MovementDirection,
  RelationType,
} from '@prisma/client';

/** Simple one-handed phonology for SEGON inline morpheme and BESSONS-T_antiga. */
function buildBessonsComponentPhonology() {
  return {
    handedness: Handedness.ONE,
    location: Location.NEUTRAL_SPACE,
    orientationChange: OrientationChange.FLEXION,
    configurationChanges: ConfigurationChange.EMPTY,
    movementRelatedOrientation: MovementRelatedOrientation.EMPTY,
    orientationRelatedToLocation: OrientationRelatedToLocation.EMPTY,
    contactType: ContactType.EMPTY,
    movementType: MovementType.EMPTY,
    movementDirection: MovementDirection.EMPTY,
    vocalization: 'none',
    nonManualComponent: 'none',
    inicialization: 'none',
    repeatedMovement: false,
  };
}

/** Two-handed asymmetric phonology for GERMÀ (see synonym GERMÀ+Conf 2 in bessons-1d.json). */
function buildGermaPhonology() {
  return {
    handedness: Handedness.TWO_A,
    dominantConfiguration: HandConfiguration.CONF_2,
    nonDominantConfiguration: HandConfiguration.CONF_1,
    dominantRelationBetweenArticulators: RelationBetweenArticulators.NEXT_TO,
    nonDominantRelationBetweenArticulators: RelationBetweenArticulators.FRONT,
    configurationChanges: ConfigurationChange.OPENING,
    location: Location.NEUTRAL_SPACE,
    movementRelatedOrientation: MovementRelatedOrientation.FRONT,
    orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
    orientationChange: OrientationChange.FLEXION,
    contactType: ContactType.CONTINUOUS,
    movementType: MovementType.ARC,
    movementDirection: MovementDirection.FORWARDS,
    vocalization: 'none',
    nonManualComponent: 'none',
    inicialization: 'none',
    repeatedMovement: true,
  };
}

/** Phonology for the full BESSONS-1d compound sign (distinct from component phonology). */
function buildBessonsCompoundPhonology() {
  return {
    handedness: Handedness.TWO_S,
    dominantConfiguration: HandConfiguration.CONF_2,
    nonDominantConfiguration: HandConfiguration.CONF_2,
    dominantRelationBetweenArticulators: RelationBetweenArticulators.NEXT_TO,
    nonDominantRelationBetweenArticulators: RelationBetweenArticulators.NEXT_TO,
    configurationChanges: ConfigurationChange.OPENING_AND_SPREADING,
    location: Location.NEUTRAL_SPACE,
    movementRelatedOrientation: MovementRelatedOrientation.FRONT,
    orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
    orientationChange: OrientationChange.FLEXION,
    contactType: ContactType.CONTINUOUS,
    movementType: MovementType.ARC,
    movementDirection: MovementDirection.FORWARDS,
    vocalization: 'none',
    nonManualComponent: 'none',
    inicialization: 'none',
    repeatedMovement: true,
  };
}

/** One-handed phonology for TERCER inline morpheme in nested compound example. */
function buildTercerInlinePhonology() {
  return {
    handedness: Handedness.ONE,
    dominantConfiguration: HandConfiguration.CONF_3,
    configurationChanges: ConfigurationChange.CLOSING,
    location: Location.CHEST,
    movementRelatedOrientation: MovementRelatedOrientation.FRONT,
    orientationRelatedToLocation: OrientationRelatedToLocation.EMPTY,
    orientationChange: OrientationChange.EXTENSION,
    contactType: ContactType.FINAL,
    movementType: MovementType.STRAIGHT,
    movementDirection: MovementDirection.DOWNWARDS,
    vocalization: 'none',
    nonManualComponent: 'none',
    inicialization: 'none',
    repeatedMovement: false,
  };
}

/** Phonology for the full BESSONS-TRES nested compound sign. */
function buildBessonsTresCompoundPhonology() {
  return {
    handedness: Handedness.TWO_S,
    dominantConfiguration: HandConfiguration.CONF_3,
    nonDominantConfiguration: HandConfiguration.CONF_3,
    dominantRelationBetweenArticulators: RelationBetweenArticulators.NEXT_TO,
    nonDominantRelationBetweenArticulators: RelationBetweenArticulators.NEXT_TO,
    configurationChanges: ConfigurationChange.OPENING_AND_SPREADING,
    location: Location.NEUTRAL_SPACE,
    movementRelatedOrientation: MovementRelatedOrientation.FRONT,
    orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
    orientationChange: OrientationChange.FLEXION,
    contactType: ContactType.CONTINUOUS,
    movementType: MovementType.CIRCLE,
    movementDirection: MovementDirection.FORWARDS,
    vocalization: 'none',
    nonManualComponent: 'none',
    inicialization: 'none',
    repeatedMovement: true,
  };
}

/** Inline morpheme video — not a published gloss; only shown on the parent compound. */
async function attachInlinePartVideo(
  prisma: PrismaClient,
  compoundPartId: string,
  title: string,
  videoDataId: string,
  videoUrl: string,
) {
  const signVideo = await prisma.signVideo.create({
    data: {
      title,
      priority: 1,
      videoDataId,
      videos: {
        create: [{ url: videoUrl, angle: 'front', priority: 1 }],
      },
    },
  });

  await prisma.compoundPart.update({
    where: { id: compoundPartId },
    data: { inlineSignVideoId: signVideo.id },
  });
}

/**
 * Seeds BESSONS-1d compound example from Examples/bessons-1d.json:
 * GERMÀ (linked component) + SEGON (inline morpheme) → BESSONS-1d
 */
export async function seedCompoundBessonsExample(prisma: PrismaClient) {
  const germaGlossData = await prisma.glossData.create({
    data: {
      gloss: 'GERMÀ',
      externalId: '0165_dona_germa',
      definitions: {
        create: [
          {
            definition: 'Germà o germana',
            lexicalCategory: LexicalCategory.NOUN,
            priority: 1,
          },
        ],
      },
      glossVideos: {
        create: {
          title: 'GERMÀ',
          priority: 1,
          videoData: {
            create: buildGermaPhonology(),
          },
          videos: {
            create: [
              { url: 'videos/LSC_-_Cap.mp4', angle: 'front', priority: 1 },
            ],
          },
        },
      },
    },
  });

  await prisma.dictionaryEntry.create({
    data: {
      status: GlossStatus.PUBLISHED,
      currentVersion: 1,
      glossDataId: germaGlossData.id,
    },
  });

  const bessonsVariantGlossData = await prisma.glossData.create({
    data: {
      gloss: 'BESSONS-T_antiga',
      definitions: {
        create: [
          {
            definition: 'Variant antiga del signe de bessons',
            lexicalCategory: LexicalCategory.ADJECTIVE,
            priority: 1,
          },
        ],
      },
      glossVideos: {
        create: {
          title: 'BESSONS-T_antiga',
          priority: 1,
          videoData: {
            create: buildBessonsComponentPhonology(),
          },
          videos: {
            create: [
              { url: 'videos/LSC_-_Cames.mp4', angle: 'front', priority: 1 },
            ],
          },
        },
      },
    },
  });

  await prisma.dictionaryEntry.create({
    data: {
      status: GlossStatus.PUBLISHED,
      currentVersion: 1,
      glossDataId: bessonsVariantGlossData.id,
    },
  });

  const segonInlinePhonology = await prisma.videoData.create({
    data: buildBessonsComponentPhonology(),
  });

  const bessonsGlossData = await prisma.glossData.create({
    data: {
      gloss: 'BESSONS-1d',
      externalId: '1420_02_bessons-1d',
      isCompound: true,
      iconicity: 'SÍ (2 germans)',
      editComment: 'Semantic category (pending Category model): Família',
      glossTranslations: {
        create: [
          { translation: 'TWINS', language: Language.ENGLISH },
          { translation: 'GEMELOS', language: Language.SPANISH },
        ],
      },
      definitions: {
        create: [
          {
            definition: 'Nat d’un mateix part, amb un altre o altres',
            lexicalCategory: LexicalCategory.ADJECTIVE,
            priority: 1,
          },
        ],
      },
      compoundParts: {
        create: [
          {
            position: 1,
            gloss: 'GERMÀ',
            compExternalId: '0165_dona_germa',
            redundant: true,
            linkedGlossId: germaGlossData.id,
          },
          {
            position: 2,
            gloss: 'SEGON',
            redundant: false,
            inlinePhonologyId: segonInlinePhonology.id,
          },
        ],
      },
      glossVideos: {
        create: {
          title: 'BESSONS-1d',
          priority: 1,
          videoData: {
            create: buildBessonsCompoundPhonology(),
          },
          videos: {
            create: [
              { url: 'videos/LSC_-_Camell.mp4', angle: 'front', priority: 1 },
            ],
          },
        },
      },
    },
  });

  await prisma.dictionaryEntry.create({
    data: {
      status: GlossStatus.PUBLISHED,
      currentVersion: 1,
      glossDataId: bessonsGlossData.id,
    },
  });

  const segonPart = await prisma.compoundPart.findFirstOrThrow({
    where: { glossDataId: bessonsGlossData.id, gloss: 'SEGON' },
  });
  await attachInlinePartVideo(
    prisma,
    segonPart.id,
    'SEGON',
    segonInlinePhonology.id,
    'videos/LSC_-_Capa.mp4',
  );

  await prisma.relatedGloss.create({
    data: {
      relationType: RelationType.VARIANT,
      sourceGlossId: bessonsGlossData.id,
      targetGlossId: bessonsVariantGlossData.id,
    },
  });

  const tercerInlinePhonology = await prisma.videoData.create({
    data: buildTercerInlinePhonology(),
  });

  const bessonsTresGlossData = await prisma.glossData.create({
    data: {
      gloss: 'BESSONS-TRES',
      externalId: '1420_03_bessons-tres',
      isCompound: true,
      editComment: 'Nested compound demo: BESSONS-1d (level 1) + TERCER (inline)',
      definitions: {
        create: [
          {
            definition: 'Tres persones nades del mateix part',
            lexicalCategory: LexicalCategory.ADJECTIVE,
            priority: 1,
          },
        ],
      },
      compoundParts: {
        create: [
          {
            position: 1,
            gloss: 'BESSONS-1d',
            compExternalId: '1420_02_bessons-1d',
            redundant: true,
            linkedGlossId: bessonsGlossData.id,
          },
          {
            position: 2,
            gloss: 'TERCER',
            redundant: false,
            inlinePhonologyId: tercerInlinePhonology.id,
          },
        ],
      },
      glossVideos: {
        create: {
          title: 'BESSONS-TRES',
          priority: 1,
          videoData: {
            create: buildBessonsTresCompoundPhonology(),
          },
          videos: {
            create: [
              { url: 'videos/LSC_-_Car.mp4', angle: 'front', priority: 1 },
            ],
          },
        },
      },
    },
  });

  await prisma.dictionaryEntry.create({
    data: {
      status: GlossStatus.PUBLISHED,
      currentVersion: 1,
      glossDataId: bessonsTresGlossData.id,
    },
  });

  const tercerPart = await prisma.compoundPart.findFirstOrThrow({
    where: { glossDataId: bessonsTresGlossData.id, gloss: 'TERCER' },
  });
  await attachInlinePartVideo(
    prisma,
    tercerPart.id,
    'TERCER',
    tercerInlinePhonology.id,
    'videos/LSC_-_Cames.mp4',
  );

  console.log(
    'Compound seed: BESSONS-1d (GERMÀ + SEGON), BESSONS-TRES (BESSONS-1d + TERCER), GERMÀ, BESSONS-T_antiga',
  );
}
