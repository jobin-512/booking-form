<script lang="ts">
  import LoginForm from '$lib/components/LoginForm.svelte';
  import { onMount } from 'svelte';
  import { authStore, setAuth, setLoading } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';

  let user = $derived($authStore.user);
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
          goto('/dashboard');
        } else {
          localStorage.removeItem('auth_token');
          setLoading(false);
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  });
</script>

<svelte:head>
  <title>Login - Booking System</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
      Sign in to your account
    </h2>
    <p class="mt-2 text-center text-sm text-gray-600">
      Or
      <a href="/" class="font-medium text-blue-600 hover:text-blue-500">
        go back to home
      </a>
    </p>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    {#if isLoading}
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading...</p>
      </div>
    {:else}
      <LoginForm />
    {/if}
  </div>
</div>
