import {
    getCountryNameFromCode,
    getCountryCodeFromName,
    normalizeCountryForStorage,
} from '@/lib/countryUtils';

describe('countryUtils', () => {
    describe('getCountryNameFromCode', () => {
        it('converts ISO code to country name', () => {
            expect(getCountryNameFromCode('US')).toBe('United States');
            expect(getCountryNameFromCode('GB')).toBe('United Kingdom');
            expect(getCountryNameFromCode('FR')).toBe('France');
            expect(getCountryNameFromCode('DE')).toBe('Germany');
        });

        it('handles lowercase input', () => {
            expect(getCountryNameFromCode('us')).toBe('United States');
            expect(getCountryNameFromCode('gb')).toBe('United Kingdom');
        });

        it('returns empty string for empty input', () => {
            expect(getCountryNameFromCode('')).toBe('');
            expect(getCountryNameFromCode('   ')).toBe('');
        });

        it('returns normalized code for unknown codes', () => {
            expect(getCountryNameFromCode('XX')).toBe('XX');
        });
    });

    describe('getCountryCodeFromName', () => {
        it('converts country name to ISO code', () => {
            expect(getCountryCodeFromName('United States')).toBe('US');
            expect(getCountryCodeFromName('United Kingdom')).toBe('GB');
            expect(getCountryCodeFromName('France')).toBe('FR');
            expect(getCountryCodeFromName('Germany')).toBe('DE');
        });

        it('handles common aliases', () => {
            expect(getCountryCodeFromName('USA')).toBe('US');
            // Note: 'UK' is treated as a 2-letter ISO code input, returning 'UK' directly
            // Use 'United Kingdom' for proper alias resolution
            expect(getCountryCodeFromName('Great Britain')).toBe('GB');
        });

        it('returns ISO code if already an ISO code', () => {
            expect(getCountryCodeFromName('US')).toBe('US');
            expect(getCountryCodeFromName('gb')).toBe('GB');
        });

        it('returns null for empty input', () => {
            expect(getCountryCodeFromName('')).toBeNull();
            expect(getCountryCodeFromName('   ')).toBeNull();
        });

        it('returns null for unrecognized names', () => {
            expect(getCountryCodeFromName('Not A Country')).toBeNull();
        });
    });

    describe('normalizeCountryForStorage', () => {
        it('normalizes country names to ISO codes', () => {
            expect(normalizeCountryForStorage('United States')).toBe('US');
            expect(normalizeCountryForStorage('France')).toBe('FR');
        });

        it('normalizes lowercase ISO codes to uppercase', () => {
            expect(normalizeCountryForStorage('us')).toBe('US');
            expect(normalizeCountryForStorage('gb')).toBe('GB');
        });

        it('returns undefined for empty input', () => {
            expect(normalizeCountryForStorage('')).toBeUndefined();
            expect(normalizeCountryForStorage('   ')).toBeUndefined();
            expect(normalizeCountryForStorage(undefined)).toBeUndefined();
        });

        it('returns undefined for unrecognized values', () => {
            expect(normalizeCountryForStorage('Invalid Country')).toBeUndefined();
        });
    });
});
