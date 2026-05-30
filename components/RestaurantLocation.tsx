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
    <section className="px-4 pb-10" aria-label="Restaurant Location">
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Visit Us</h2>
        {restaurant.restaurant_address && (
          <p className="mt-1 text-sm text-muted">{restaurant.restaurant_address}</p>
        )}
      </div>

      <div className="h-[280px] w-full overflow-hidden rounded-card border border-border shadow-sm">
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
