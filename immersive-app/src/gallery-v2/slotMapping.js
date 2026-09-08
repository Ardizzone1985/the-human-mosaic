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

export function sortSlotsForGallery(slots) {
  const wallOrder = {
    "Front Wall": 1,
    "Left Wall": 2,
    "Right Wall": 3,
  };

  return [...slots].sort((a, b) => {
    if (a.room !== b.room) {
      return String(a.room).localeCompare(String(b.room));
    }

    const wallA = wallOrder[a.wall] ?? 999;
    const wallB = wallOrder[b.wall] ?? 999;

    if (wallA !== wallB) {
      return wallA - wallB;
    }

    if (a.section !== b.section) {
      return String(a.section).localeCompare(String(b.section), undefined, {
        numeric: true,
      });
    }

    if (a.row_number !== b.row_number) {
      return Number(a.row_number) - Number(b.row_number);
    }

    return Number(a.col_number) - Number(b.col_number);
  });
}

export function mapSlotsToGallery(slots) {
  const sortedSlots = sortSlotsForGallery(slots);

  return sortedSlots.map((slot, index) => {
    const galleryPosition = galleryPositionFromIndex(index);

    return {
      ...slot,
      galleryPosition,
    };
  });
}
