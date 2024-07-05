export function get_file_type(mine: string) {
  if (mine.startsWith('image')) {
    return 'image';
  } else if (mine.startsWith('video')) {
    return 'video';
  } else if (mine.includes('document')) {
    return 'document';
  } else {
    return 'unknown';
  }
}
