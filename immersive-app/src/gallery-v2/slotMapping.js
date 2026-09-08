export function createGalleryPosition(sectionNumber, row, column) {
  return {
    sectionNumber,
    row,
    column,
    galleryKey: `S${sectionNumber}-R${row}-C${column}`,
  };
}

export function galleryPositionFromIndex(index) {
  const SLOTS_PER_SECTION = 600;
  const COLUMNS = 10;

  const sectionNumber = Math.floor(index / SLOTS_PER_SECTION) + 1;
  const indexInSection = index % SLOTS_PER_SECTION;

  const row = Math.floor(indexInSection / COLUMNS) + 1;
  const column = (indexInSection % COLUMNS) + 1;

  return createGalleryPosition(
    sectionNumber,
    row,
    column
  );
}
