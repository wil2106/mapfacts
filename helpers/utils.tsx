export const getFontSize = (score: number) => {
  if (score < 0) {
    return 14;
  }
  return Math.min(Math.round(Math.sqrt(score) + 14), 30);
};

export const getMinScore = (zoomLevel: number) => {
  return -(100 / 18) * zoomLevel + 100;
};
