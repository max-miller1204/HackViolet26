import { Venue } from '../../types';

// Demo venues for hackathon - centered around a typical city downtown area
// Using coordinates around San Francisco as an example

export const DEMO_VENUES: Venue[] = [
  {
    id: 'venue-1',
    name: 'The Rooftop Bar',
    address: '123 Main Street',
    latitude: 37.7849,
    longitude: -122.4094,
    type: 'bar',
    crowdLevel: 'medium',
    safetyRating: 4.5,
    womenOwned: true,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-2',
    name: 'Luna Lounge',
    address: '456 Market Street',
    latitude: 37.7879,
    longitude: -122.4074,
    type: 'lounge',
    crowdLevel: 'high',
    safetyRating: 4.8,
    womenOwned: true,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-3',
    name: 'The Golden Gate',
    address: '789 Mission Street',
    latitude: 37.7859,
    longitude: -122.4024,
    type: 'bar',
    crowdLevel: 'low',
    safetyRating: 4.2,
    womenOwned: false,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-4',
    name: 'Starlight Club',
    address: '321 Howard Street',
    latitude: 37.7889,
    longitude: -122.3964,
    type: 'club',
    crowdLevel: 'high',
    safetyRating: 4.0,
    womenOwned: false,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-5',
    name: 'The Speakeasy',
    address: '555 Folsom Street',
    latitude: 37.7829,
    longitude: -122.3984,
    type: 'bar',
    crowdLevel: 'medium',
    safetyRating: 4.6,
    womenOwned: true,
    hasSecurityStaff: false,
  },
  {
    id: 'venue-6',
    name: 'Sunset Terrace',
    address: '777 Harrison Street',
    latitude: 37.7799,
    longitude: -122.4004,
    type: 'restaurant',
    crowdLevel: 'low',
    safetyRating: 4.7,
    womenOwned: true,
    hasSecurityStaff: false,
  },
  {
    id: 'venue-7',
    name: 'The Vault',
    address: '999 Bryant Street',
    latitude: 37.7769,
    longitude: -122.4054,
    type: 'club',
    crowdLevel: 'high',
    safetyRating: 3.8,
    womenOwned: false,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-8',
    name: 'Whiskey Blues',
    address: '111 Brannan Street',
    latitude: 37.7839,
    longitude: -122.3924,
    type: 'bar',
    crowdLevel: 'medium',
    safetyRating: 4.3,
    womenOwned: false,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-9',
    name: 'The Garden Room',
    address: '222 Townsend Street',
    latitude: 37.7809,
    longitude: -122.3944,
    type: 'lounge',
    crowdLevel: 'low',
    safetyRating: 4.9,
    womenOwned: true,
    hasSecurityStaff: false,
  },
  {
    id: 'venue-10',
    name: 'Electric Avenue',
    address: '333 King Street',
    latitude: 37.7779,
    longitude: -122.3914,
    type: 'club',
    crowdLevel: 'high',
    safetyRating: 4.1,
    womenOwned: false,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-11',
    name: 'The Wine Cellar',
    address: '444 Berry Street',
    latitude: 37.7749,
    longitude: -122.3974,
    type: 'restaurant',
    crowdLevel: 'low',
    safetyRating: 4.8,
    womenOwned: true,
    hasSecurityStaff: false,
  },
  {
    id: 'venue-12',
    name: 'Neon Nights',
    address: '555 Channel Street',
    latitude: 37.7719,
    longitude: -122.3894,
    type: 'club',
    crowdLevel: 'high',
    safetyRating: 3.9,
    womenOwned: false,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-13',
    name: 'The Cozy Corner',
    address: '666 3rd Street',
    latitude: 37.7869,
    longitude: -122.3854,
    type: 'bar',
    crowdLevel: 'low',
    safetyRating: 4.5,
    womenOwned: true,
    hasSecurityStaff: false,
  },
  {
    id: 'venue-14',
    name: 'Sky High',
    address: '777 4th Street',
    latitude: 37.7839,
    longitude: -122.3874,
    type: 'lounge',
    crowdLevel: 'medium',
    safetyRating: 4.4,
    womenOwned: false,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-15',
    name: 'The Jazz Spot',
    address: '888 5th Street',
    latitude: 37.7809,
    longitude: -122.4044,
    type: 'bar',
    crowdLevel: 'medium',
    safetyRating: 4.6,
    womenOwned: true,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-16',
    name: 'Moonlight Bistro',
    address: '999 6th Street',
    latitude: 37.7779,
    longitude: -122.4084,
    type: 'restaurant',
    crowdLevel: 'low',
    safetyRating: 4.7,
    womenOwned: true,
    hasSecurityStaff: false,
  },
  {
    id: 'venue-17',
    name: 'The Social House',
    address: '100 7th Street',
    latitude: 37.7749,
    longitude: -122.4114,
    type: 'bar',
    crowdLevel: 'high',
    safetyRating: 4.2,
    womenOwned: false,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-18',
    name: 'Crystal Lounge',
    address: '200 8th Street',
    latitude: 37.7719,
    longitude: -122.4144,
    type: 'lounge',
    crowdLevel: 'medium',
    safetyRating: 4.5,
    womenOwned: true,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-19',
    name: 'The Mix',
    address: '300 9th Street',
    latitude: 37.7689,
    longitude: -122.4114,
    type: 'club',
    crowdLevel: 'high',
    safetyRating: 4.0,
    womenOwned: false,
    hasSecurityStaff: true,
  },
  {
    id: 'venue-20',
    name: 'Olive & Vine',
    address: '400 10th Street',
    latitude: 37.7659,
    longitude: -122.4154,
    type: 'restaurant',
    crowdLevel: 'low',
    safetyRating: 4.8,
    womenOwned: true,
    hasSecurityStaff: false,
  },
];

// Helper to get crowd level based on time of day
export const getSimulatedCrowdLevel = (
  venue: Venue,
  time: Date = new Date()
): Venue['crowdLevel'] => {
  const hour = time.getHours();

  // Late night (10pm - 2am) - high crowds at clubs
  if (hour >= 22 || hour < 2) {
    if (venue.type === 'club') return 'high';
    if (venue.type === 'bar' || venue.type === 'lounge') return 'medium';
    return 'low';
  }

  // Evening (6pm - 10pm) - medium crowds everywhere
  if (hour >= 18 && hour < 22) {
    if (venue.type === 'restaurant') return 'high';
    return 'medium';
  }

  // Daytime - low crowds
  return 'low';
};

// Get venues sorted by safety rating
export const getVenuesBySafetyRating = (): Venue[] => {
  return [...DEMO_VENUES].sort(
    (a, b) => (b.safetyRating || 0) - (a.safetyRating || 0)
  );
};

// Get women-owned venues
export const getWomenOwnedVenues = (): Venue[] => {
  return DEMO_VENUES.filter((v) => v.womenOwned);
};

// Get venues by type
export const getVenuesByType = (type: Venue['type']): Venue[] => {
  return DEMO_VENUES.filter((v) => v.type === type);
};

// Get venues with security
export const getVenuesWithSecurity = (): Venue[] => {
  return DEMO_VENUES.filter((v) => v.hasSecurityStaff);
};

// Search venues by name
export const searchVenues = (query: string): Venue[] => {
  const lowercaseQuery = query.toLowerCase();
  return DEMO_VENUES.filter(
    (v) =>
      v.name.toLowerCase().includes(lowercaseQuery) ||
      v.address.toLowerCase().includes(lowercaseQuery)
  );
};
