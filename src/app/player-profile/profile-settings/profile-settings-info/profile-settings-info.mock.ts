import { Gender, MobileNumberPrefix, Country } from '@app/@shared/form-utils';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

export const GENDER_LIST: Gender[] = [
  { id: 1, label: marker('Male') },
  { id: 2, label: marker('Female') },
];

export const COUNTRY_LIST: Country[] = [
  { id: 1, label: 'Afghanistan' },
  { id: 2, label: 'Bahrain' },
  { id: 3, label: 'Canada' },
  { id: 4, label: 'Eritrea' },
  { id: 5, label: 'India' },
  { id: 6, label: 'Nepal' },
  { id: 7, label: 'Russia' },
  { id: 8, label: 'Uruguay' },
  { id: 9, label: 'Zambia' },
  { id: 10, label: 'Slovenia' },
];

export const MOBILE_NUMBER_PREFIX_LIST: MobileNumberPrefix[] = [
  { id: 1, label: '+44', flag: 'assets/general/flags/en.svg' },
  { id: 2, label: '+330', flag: 'assets/general/flags/en.svg' },
  { id: 3, label: '+441', flag: 'assets/general/flags/en.svg' },
  { id: 4, label: '+56', flag: 'assets/general/flags/en.svg' },
  { id: 5, label: '+72', flag: 'assets/general/flags/en.svg' },
  { id: 6, label: '+711', flag: 'assets/general/flags/en.svg' },
  { id: 7, label: '+222', flag: 'assets/general/flags/en.svg' },
  { id: 8, label: '+54', flag: 'assets/general/flags/en.svg' },
  { id: 9, label: '+77', flag: 'assets/general/flags/en.svg' },
  { id: 10, label: '+321', flag: 'assets/general/flags/en.svg' },
];
