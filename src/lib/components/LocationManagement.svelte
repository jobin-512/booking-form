<script lang="ts">
  import { onMount } from 'svelte';

  interface Location {
    id: string;
    name: string;
    address: string | null;
    email: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  let locations: Location[] = [];
  let isLoading = true;
  let error = '';
  let successMessage = '';
  let deletingLocationId: string | null = null;
  let showCreateForm = false;
  let editingLocation: Location | null = null;

  // Form fields
  let newLocationName = '';
  let newLocationAddress = '';
  let newLocationEmail = '';
  let isSubmitting = false;

  onMount(async () => {
    await fetchLocations();
  });

  async function fetchLocations() {
    try {
      isLoading = true;
      error = '';
      
      const response = await fetch('/api/admin/locations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        locations = data.locations;
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Failed to fetch locations';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  async function createLocation() {
    if (!newLocationName.trim()) {
      error = 'Location name is required';
      return;
    }

    try {
      isSubmitting = true;
      error = '';
      successMessage = '';

      const response = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          name: newLocationName.trim(),
          address: newLocationAddress.trim() || null,
          email: newLocationEmail.trim() || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        successMessage = data.message;
        await fetchLocations();
        resetForm();
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Failed to create location';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  async function deleteLocation(locationId: string, locationName: string) {
    if (!confirm(`Are you sure you want to delete location "${locationName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      deletingLocationId = locationId;
      error = '';
      successMessage = '';

      const response = await fetch(`/api/admin/locations/${locationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        successMessage = data.message;
        await fetchLocations();
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Failed to delete location';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      deletingLocationId = null;
    }
  }

  function startEdit(location: Location) {
    editingLocation = location;
    newLocationName = location.name;
    newLocationAddress = location.address || '';
    newLocationEmail = location.email || '';
    showCreateForm = true;
  }

  async function updateLocation() {
    if (!editingLocation || !newLocationName.trim()) {
      error = 'Location name is required';
      return;
    }

    try {
      isSubmitting = true;
      error = '';
      successMessage = '';

      const response = await fetch(`/api/admin/locations/${editingLocation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          name: newLocationName.trim(),
          address: newLocationAddress.trim() || null,
          email: newLocationEmail.trim() || null,
          isActive: editingLocation.isActive
        })
      });

      if (response.ok) {
        const data = await response.json();
        successMessage = data.message;
        await fetchLocations();
        resetForm();
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Failed to update location';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  function resetForm() {
    newLocationName = '';
    newLocationAddress = '';
    newLocationEmail = '';
    showCreateForm = false;
    editingLocation = null;
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
</script>

<div class="max-w-7xl mx-auto">
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-medium text-gray-900">Location Management</h2>
        <div class="flex space-x-2">
          <button
            onclick={() => { resetForm(); showCreateForm = !showCreateForm; }}
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showCreateForm ? 'Cancel' : 'Add Location'}
          </button>
          <button
            onclick={fetchLocations}
            class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Refresh
          </button>
        </div>
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

      <!-- Create/Edit Form -->
      {#if showCreateForm}
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="text-md font-medium text-gray-900 mb-4">
            {editingLocation ? 'Edit Location' : 'Add New Location'}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="locationName" class="block text-sm font-medium text-gray-700 mb-1">
                Location Name *
              </label>
              <input
                type="text"
                id="locationName"
                bind:value={newLocationName}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter location name"
              />
            </div>
            <div>
              <label for="locationAddress" class="block text-sm font-medium text-gray-700 mb-1">
                Address (Optional)
              </label>
              <input
                type="text"
                id="locationAddress"
                bind:value={newLocationAddress}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address"
              />
            </div>
            <div>
              <label for="locationEmail" class="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                id="locationEmail"
                bind:value={newLocationEmail}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email"
              />
            </div>
          </div>
          <div class="mt-4 flex space-x-2">
            <button
              onclick={editingLocation ? updateLocation : createLocation}
              disabled={isSubmitting}
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (editingLocation ? 'Update Location' : 'Create Location')}
            </button>
            <button
              onclick={resetForm}
              class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      {/if}

      {#if isLoading}
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading locations...</p>
        </div>
      {:else if locations.length === 0}
        <div class="text-center py-8">
          <p class="text-gray-500">No locations found.</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {#each locations as location (location.id)}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {location.name}
                      </div>
                      {#if location.address}
                        <div class="text-sm text-gray-500">
                          {location.address}
                        </div>
                      {/if}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                      {location.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(location.createdAt)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        onclick={() => startEdit(location)}
                        class="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onclick={() => deleteLocation(location.id, location.name)}
                        disabled={deletingLocationId === location.id}
                        class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingLocationId === location.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
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
