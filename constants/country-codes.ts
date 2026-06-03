/**
 * Country codes with flags — used for phone-number inputs with country-code
 * selection. Syria first (default), then the wider MENA region for quick
 * access, then the rest of the world alphabetically.
 * Ported from web `constants/countryCodes.js`.
 */

export type CountryCode = {
  code: string;
  flag: string;
  country: string;
};

export const countryCodes: CountryCode[] = [
  // Syria first (default), then the wider MENA region for quick access
  { code: '+963', flag: '🇸🇾', country: 'Syria' },
  { code: '+971', flag: '🇦🇪', country: 'UAE' },
  { code: '+966', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: '+965', flag: '🇰🇼', country: 'Kuwait' },
  { code: '+974', flag: '🇶🇦', country: 'Qatar' },
  { code: '+973', flag: '🇧🇭', country: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', country: 'Oman' },
  { code: '+961', flag: '🇱🇧', country: 'Lebanon' },
  { code: '+962', flag: '🇯🇴', country: 'Jordan' },
  { code: '+970', flag: '🇵🇸', country: 'Palestine' },
  { code: '+964', flag: '🇮🇶', country: 'Iraq' },
  { code: '+20', flag: '🇪🇬', country: 'Egypt' },
  { code: '+218', flag: '🇱🇾', country: 'Libya' },
  { code: '+249', flag: '🇸🇩', country: 'Sudan' },
  { code: '+212', flag: '🇲🇦', country: 'Morocco' },
  { code: '+213', flag: '🇩🇿', country: 'Algeria' },
  { code: '+216', flag: '🇹🇳', country: 'Tunisia' },
  { code: '+967', flag: '🇾🇪', country: 'Yemen' },
  { code: '+90', flag: '🇹🇷', country: 'Turkey' },

  // Rest of the world (alphabetical by country name)
  { code: '+93', flag: '🇦🇫', country: 'Afghanistan' },
  { code: '+355', flag: '🇦🇱', country: 'Albania' },
  { code: '+244', flag: '🇦🇴', country: 'Angola' },
  { code: '+54', flag: '🇦🇷', country: 'Argentina' },
  { code: '+374', flag: '🇦🇲', country: 'Armenia' },
  { code: '+61', flag: '🇦🇺', country: 'Australia' },
  { code: '+43', flag: '🇦🇹', country: 'Austria' },
  { code: '+994', flag: '🇦🇿', country: 'Azerbaijan' },
  { code: '+880', flag: '🇧🇩', country: 'Bangladesh' },
  { code: '+375', flag: '🇧🇾', country: 'Belarus' },
  { code: '+32', flag: '🇧🇪', country: 'Belgium' },
  { code: '+591', flag: '🇧🇴', country: 'Bolivia' },
  { code: '+387', flag: '🇧🇦', country: 'Bosnia & Herzegovina' },
  { code: '+55', flag: '🇧🇷', country: 'Brazil' },
  { code: '+359', flag: '🇧🇬', country: 'Bulgaria' },
  { code: '+855', flag: '🇰🇭', country: 'Cambodia' },
  { code: '+237', flag: '🇨🇲', country: 'Cameroon' },
  { code: '+1', flag: '🇨🇦', country: 'Canada' },
  { code: '+56', flag: '🇨🇱', country: 'Chile' },
  { code: '+86', flag: '🇨🇳', country: 'China' },
  { code: '+57', flag: '🇨🇴', country: 'Colombia' },
  { code: '+506', flag: '🇨🇷', country: 'Costa Rica' },
  { code: '+385', flag: '🇭🇷', country: 'Croatia' },
  { code: '+357', flag: '🇨🇾', country: 'Cyprus' },
  { code: '+420', flag: '🇨🇿', country: 'Czech Republic' },
  { code: '+45', flag: '🇩🇰', country: 'Denmark' },
  { code: '+593', flag: '🇪🇨', country: 'Ecuador' },
  { code: '+503', flag: '🇸🇻', country: 'El Salvador' },
  { code: '+372', flag: '🇪🇪', country: 'Estonia' },
  { code: '+251', flag: '🇪🇹', country: 'Ethiopia' },
  { code: '+358', flag: '🇫🇮', country: 'Finland' },
  { code: '+33', flag: '🇫🇷', country: 'France' },
  { code: '+995', flag: '🇬🇪', country: 'Georgia' },
  { code: '+49', flag: '🇩🇪', country: 'Germany' },
  { code: '+233', flag: '🇬🇭', country: 'Ghana' },
  { code: '+30', flag: '🇬🇷', country: 'Greece' },
  { code: '+502', flag: '🇬🇹', country: 'Guatemala' },
  { code: '+504', flag: '🇭🇳', country: 'Honduras' },
  { code: '+852', flag: '🇭🇰', country: 'Hong Kong' },
  { code: '+36', flag: '🇭🇺', country: 'Hungary' },
  { code: '+354', flag: '🇮🇸', country: 'Iceland' },
  { code: '+91', flag: '🇮🇳', country: 'India' },
  { code: '+62', flag: '🇮🇩', country: 'Indonesia' },
  { code: '+353', flag: '🇮🇪', country: 'Ireland' },
  { code: '+39', flag: '🇮🇹', country: 'Italy' },
  { code: '+225', flag: '🇨🇮', country: 'Ivory Coast' },
  { code: '+81', flag: '🇯🇵', country: 'Japan' },
  { code: '+7', flag: '🇰🇿', country: 'Kazakhstan' },
  { code: '+254', flag: '🇰🇪', country: 'Kenya' },
  { code: '+82', flag: '🇰🇷', country: 'South Korea' },
  { code: '+996', flag: '🇰🇬', country: 'Kyrgyzstan' },
  { code: '+371', flag: '🇱🇻', country: 'Latvia' },
  { code: '+370', flag: '🇱🇹', country: 'Lithuania' },
  { code: '+352', flag: '🇱🇺', country: 'Luxembourg' },
  { code: '+60', flag: '🇲🇾', country: 'Malaysia' },
  { code: '+356', flag: '🇲🇹', country: 'Malta' },
  { code: '+52', flag: '🇲🇽', country: 'Mexico' },
  { code: '+373', flag: '🇲🇩', country: 'Moldova' },
  { code: '+976', flag: '🇲🇳', country: 'Mongolia' },
  { code: '+382', flag: '🇲🇪', country: 'Montenegro' },
  { code: '+95', flag: '🇲🇲', country: 'Myanmar' },
  { code: '+977', flag: '🇳🇵', country: 'Nepal' },
  { code: '+31', flag: '🇳🇱', country: 'Netherlands' },
  { code: '+64', flag: '🇳🇿', country: 'New Zealand' },
  { code: '+234', flag: '🇳🇬', country: 'Nigeria' },
  { code: '+389', flag: '🇲🇰', country: 'North Macedonia' },
  { code: '+47', flag: '🇳🇴', country: 'Norway' },
  { code: '+92', flag: '🇵🇰', country: 'Pakistan' },
  { code: '+507', flag: '🇵🇦', country: 'Panama' },
  { code: '+595', flag: '🇵🇾', country: 'Paraguay' },
  { code: '+51', flag: '🇵🇪', country: 'Peru' },
  { code: '+63', flag: '🇵🇭', country: 'Philippines' },
  { code: '+48', flag: '🇵🇱', country: 'Poland' },
  { code: '+351', flag: '🇵🇹', country: 'Portugal' },
  { code: '+40', flag: '🇷🇴', country: 'Romania' },
  { code: '+7', flag: '🇷🇺', country: 'Russia' },
  { code: '+381', flag: '🇷🇸', country: 'Serbia' },
  { code: '+65', flag: '🇸🇬', country: 'Singapore' },
  { code: '+421', flag: '🇸🇰', country: 'Slovakia' },
  { code: '+386', flag: '🇸🇮', country: 'Slovenia' },
  { code: '+252', flag: '🇸🇴', country: 'Somalia' },
  { code: '+27', flag: '🇿🇦', country: 'South Africa' },
  { code: '+34', flag: '🇪🇸', country: 'Spain' },
  { code: '+94', flag: '🇱🇰', country: 'Sri Lanka' },
  { code: '+46', flag: '🇸🇪', country: 'Sweden' },
  { code: '+41', flag: '🇨🇭', country: 'Switzerland' },
  { code: '+886', flag: '🇹🇼', country: 'Taiwan' },
  { code: '+992', flag: '🇹🇯', country: 'Tajikistan' },
  { code: '+255', flag: '🇹🇿', country: 'Tanzania' },
  { code: '+66', flag: '🇹🇭', country: 'Thailand' },
  { code: '+993', flag: '🇹🇲', country: 'Turkmenistan' },
  { code: '+256', flag: '🇺🇬', country: 'Uganda' },
  { code: '+380', flag: '🇺🇦', country: 'Ukraine' },
  { code: '+44', flag: '🇬🇧', country: 'UK' },
  { code: '+1', flag: '🇺🇸', country: 'USA' },
  { code: '+598', flag: '🇺🇾', country: 'Uruguay' },
  { code: '+998', flag: '🇺🇿', country: 'Uzbekistan' },
  { code: '+58', flag: '🇻🇪', country: 'Venezuela' },
  { code: '+84', flag: '🇻🇳', country: 'Vietnam' },
  { code: '+260', flag: '🇿🇲', country: 'Zambia' },
  { code: '+263', flag: '🇿🇼', country: 'Zimbabwe' },
];

/** Default country code (Syria). */
export const DEFAULT_COUNTRY_CODE = '+963';

/** Find a country entry by its dial code. */
export const findCountryByCode = (code: string): CountryCode | undefined =>
  countryCodes.find((c) => c.code === code);

/**
 * Split a full phone number (e.g. "+963988123456") into its dial code and the
 * national part. Matches longer codes first. Returns null when no code matches.
 */
export const extractCountryCode = (
  phoneNumber?: string | null
): { countryCode: string; phoneNumber: string } | null => {
  if (!phoneNumber) return null;
  const sorted = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
  for (const country of sorted) {
    if (phoneNumber.startsWith(country.code)) {
      return {
        countryCode: country.code,
        phoneNumber: phoneNumber.replace(country.code, '').trim(),
      };
    }
  }
  return null;
};
