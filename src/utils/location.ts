export const getBlurredCoordinates = (
  latitude: number,
  longitude: number,
  radiusInMeters = 1000
): { latitude: number; longitude: number } => {
  const r = radiusInMeters / 111320; // Convert meters to degrees (~111.32km per 1° lat)
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const latOffset = w * Math.cos(t);
  const lonOffset = w * Math.sin(t) / Math.cos((latitude * Math.PI) / 180);

  return {
    latitude: latitude + latOffset,
    longitude: longitude + lonOffset,
  };
};
