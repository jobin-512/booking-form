<script lang="ts">
  import { onMount } from 'svelte';

  interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
  }

  let users: User[] = [];
  let isLoading = true;
  let error = '';
  let successMessage = '';
  let deletingUserId: string | null = null;

  onMount(async () => {
    await fetchUsers();
  });

  async function fetchUsers() {
    try {
      isLoading = true;
      error = '';
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        users = data.users;
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Failed to fetch users';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  async function deleteUser(userId: string, userEmail: string) {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      deletingUserId = userId;
      error = '';
      successMessage = '';

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        successMessage = data.message;
        // Remove user from local list
        users = users.filter(user => user.id !== userId);
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Failed to delete user';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      deletingUserId = null;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getRoleBadgeClass(role: string) {
    return role === 'admin' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-blue-100 text-blue-800';
  }
</script>

<div class="max-w-7xl mx-auto">
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-medium text-gray-900">User Management</h2>
        <button
          onclick={fetchUsers}
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      {#if successMessage}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      {/if}

      {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      {/if}

      {#if isLoading}
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading users...</p>
        </div>
      {:else if users.length === 0}
        <div class="text-center py-8">
          <p class="text-gray-500">No users found.</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each users as user (user.id)}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-700">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {user.name || 'No name'}
                        </div>
                        <div class="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getRoleBadgeClass(user.role)}">
                      {user.role}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {#if user.role !== 'admin'}
                      <button
                        onclick={() => deleteUser(user.id, user.email)}
                        disabled={deletingUserId === user.id}
                        class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                      </button>
                    {:else}
                      <span class="text-gray-400">Protected</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</div>

