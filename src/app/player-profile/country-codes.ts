import { CountryCode } from '@app/@shared/models';

/**
 * Dial codes offered in the phone-number fields. Both brands are licensed for Brazil only, so the
 * list holds a single entry; `PlayerProfileService.getCountryCodes()` still returns it as an
 * observable, ready for the day it comes from the API.
 */
export const COUNTRY_CODES: CountryCode[] = [{ name: 'Brazil', dial_code: '+55', code: 'BR' }];
