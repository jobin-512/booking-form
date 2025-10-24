<script lang="ts">
  import { onMount } from 'svelte';
  import AppointmentCalendar from './AppointmentCalendar.svelte';

  interface Location {
    id: string;
    name: string;
    address: string | null;
  }

  let firstName = '';
  let lastName = '';
  let email = '';
  let phoneNumber = '';
  let storeInfo = false;
  let patientDateOfBirth = '';
  let insuranceInfo = '';
  let description = '';
  let selectedLocationId = '';
  let isLoading = false;
  let successMessage = '';
  let errorMessage = '';
  let locations: Location[] = [];
  let locationsLoading = true;

  // Appointment calendar bindings
  let selectedDate = '';
  let selectedTimeSlot = '';

  onMount(async () => {
    await fetchLocations();
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
    } finally {
      locationsLoading = false;
    }
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!firstName || !lastName || !email || !phoneNumber || !patientDateOfBirth || !insuranceInfo || !description || !selectedLocationId || !selectedDate || !selectedTimeSlot) {
      errorMessage = 'Please fill in all required fields including appointment date and time';
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
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          email, 
          phoneNumber, 
          storeInfo, 
          patientDateOfBirth, 
          insuranceInfo, 
          description,
          locationId: selectedLocationId,
          date: selectedDate,
          timeSlot: selectedTimeSlot
        })
      });

      const data = await response.json();

      if (data.success) {
        successMessage = data.message;
        // Reset form
        firstName = '';
        lastName = '';
        email = '';
        phoneNumber = '';
        storeInfo = false;
        patientDateOfBirth = '';
        insuranceInfo = '';
        description = '';
        selectedLocationId = '';
        selectedDate = '';
        selectedTimeSlot = '';
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

<div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
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

  <form onsubmit={handleSubmit} class="space-y-6">
    <!-- Personal Information Section -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
            First Name<span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            bind:value={firstName}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
            Last Name<span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            bind:value={lastName}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email<span class="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          bind:value={email}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-1">
          Phone Number<span class="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phoneNumber"
          bind:value={phoneNumber}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div class="flex items-start">
        <input
          type="checkbox"
          id="storeInfo"
          bind:checked={storeInfo}
          class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="storeInfo" class="ml-2 text-sm text-gray-700">
          Store my information for faster checkout in the future.
        </label>
      </div>

      <p class="text-sm text-gray-600">
        By signing up, you may receive exclusive promotions by email.
      </p>
    </div>

    <!-- Additional Questions Section -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">Additional questions</h3>
      
      <div>
        <label for="patientDateOfBirth" class="block text-sm font-medium text-gray-700 mb-1">
          Patient Date of Birth<span class="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="patientDateOfBirth"
          bind:value={patientDateOfBirth}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label for="insuranceInfo" class="block text-sm font-medium text-gray-700 mb-1">
          If Available, Please Provide Insurance Info (If No Insurance Type NONE)<span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="insuranceInfo"
          bind:value={insuranceInfo}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter insurance information or NONE"
          required
        />
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Please Give Us A Brief Description of What You Need<span class="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          bind:value={description}
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your needs..."
          required
        ></textarea>
      </div>

      <div>
        <label for="location" class="block text-sm font-medium text-gray-700 mb-1">
          Preferred Location<span class="text-red-500">*</span>
        </label>
        {#if locationsLoading}
          <div class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
            Loading locations...
          </div>
        {:else if locations.length === 0}
          <div class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500">
            No locations available
          </div>
        {:else}
          <select
            id="location"
            bind:value={selectedLocationId}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a location</option>
            {#each locations as location (location.id)}
              <option value={location.id}>
                {location.name}{location.address ? ` - ${location.address}` : ''}
              </option>
            {/each}
          </select>
        {/if}
      </div>
    </div>

    <!-- Appointment Booking Section -->
    {#if selectedLocationId}
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">Appointment Booking</h3>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <AppointmentCalendar bind:selectedDate bind:selectedTimeSlot locationId={selectedLocationId} />
        </div>
      </div>
    {/if}

    <div class="text-center">
      <button
        type="submit"
        disabled={isLoading}
        class="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  </form>
</div>
