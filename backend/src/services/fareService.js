// Fare rates per ride type
const FARE_RATES = {
  Economy: { base: 40, perKm: 12 },
  Premium: { base: 70, perKm: 20 },
  XL: { base: 60, perKm: 16 },
};

/**
 * Calculate fare based on ride type and distance
 */
const estimateFare = (rideType, distanceKm) => {
  const rate = FARE_RATES[rideType] || FARE_RATES.Economy;
  return Math.round(rate.base + rate.perKm * distanceKm);
};

/**
 * Simple Haversine distance between two lat/lng points (in km)
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

module.exports = { estimateFare, haversineDistance, FARE_RATES };
