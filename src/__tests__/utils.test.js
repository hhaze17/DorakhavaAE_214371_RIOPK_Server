import { formatDate, formatCurrency, truncateText } from '../utils';

describe('Utils Module', () => {
  describe('formatDate', () => {
    test('formats date correctly', () => {
      const date = new Date('2023-05-15T12:30:45');
      expect(formatDate(date)).toBe('15.05.2023');
    });

    test('handles string date input', () => {
      expect(formatDate('2023-05-15T12:30:45')).toBe('15.05.2023');
    });

    test('returns empty string for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('formatCurrency', () => {
    test('formats currency correctly with default options', () => {
      expect(formatCurrency(1234.56)).toBe('1 234,56 ₽');
    });

    test('formats currency with custom currency symbol', () => {
      expect(formatCurrency(1234.56, '$')).toBe('1 234,56 $');
    });

    test('handles zero values', () => {
      expect(formatCurrency(0)).toBe('0,00 ₽');
    });

    test('handles negative values', () => {
      expect(formatCurrency(-1234.56)).toBe('-1 234,56 ₽');
    });

    test('handles string number input', () => {
      expect(formatCurrency('1234.56')).toBe('1 234,56 ₽');
    });

    test('returns empty string for invalid number', () => {
      expect(formatCurrency('invalid-number')).toBe('');
      expect(formatCurrency(null)).toBe('');
      expect(formatCurrency(undefined)).toBe('');
    });
  });

  describe('truncateText', () => {
    test('truncates text that exceeds max length', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long...');
    });

    test('does not truncate text shorter than max length', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });

    test('handles text equal to max length', () => {
      const exactText = '12345678901234567890';
      expect(truncateText(exactText, 20)).toBe('12345678901234567890');
    });

    test('uses custom suffix when provided', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncateText(longText, 20, ' [...]')).toBe('This is a very long [...]');
    });

    test('handles empty string', () => {
      expect(truncateText('', 20)).toBe('');
    });

    test('handles null or undefined input', () => {
      expect(truncateText(null, 20)).toBe('');
      expect(truncateText(undefined, 20)).toBe('');
    });
  });
}); 