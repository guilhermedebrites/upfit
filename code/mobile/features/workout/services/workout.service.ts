import apiClient from '@/shared/api/client';
import type { CreateWorkoutDto, WorkoutDto } from '../types/workout.types';

export const workoutService = {
  async create(dto: CreateWorkoutDto): Promise<WorkoutDto> {
    const { data } = await apiClient.post<WorkoutDto>('/workouts', dto);
    return data;
  },

  async listByUser(userId: string): Promise<WorkoutDto[]> {
    const { data } = await apiClient.get<WorkoutDto[]>(`/workouts/user/${userId}`);
    return data;
  },
};
