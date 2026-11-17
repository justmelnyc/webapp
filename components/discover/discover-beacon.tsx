import { Beacon } from '@/components/streams/beacon'

/** Discover's broadcast (`DISCOVER.BEACON_TEXT`), shown to signed-in viewers under the hero. */
export const DiscoverBeacon = () => (
  <Beacon
    storageKey="lastDiscoverBeaconVersion"
    version="1"
    text="Explore creators, curated categories and communities."
    className="Hero bg-white"
  />
)
