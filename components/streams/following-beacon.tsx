import { Beacon } from './beacon'

/** Following's broadcast (`FOLLOWING.BEACON_TEXT`), sitting under the fixed navbar. */
export const FollowingBeacon = () => (
  <Beacon
    storageKey="lastFollowingBeaconVersion"
    version="1"
    text="Follow the creators and communities that inspire you."
    className="Hero bg-white pt-[85px] bp2:pt-80"
  />
)
