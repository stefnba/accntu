import { apiClient, createMutation, createQuery } from '@/lib/api';

export const useUserProfile = createQuery(apiClient.user[':id'].$get, 'userProfile');

// Example usage for user list
const usersListEndpoint = apiClient.user.$get;
export const useUsersList = createQuery(usersListEndpoint, 'users');

// // Example usage for creating a user
const createUserEndpoint = apiClient.user.$post;
export const useCreateUser = createMutation(createUserEndpoint);

// // Example usage for GitHub OAuth login
// const githubLoginEndpoint = apiClient.auth.github.login.$post;
// export const useLoginGitHubOauth = createMutation(githubLoginEndpoint);
