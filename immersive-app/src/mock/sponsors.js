import atlasLogo from "../assets/sponsors/atlas-cultural-foundation.svg";

export const MOCK_SPONSORS = {
  // Lobby
  "lobby-left": null,
  "lobby-right": null,

  // Identity Room
  "identity-top-left": {
  company: "Atlas Cultural Foundation",
  title: "Official Cultural Partner",
  website: "https://example.com",
  image: atlasLogo,
  active: true,
},

  "identity-top-right": null,
  "identity-bottom-left": null,

  // Love Room
  "love-top-left": null,

  "love-top-right": {
    company: "Human Bonds Initiative",
    title: "Supporting Stories of Connection",
    website: "https://example.com",
    image: null,
    active: true,
  },

  "love-bottom-left": null,

  // Creativity Room
  "creativity-top-left": null,
  "creativity-top-right": null,

  "creativity-bottom-left": {
    company: "Open Canvas Collective",
    title: "Creative Community Partner",
    website: "https://example.com",
    image: null,
    active: true,
  },
};

export function getMockSponsor(placement) {
  if (!placement) {
    return null;
  }

  return MOCK_SPONSORS[placement] || null;
}
