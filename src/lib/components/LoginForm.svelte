<script lang="ts">
  import { authStore, setAuth, setLoading } from '../stores/auth.js';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let name = '';
  let isLogin = true;
  let error = '';
  let isLoading = false;

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!email || !password) {
      error = 'Please fill in all required fields';
      return;
    }

    if (!isLogin && !name) {
      error = 'Please provide your name';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name: isLogin ? undefined : name })
      });

      const data = await response.json();

      if (data.success) {
        setAuth(data.user, data.token);
        localStorage.setItem('auth_token', data.token);
        goto('/dashboard');
      } else {
        error = data.error || 'An error occurred';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function toggleMode() {
    isLogin = !isLogin;
    error = '';
    email = '';
    password = '';
    name = '';
  }
</script>

<div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
  <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">
    {isLogin ? 'Login' : 'Register'}
  </h2>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="space-y-4">
    {#if !isLogin}
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          bind:value={name}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your name"
        />
      </div>
    {/if}

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
        Email *
      </label>
      <input
        type="email"
        id="email"
        bind:value={email}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your email"
        required
      />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
        Password *
      </label>
      <input
        type="password"
        id="password"
        bind:value={password}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your password"
        required
      />
    </div>

    <button
      type="submit"
      disabled={isLoading}
      class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
    </button>
  </form>

  <div class="mt-4 text-center">
    <button
      type="button"
      onclick={toggleMode}
      class="text-blue-600 hover:text-blue-800 text-sm"
    >
    </button>
  </div>
</div>
