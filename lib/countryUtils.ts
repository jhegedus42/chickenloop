/**
 * Utility functions for country name handling
 */

/**
 * Convert an ISO 3166-1 alpha-2 country code to a readable country name in English
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'FR')
 * @returns Country name in English, or the original code if conversion fails
 */
export function getCountryNameFromCode(countryCode: string): string {
  if (!countryCode || countryCode.trim() === '') {
    return '';
  }

  // Normalize to uppercase for ISO codes
  const normalizedCode = countryCode.trim().toUpperCase();

  // Use Intl.DisplayNames to convert ISO code to country name
  try {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const countryName = regionNames.of(normalizedCode);
    if (countryName) {
      return countryName;
    }
  } catch (e) {
    // Fall through to return original code
  }

  // If conversion fails, return the original code
  return normalizedCode;
}

/**
 * Convert a country name to English using Intl.DisplayNames
 * This handles cases where country names might be in other languages
 * @deprecated This function is for backward compatibility. Use getCountryNameFromCode for ISO codes.
 */
export function getCountryNameInEnglish(countryName: string): string {
  if (!countryName || countryName.trim() === '') {
    return '';
  }

  // Try to get the country code from common country name mappings
  // This is a fallback for when we have a country name but need to convert it
  const countryCodeMap: { [key: string]: string } = {
    // Common non-English country names mapped to ISO codes
    'España': 'ES',
    'Espagne': 'ES',
    'Spanien': 'ES',
    'Francia': 'FR',
    'France': 'FR',
    'Deutschland': 'DE',
    'Germany': 'DE',
    'Allemagne': 'DE',
    'Italia': 'IT',
    'Italy': 'IT',
    'Italie': 'IT',
    'Nederland': 'NL',
    'Netherlands': 'NL',
    'Pays-Bas': 'NL',
    'België': 'BE',
    'Belgium': 'BE',
    'Belgique': 'BE',
    'Portugal': 'PT',
    'Österreich': 'AT',
    'Austria': 'AT',
    'Autriche': 'AT',
    'Schweiz': 'CH',
    'Switzerland': 'CH',
    'Suisse': 'CH',
    'Sverige': 'SE',
    'Sweden': 'SE',
    'Suède': 'SE',
    'Norge': 'NO',
    'Norway': 'NO',
    'Norvège': 'NO',
    'Danmark': 'DK',
    'Denmark': 'DK',
    'Danemark': 'DK',
    'United Kingdom': 'GB',
    'UK': 'GB',
    'United States': 'US',
    'USA': 'US',
    'États-Unis': 'US',
    // Add more as needed
  };

  // Normalize the input country name
  const normalizedCountryName = countryName.trim();

  // If it's already in English format (common cases), return as is
  // We'll use a simple heuristic: if it starts with a capital letter and is recognizable, keep it
  const regionNamesInEnglish = new Intl.DisplayNames(['en'], { type: 'region' });

  // Try to find a country code from the map
  const upperCountry = normalizedCountryName.toUpperCase();
  let countryCode: string | undefined;

  // Check direct mapping
  if (countryCodeMap[normalizedCountryName]) {
    countryCode = countryCodeMap[normalizedCountryName];
  } else {
    // Try to find by checking if any key contains the country name or vice versa
    for (const [key, code] of Object.entries(countryCodeMap)) {
      if (key.toLowerCase() === normalizedCountryName.toLowerCase()) {
        countryCode = code;
        break;
      }
    }
  }

  // If we found a country code, convert it to English
  if (countryCode) {
    try {
      const englishName = regionNamesInEnglish.of(countryCode);
      if (englishName) {
        return englishName;
      }
    } catch (e) {
      // Fall through to return original
    }
  }

  // Alternative: Try to detect if it's already in English by checking against known English names
  // This is a simpler approach - if the name matches common English patterns, return it
  // For now, we'll return the original if we can't convert it
  // Nominatim with Accept-Language: en should already return English names, so this is a fallback

  // Try to reverse lookup: see if the country name matches any known English name
  // This is more complex, so for now we'll trust that Nominatim with Accept-Language returns English

  // Return the original name if we can't convert it (it's likely already in English)
  return normalizedCountryName;
}

