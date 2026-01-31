import { create } from 'zustand';
import { RideRequest, SocialPost, RideRequestType } from '../types';

interface SocialState {
  posts: SocialPost[];
  rideRequests: RideRequest[];
  isLoading: boolean;
  error: string | null;

  // Actions
  createRideRequest: (
    userId: string,
    displayName: string,
    type: RideRequestType,
    fromLocation: string,
    toLocation: string,
    departureTime: Date,
    maxPassengers?: number
  ) => RideRequest;
  cancelRideRequest: (requestId: string) => void;
  matchRideRequest: (requestId: string, matchedUserId: string) => void;
  completeRide: (requestId: string) => void;
  getOpenRideRequests: () => RideRequest[];
  getUserRideRequests: (userId: string) => RideRequest[];
  createPost: (post: Omit<SocialPost, 'id' | 'createdAt'>) => SocialPost;
  deletePost: (postId: string) => void;
  clearError: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// Demo data for social feed
const DEMO_RIDE_REQUESTS: RideRequest[] = [
  {
    id: 'demo-ride-1',
    userId: 'user-1',
    userDisplayName: 'Sarah M.',
    type: 'need_ride',
    fromLocation: 'Downtown Bar District',
    toLocation: 'North Suburbs',
    departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    status: 'open',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'demo-ride-2',
    userId: 'user-2',
    userDisplayName: 'Emily K.',
    type: 'offer_ride',
    fromLocation: 'Campus Area',
    toLocation: 'Downtown',
    departureTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
    maxPassengers: 3,
    status: 'open',
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: 'demo-ride-3',
    userId: 'user-3',
    userDisplayName: 'Jessica L.',
    type: 'need_ride',
    fromLocation: 'Luna Lounge',
    toLocation: 'West Side Apartments',
    departureTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
    status: 'open',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
];

const DEMO_POSTS: SocialPost[] = [
  {
    id: 'demo-post-1',
    userId: 'user-4',
    userDisplayName: 'Amanda R.',
    type: 'safety_tip',
    content:
      'Pro tip: Always share your location with a friend before heading out! The SafeNight app makes this super easy.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'demo-post-2',
    userId: 'user-5',
    userDisplayName: 'Rachel T.',
    type: 'venue_review',
    content:
      'The Rooftop Bar on Main Street has great security and well-lit parking. Felt very safe there last night!',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
];

export const useSocialStore = create<SocialState>((set, get) => ({
  posts: DEMO_POSTS,
  rideRequests: DEMO_RIDE_REQUESTS,
  isLoading: false,
  error: null,

  createRideRequest: (
    userId,
    displayName,
    type,
    fromLocation,
    toLocation,
    departureTime,
    maxPassengers
  ) => {
    const request: RideRequest = {
      id: generateId(),
      userId,
      userDisplayName: displayName,
      type,
      fromLocation,
      toLocation,
      departureTime,
      maxPassengers,
      status: 'open',
      createdAt: new Date(),
    };

    // Also create a social post for the ride request
    const post: SocialPost = {
      id: generateId(),
      userId,
      userDisplayName: displayName,
      type: 'ride_request',
      content:
        type === 'need_ride'
          ? `Looking for a ride from ${fromLocation} to ${toLocation}`
          : `Offering a ride from ${fromLocation} to ${toLocation}`,
      rideRequest: request,
      createdAt: new Date(),
    };

    set((state) => ({
      rideRequests: [request, ...state.rideRequests],
      posts: [post, ...state.posts],
    }));

    return request;
  },

  cancelRideRequest: (requestId) => {
    set((state) => ({
      rideRequests: state.rideRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'cancelled' } : r
      ),
    }));
  },

  matchRideRequest: (requestId, matchedUserId) => {
    set((state) => ({
      rideRequests: state.rideRequests.map((r) =>
        r.id === requestId
          ? { ...r, status: 'matched', matchedWith: matchedUserId }
          : r
      ),
    }));
  },

  completeRide: (requestId) => {
    set((state) => ({
      rideRequests: state.rideRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'completed' } : r
      ),
    }));
  },

  getOpenRideRequests: () => {
    return get().rideRequests.filter((r) => r.status === 'open');
  },

  getUserRideRequests: (userId) => {
    return get().rideRequests.filter((r) => r.userId === userId);
  },

  createPost: (postData) => {
    const post: SocialPost = {
      ...postData,
      id: generateId(),
      createdAt: new Date(),
    };

    set((state) => ({
      posts: [post, ...state.posts],
    }));

    return post;
  },

  deletePost: (postId) => {
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
    }));
  },

  clearError: () => set({ error: null }),
}));
