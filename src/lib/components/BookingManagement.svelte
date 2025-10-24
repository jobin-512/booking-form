<script lang="ts">
  import { onMount } from 'svelte';

  interface Location {
    id: string;
    name: string;
    address: string | null;
  }

  interface Booking {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    patientDateOfBirth: string;
    insuranceInfo: string;
    description: string;
    date: string;
    timeSlot: string;
    locationId: string;
    createdAt: string;
    location: Location;
  }

  let bookings: Booking[] = [];
  let locations: Location[] = [];
  let isLoading = true;
  let error = '';
  let successMessage = '';
  let deletingBookingId: string | null = null;

  // Filter states
  let startDate = '';
  let endDate = '';
  let selectedLocationId = '';

  onMount(async () => {
    await Promise.all([
      fetchBookings(),
      fetchLocations()
    ]);
  });

  async function fetchLocations() {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        locations = data.locations;
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  }

  async function fetchBookings() {
    try {
      isLoading = true;
      error = '';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedLocationId) params.append('locationId', selectedLocationId);

      const response = await fetch(`/api/admin/bookings?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        bookings = data.bookings;
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Failed to fetch bookings';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  async function deleteBooking(bookingId: string, customerName: string) {
    if (!confirm(`Are you sure you want to delete the booking for ${customerName}? This action cannot be undone.`)) {
      return;
    }

    try {
      deletingBookingId = bookingId;
      error = '';
      successMessage = '';

      const response = await fetch('/api/admin/bookings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ bookingId })
      });

      if (response.ok) {
        const data = await response.json();
        successMessage = data.message;
        await fetchBookings();
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Failed to delete booking';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      deletingBookingId = null;
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

  function formatDateForInput(dateString: string) {
    return new Date(dateString).toISOString().split('T')[0];
  }

  function applyFilters() {
    fetchBookings();
  }

  function clearFilters() {
    startDate = '';
    endDate = '';
    selectedLocationId = '';
    fetchBookings();
  }
</script>

<div class="max-w-7xl mx-auto">
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-medium text-gray-900">Booking Management</h2>
        <button
          onclick={fetchBookings}
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

      <!-- Filters -->
      <div class="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 class="text-md font-medium text-gray-900 mb-4">Filters</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              bind:value={startDate}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              bind:value={endDate}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              id="location"
              bind:value={selectedLocationId}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Locations</option>
              {#each locations as location}
                <option value={location.id}>{location.name}</option>
              {/each}
            </select>
          </div>
          <div class="flex items-end space-x-2">
            <button
              onclick={applyFilters}
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Apply Filters
            </button>
            <button
              onclick={clearFilters}
              class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {#if isLoading}
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading bookings...</p>
        </div>
      {:else if bookings.length === 0}
        <div class="text-center py-8">
          <p class="text-gray-500">No bookings found.</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
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
              {#each bookings as booking (booking.id)}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {booking.firstName} {booking.lastName}
                    </div>
                    <div class="text-sm text-gray-500">
                      DOB: {formatDateForInput(booking.patientDateOfBirth)}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {booking.email}
                    </div>
                    <div class="text-sm text-gray-500">
                      {booking.phoneNumber}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {formatDateForInput(booking.date)}
                    </div>
                    <div class="text-sm text-gray-500">
                      {booking.timeSlot}
                    </div>
                    <div class="text-sm text-gray-600 mt-1">
                      Insurance: {booking.insuranceInfo}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {booking.location.name}
                    </div>
                    {#if booking.location.address}
                      <div class="text-sm text-gray-500">
                        {booking.location.address}
                      </div>
                    {/if}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(booking.createdAt)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onclick={() => deleteBooking(booking.id, `${booking.firstName} ${booking.lastName}`)}
                      disabled={deletingBookingId === booking.id}
                      class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingBookingId === booking.id ? 'Deleting...' : 'Delete'}
                    </button>
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