export const SPONSOR_PLACEMENTS = {
  // Lobby
  LOBBY_LEFT: "lobby-left",
  LOBBY_RIGHT: "lobby-right",

  // Identity Room
  IDENTITY_TOP_LEFT: "identity-top-left",
  IDENTITY_TOP_RIGHT: "identity-top-right",
  IDENTITY_BOTTOM_LEFT: "identity-bottom-left",

  // Love Room
  LOVE_TOP_LEFT: "love-top-left",
  LOVE_TOP_RIGHT: "love-top-right",
  LOVE_BOTTOM_LEFT: "love-bottom-left",

  // Creativity Room
  CREATIVITY_TOP_LEFT: "creativity-top-left",
  CREATIVITY_TOP_RIGHT: "creativity-top-right",
  CREATIVITY_BOTTOM_LEFT: "creativity-bottom-left",
};

export function getRoomSponsorPlacement(room, position) {
  const normalizedRoom = String(room || "")
    .trim()
    .toLowerCase();

  const normalizedPosition = String(position || "")
    .trim()
    .toLowerCase();

  const placement = `${normalizedRoom}-${normalizedPosition}`;

  const validPlacements = Object.values(SPONSOR_PLACEMENTS);

  if (!validPlacements.includes(placement)) {
    console.warn(
      `Unknown sponsor placement: "${placement}"`
    );

    return null;
  }

  return placement;
}
