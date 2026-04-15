import apiClient from '@/shared/api/client';
import type { Group, GroupMember, CreateGroupDto } from '../types/groups.types';

export const groupsService = {
  async list(): Promise<Group[]> {
    const { data } = await apiClient.get<Group[]>('/groups');
    return data;
  },

  async listMine(): Promise<Group[]> {
    const { data } = await apiClient.get<Group[]>('/groups/my');
    return data;
  },

  async getById(id: string): Promise<Group> {
    const { data } = await apiClient.get<Group>(`/groups/${id}`);
    return data;
  },

  async create(dto: CreateGroupDto): Promise<Group> {
    const { data } = await apiClient.post<Group>('/groups', dto);
    return data;
  },

  async update(id: string, dto: Partial<CreateGroupDto>): Promise<Group> {
    const { data } = await apiClient.put<Group>(`/groups/${id}`, dto);
    return data;
  },

  async join(id: string): Promise<void> {
    await apiClient.post(`/groups/${id}/join`);
  },

  async leave(id: string): Promise<void> {
    await apiClient.delete(`/groups/${id}/leave`);
  },

  async getMembers(id: string): Promise<GroupMember[]> {
    const { data } = await apiClient.get<GroupMember[]>(`/groups/${id}/members`);
    return data;
  },

  async getRanking(id: string): Promise<GroupMember[]> {
    const { data } = await apiClient.get<GroupMember[]>(`/groups/${id}/ranking`);
    return data;
  },

  async getUploadUrl(filename: string): Promise<{ presignedUrl: string; objectUrl: string }> {
    const { data } = await apiClient.get<{ presignedUrl: string; objectUrl: string }>(
      `/groups/upload-url?filename=${encodeURIComponent(filename)}`,
    );
    return data;
  },
};
