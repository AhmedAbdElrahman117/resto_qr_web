import type { Restaurant } from '../lib/types';

interface Props {
  restaurant: Restaurant;
}

const DEFAULT_LAT = 26.34238477952103;
const DEFAULT_LNG = 31.88907426045935;

export default function RestaurantLocation({ restaurant }: Props) {
  // Use default lat and lng for the map query
  const mapQuery = `${DEFAULT_LAT},${DEFAULT_LNG}`;

  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&output=embed&z=16`;

  return (
    <section className="location-section" aria-label="Restaurant Location">
      <div className="location-header">
        <h2 className="location-title">Visit Us</h2>
        {restaurant.restaurant_address && (
          <p className="location-address">{restaurant.restaurant_address}</p>
        )}
      </div>

      <div className="map-embed-wrapper">
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Restaurant location"
        />
      </div>
    </section>
  );
}
