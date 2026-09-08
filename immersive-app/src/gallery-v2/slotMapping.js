export function createGalleryPosition(sectionNumber, row, column) {
  return {
    sectionNumber,
    row,
    column,
    galleryKey: `S${sectionNumber}-R${row}-C${column}`,
  };
}
