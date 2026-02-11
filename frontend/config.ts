export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getImageUrl = (
  imagePath: string | null | undefined
): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;

  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_URL}${cleanPath}`;
};
