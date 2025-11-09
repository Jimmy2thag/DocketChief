import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'truthy', false && 'falsy')).toBe('base truthy');
    });

    it('should override conflicting tailwind classes', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end');
    });

    it('should handle array of classes', () => {
      expect(cn(['base', 'flex'], 'gap-2')).toBe('base flex gap-2');
    });

    it('should handle object syntax', () => {
      expect(cn({ base: true, hidden: false, flex: true })).toBe('base flex');
    });

    it('should handle empty input', () => {
      expect(cn()).toBe('');
    });
  });
});
