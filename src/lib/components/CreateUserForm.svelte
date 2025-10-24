<script lang="ts">
  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let isLoading = false;
  let successMessage = '';
  let errorMessage = '';

  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      errorMessage = 'Please fill in all fields';
      return;
    }

    if (password !== confirmPassword) {
      errorMessage = 'Passwords do not match';
      return;
    }

    if (password.length < 6) {
      errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorMessage = 'Please enter a valid email address';
      return;
    }

    isLoading = true;
    errorMessage = '';
    successMessage = '';

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (data.success) {
        successMessage = `User "${data.user.name || data.user.email}" created successfully!`;
        // Reset form
        name = '';
        email = '';
        password = '';
        confirmPassword = '';
      } else {
        errorMessage = data.error || 'An error occurred. Please try again.';
      }
    } catch (err) {
      errorMessage = 'Network error. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
  <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">Create New User</h2>

  {#if successMessage}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      {successMessage}
    </div>
  {/if}

  {#if errorMessage}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {errorMessage}
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="space-y-4">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        Full Name *
      </label>
      <input
        type="text"
        id="name"
        bind:value={name}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter full name"
        required
      />
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
        Email Address *
      </label>
      <input
        type="email"
        id="email"
        bind:value={email}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter email address"
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
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter password (min 6 characters)"
        required
      />
    </div>

    <div>
      <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
        Confirm Password *
      </label>
      <input
        type="password"
        id="confirmPassword"
        bind:value={confirmPassword}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Confirm password"
        required
      />
    </div>

    <div class="text-center">
      <button
        type="submit"
        disabled={isLoading}
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'Creating User...' : 'Create User'}
      </button>
    </div>
  </form>
</div>
