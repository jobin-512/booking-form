<script lang="ts">
  import { authStore, clearAuth } from '../stores/auth.js';
  import { goto } from '$app/navigation';
  import CreateUserForm from './CreateUserForm.svelte';
  import UserManagement from './UserManagement.svelte';
  import LocationManagement from './LocationManagement.svelte';
  import BookingManagement from './BookingManagement.svelte';

  let { user } = $props();
  let showCreateUserForm = $state(false);
  let showUserManagement = $state(false);
  let showLocationManagement = $state(false);
  let showBookingManagement = $state(false);

  function handleLogout() {
    clearAuth();
    localStorage.removeItem('auth_token');
    goto('/');
  }

  function toggleCreateUserForm() {
    showCreateUserForm = !showCreateUserForm;
    if (showCreateUserForm) {
      showUserManagement = false;
      showLocationManagement = false;
      showBookingManagement = false;
    }
  }

  function toggleUserManagement() {
    showUserManagement = !showUserManagement;
    if (showUserManagement) {
      showCreateUserForm = false;
      showLocationManagement = false;
      showBookingManagement = false;
    }
  }

  function toggleLocationManagement() {
    showLocationManagement = !showLocationManagement;
    if (showLocationManagement) {
      showCreateUserForm = false;
      showUserManagement = false;
      showBookingManagement = false;
    }
  }

  function toggleBookingManagement() {
    showBookingManagement = !showBookingManagement;
    if (showBookingManagement) {
      showCreateUserForm = false;
      showUserManagement = false;
      showLocationManagement = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-100">
  <!-- Navigation -->
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <h1 class="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-gray-700">Welcome, {user?.name || user?.email}</span>
          <button
              onclick={toggleBookingManagement}
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {showBookingManagement ? 'Hide Bookings' : 'Manage Bookings'}
            </button>
            <button
              onclick={toggleLocationManagement}
              class="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {showLocationManagement ? 'Hide Locations' : 'Manage Locations'}
            </button>
          {#if user?.role === 'admin'}
            <button
              onclick={toggleUserManagement}
              class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {showUserManagement ? 'Hide Users' : 'Manage Users'}
            </button>
            <button
              onclick={toggleCreateUserForm}
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {showCreateUserForm ? 'Cancel' : 'Create User'}
            </button>
          {/if}
          <button
            onclick={handleLogout}
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Booking Management Section -->
      {#if showBookingManagement}
        <div class="mb-6">
          <BookingManagement />
        </div>
      {/if}

      <!-- Location Management Section -->
      {#if showLocationManagement}
        <div class="mb-6">
          <LocationManagement />
        </div>
      {/if}

      <!-- User Management Section -->
      {#if showUserManagement}
        <div class="mb-6">
          <UserManagement />
        </div>
      {/if}

      <!-- Create User Form -->
      {#if showCreateUserForm}
        <div class="mb-6">
          <CreateUserForm />
        </div>
      {/if}

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">User Information</h2>
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Name</dt>
              <dd class="mt-1 text-sm text-gray-900">{user?.name || 'Not provided'}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">User ID</dt>
              <dd class="mt-1 text-sm text-gray-900 font-mono">{user?.id}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Profile</dt>
                  <dd class="text-lg font-medium text-gray-900">Manage Account</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {#if user?.role === 'admin'}
          <button 
            type="button"
            class="bg-white overflow-hidden shadow rounded-lg cursor-pointer w-full text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            onclick={toggleLocationManagement}
          >
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Location Management</dt>
                    <dd class="text-lg font-medium text-gray-900">Manage Locations</dd>
                  </dl>
                </div>
              </div>
            </div>
          </button>

          <button 
            type="button"
            class="bg-white overflow-hidden shadow rounded-lg cursor-pointer w-full text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onclick={toggleUserManagement}
          >
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">User Management</dt>
                    <dd class="text-lg font-medium text-gray-900">View All Users</dd>
                  </dl>
                </div>
              </div>
            </div>
          </button>

          <button 
            type="button"
            class="bg-white overflow-hidden shadow rounded-lg cursor-pointer w-full text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onclick={toggleBookingManagement}
          >
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Booking Management</dt>
                    <dd class="text-lg font-medium text-gray-900">View & Manage Bookings</dd>
                  </dl>
                </div>
              </div>
            </div>
          </button>

          <button 
            type="button"
            class="bg-white overflow-hidden shadow rounded-lg cursor-pointer w-full text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            onclick={toggleCreateUserForm}
          >
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Create User</dt>
                    <dd class="text-lg font-medium text-gray-900">Add New User</dd>
                  </dl>
                </div>
              </div>
            </div>
          </button>
        {/if}

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Contact Forms</dt>
                  <dd class="text-lg font-medium text-gray-900">View Submissions</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
