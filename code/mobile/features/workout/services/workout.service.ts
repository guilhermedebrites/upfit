import apiClient from '@/shared/api/client';
import type { CreateWorkoutDto, Workout } from '../types/workout.types';

export const workoutService = {
  async create(dto: CreateWorkoutDto): Promise<Workout> {
    const { data } = await apiClient.post<Workout>('/workouts', dto);
    return data;
  },

  async listByUser(userId: string): Promise<Workout[]> {
    const { data } = await apiClient.get<Workout[]>(`/workouts/user/${userId}`);
    return data;
  },
};
