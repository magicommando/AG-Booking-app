import { resolveAssetUrl } from './api';

describe('resolveAssetUrl', () => {
  it('returns the backend origin for uploaded image paths', () => {
    expect(resolveAssetUrl('/uploads/test-image.jpg')).toBe('http://localhost:5000/uploads/test-image.jpg');
  });

  it('returns external URLs unchanged', () => {
    expect(resolveAssetUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
  });
});
