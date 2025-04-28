export const MAX_SIZE_UPLOAD_IMAGE = 5 * 1024 * 1024; // 5MB

export enum ImageSizeType {
  original = 'original',
  large = 'large',
  medium = 'medium',
  small = 'small',
  thumbnail = 'thumbnail',
}

export enum ImageSize {
  large = 900,
  medium = 300,
  small = 100,
  thumbnail = 50,
}

export enum ImageQuality {
  high = 100,
  medium = 80,
  low = 50,
}

export enum ImageFit {
  cover = 'cover',
  contain = 'contain',
  fill = 'fill',
  inside = 'inside',
  outside = 'outside',
}

export enum ImageContentType {
  png = 'image/png',
  webp = 'image/webp',
  jpg = 'image/jpg',
  jpeg = 'image/jpeg',
  svg = 'image/svg+xml',
  gif = 'image/gif',
  avif = 'image/avif',
}
