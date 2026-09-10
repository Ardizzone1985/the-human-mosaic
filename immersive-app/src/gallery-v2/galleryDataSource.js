import { supabase } from "../supabaseClient";
import {
  getLegacyIdentitySection,
  mapSlotsToGallery,
} from "./slotMapping";

const SLOTS_PER_SECTION = 600;

export async function loadIdentityGallerySection(sectionNumber) {
  const legacySource = getLegacyIdentitySection(sectionNumber);

  if (!legacySource) {
    return {
      type: "expansion",
      legacySource: null,
      slots: [],
    };
  }

  const { data, error } = await supabase
    .from("slots")
    .select(
      "slot_code, room, wall, section, row_number, col_number"
    )
    .eq("room", "Identity")
    .eq("wall", legacySource.wall)
    .eq("section", legacySource.section)
    .order("row_number", { ascending: true })
    .order("col_number", { ascending: true })
    .limit(SLOTS_PER_SECTION);

  if (error) {
    throw error;
  }

  const startIndex =
    (sectionNumber - 1) * SLOTS_PER_SECTION;

  return {
    type: "legacy",
    legacySource,
    slots: mapSlotsToGallery(
      data ?? [],
      startIndex
    ),
  };
}
