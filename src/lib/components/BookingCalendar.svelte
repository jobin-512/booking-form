<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.js';

  interface Appointment {
    id: string;
    firstName: string;
    lastName: string;
    date: string;
    timeSlot: string;
    locationId: string;
    locationName?: string;
  }

  let selectedDate = $state(new Date().toISOString().split('T')[0]);
  let appointments = $state<Appointment[]>([]);
  let isLoading = $state(false);
  let error = $state('');

  onMount(() => {
    // Set initial date to today
    loadAppointments();
  });

  async function loadAppointments() {
    if (!selectedDate) return;
    if (!$authStore.token) {
      error = 'Authentication required';
      return;
    }
    
    isLoading = true;
    error = '';
    
    try {
      const response = await fetch(`/api/appointments/date/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${$authStore.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        appointments = data.appointments;
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Failed to load appointments';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleDateChange(event: Event) {
    selectedDate = (event.target as HTMLInputElement).value;
    loadAppointments();
  }

  function viewAppointmentDetails(appointmentId: string) {
    goto(`/dashboard/appointment/${appointmentId}`);
  }

  function formatTime(timeSlot: string): string {
    // Handle case when timeSlot might be undefined or in wrong format
    if (!timeSlot || !timeSlot.includes(':')) {
      return 'Time not available';
    }
    
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = timeSlot.split(':');
    const hour = parseInt(hours);
    if (isNaN(hour)) return 'Invalid time';
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-xl font-semibold text-gray-900 mb-4">Appointment Calendar</h2>
  
  <div class="mb-6">
    <label for="calendarDate" class="block text-sm font-medium text-gray-700 mb-2">
      Select Date
    </label>
    <input
      type="date"
      id="calendarDate"
      value={selectedDate}
      on:change={handleDateChange}
      class="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  {#if isLoading}
    <div class="flex justify-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {:else if appointments.length === 0}
    <div class="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
      <p class="text-gray-600">No appointments scheduled for this date.</p>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each appointments as appointment (appointment.id)}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(appointment.timeSlot)}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.firstName} {appointment.lastName}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.locationName || 'Unknown'}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  on:click={() => viewAppointmentDetails(appointment.id)}
                  class="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                >
                  View Details
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>