import { create } from 'zustand';
import { matchAPI } from '@/lib/api';
import { Match } from '@/types';

interface MatchState {
  matches: Match[];
  currentMatch: Match | null;
  liveScore: any | null;
  isLoading: boolean;
  error: string | null;
  fetchMatches: (filters?: any) => Promise<void>;
  fetchMatchById: (id: string) => Promise<void>;
  fetchLiveScore: (id: string) => Promise<void>;
  updateLiveScore: (data: any) => void;
  createMatch: (data: any) => Promise<Match>;
}

export const useMatchStore = create<MatchState>((set) => ({
  matches: [],
  currentMatch: null,
  liveScore: null,
  isLoading: false,
  error: null,

  fetchMatches: async (filters?: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await matchAPI.getAll(filters);
      set({
        matches: response.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch matches',
        isLoading: false,
      });
    }
  },

  fetchMatchById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await matchAPI.getById(id);
      set({
        currentMatch: response.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch match',
        isLoading: false,
      });
    }
  },

  fetchLiveScore: async (id: string) => {
    try {
      const response = await matchAPI.getLiveScore(id);
      set({
        liveScore: response.data.data,
      });
    } catch (error: any) {
      console.error('Failed to fetch live score:', error);
    }
  },

  updateLiveScore: (data: any) => {
    set({ liveScore: data });
  },

  createMatch: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await matchAPI.create(data);
      const newMatch = response.data.data;
      set((state) => ({
        matches: [newMatch, ...state.matches],
        isLoading: false,
      }));
      return newMatch;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create match',
        isLoading: false,
      });
      throw error;
    }
  },
}));
