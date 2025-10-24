<script lang="ts">
  import Dashboard from '$lib/components/Dashboard.svelte';
  import { onMount } from 'svelte';
  import { authStore, setAuth, setLoading, clearAuth } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';

  let user = $derived($authStore.user);
  let token = $derived($authStore.token);
  let isLoading = $derived($authStore.isLoading);

  onMount(async () => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAuth(data.user, storedToken);
        } else {
          localStorage.removeItem('auth_token');
          clearAuth();
          goto('/login');
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
        clearAuth();
        goto('/login');
      }
    } else {
      goto('/login');
    }
  });
</script>

<svelte:head>
  <title>Dashboard - Booking System</title>
</svelte:head>

{#if isLoading}
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Loading dashboard...</p>
    </div>
  </div>
{:else if user}
  <Dashboard {user} />
{:else}
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p class="text-gray-600 mb-4">You need to be logged in to access the dashboard.</p>
      <a
        href="/login"
        class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Go to Login
      </a>
    </div>
  </div>
{/if}
