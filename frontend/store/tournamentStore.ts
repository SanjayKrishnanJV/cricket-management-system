import { create } from 'zustand';
import { tournamentAPI } from '@/lib/api';
import { Tournament, PointsTableEntry } from '@/types';

interface TournamentState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  pointsTable: PointsTableEntry[];
  isLoading: boolean;
  error: string | null;
  fetchTournaments: () => Promise<void>;
  fetchTournamentById: (id: string) => Promise<void>;
  fetchPointsTable: (id: string) => Promise<void>;
  createTournament: (data: any) => Promise<Tournament>;
}

export const useTournamentStore = create<TournamentState>((set) => ({
  tournaments: [],
  currentTournament: null,
  pointsTable: [],
  isLoading: false,
  error: null,

  fetchTournaments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await tournamentAPI.getAll();
      set({
        tournaments: response.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch tournaments',
        isLoading: false,
      });
    }
  },

  fetchTournamentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tournamentAPI.getById(id);
      set({
        currentTournament: response.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch tournament',
        isLoading: false,
      });
    }
  },

  fetchPointsTable: async (id: string) => {
    try {
      const response = await tournamentAPI.getPointsTable(id);
      set({
        pointsTable: response.data.data,
      });
    } catch (error: any) {
      console.error('Failed to fetch points table:', error);
    }
  },

  createTournament: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tournamentAPI.create(data);
      const newTournament = response.data.data;
      set((state) => ({
        tournaments: [newTournament, ...state.tournaments],
        isLoading: false,
      }));
      return newTournament;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create tournament',
        isLoading: false,
      });
      throw error;
    }
  },
}));
