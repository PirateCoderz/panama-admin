export const joditBaseConfig = {
  readonly: false,
  height: 420,
  toolbarAdaptive: false,
  // Jodit will POST multipart/form-data to this URL when inserting images
  uploader: {
    url: '/api/blogs/upload?folder=content',
    insertImageAsBase64URI: false
  },
  // Clean/sanitize options (tweak as you like)
  cleanHTML: { fillEmptyParagraph: false }
};
