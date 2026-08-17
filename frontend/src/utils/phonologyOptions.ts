import {
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
} from '../types/enums';
import translate from './translate'

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export function usePhonologyOptions() {
  const  t = (key: string) => translate(key);

  const handednessOptions: SelectOption[] = Object.values(Handedness).map(value => ({
    value,
    label: t(`phonology.handedness.${value}`),
    description: t(`phonology.handedness.${value}_description`),
  }));

  /** @deprecated Use handednessOptions */
  const handOptions = handednessOptions;

  const handConfigurationOptions: SelectOption[] = Object.values(HandConfiguration).map(value => ({
    value,
    label: t(`phonology.handConfiguration.${value}`),
  }));

  const configurationChangeOptions: SelectOption[] = Object.values(ConfigurationChange).map(value => ({
    value,
    label: t(`phonology.configurationChange.${value}`),
    description: t(`phonology.configurationChange.${value}_description`),
  }));

  const relationBetweenArticulatorsOptions: SelectOption[] = Object.values(RelationBetweenArticulators).map(value => ({
    value,
    label: t(`phonology.relationBetweenArticulators.${value}`),
  }));

  const locationOptions: SelectOption[] = Object.values(Location).map(value => ({
    value,
    label: t(`phonology.location.${value}`),
  }));

  const movementRelatedOrientationOptions: SelectOption[] = Object.values(MovementRelatedOrientation).map(value => ({
    value,
    label: t(`phonology.movementRelatedOrientation.${value}`),
  }));

  const orientationRelatedToLocationOptions: SelectOption[] = Object.values(OrientationRelatedToLocation).map(value => ({
    value,
    label: t(`phonology.orientationRelatedToLocation.${value}`),
  }));

  const orientationChangeOptions: SelectOption[] = Object.values(OrientationChange).map(value => ({
    value,
    label: t(`phonology.orientationChange.${value}`),
  }));

  const contactTypeOptions: SelectOption[] = Object.values(ContactType).map(value => ({
    value,
    label: t(`phonology.contactType.${value}`),
  }));

  const movementTypeOptions: SelectOption[] = Object.values(MovementType).map(value => ({
    value,
    label: t(`phonology.movementType.${value}`),
  }));

  const movementDirectionOptions: SelectOption[] = Object.values(MovementDirection).map(value => ({
    value,
    label: t(`phonology.movementDirection.${value}`),
  }));

  return {
    handednessOptions,
    handOptions,
    handConfigurationOptions,
    configurationChangeOptions,
    relationBetweenArticulatorsOptions,
    locationOptions,
    movementRelatedOrientationOptions,
    orientationRelatedToLocationOptions,
    orientationChangeOptions,
    contactTypeOptions,
    movementTypeOptions,
    movementDirectionOptions,
  };
}

export type PhonologySelectOption = SelectOption;

export function getOptionLabel(options: SelectOption[], value: string | null | undefined): string {
  if (!value) return '';
  const option = options.find(o => o.value === value);
  return option ? option.label : value;
}
