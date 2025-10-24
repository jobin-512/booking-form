<script lang="ts">
  import { onMount } from 'svelte';

  interface TimeSlot {
    time: string;
    display: string;
    isAvailable: boolean;
    isBooked: boolean;
  }

  let { locationId, selectedDate = $bindable(), selectedTimeSlot = $bindable() } = $props();

  let availableSlots = $state<TimeSlot[]>([]);
  let isLoadingSlots = $state(false);
  let error = $state('');

  onMount(() => {
    // Set minimum date to tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    
    // Set maximum date to 3 months from now
    const maxDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Set default min/max attributes
    const dateInput = document.getElementById('appointmentDate') as HTMLInputElement;
    if (dateInput) {
      dateInput.min = minDate;
      dateInput.max = maxDate;
      // Set default value to tomorrow
      dateInput.value = minDate;
      selectedDate = minDate;
      onDateChange();
    }
  });

  async function onDateChange() {
    if (!selectedDate || !locationId) return;
    
    isLoadingSlots = true;
    error = '';
    selectedTimeSlot = '';
    
    try {
      const response = await fetch(`/api/appointments/slots?locationId=${locationId}&date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        availableSlots = data.slots;
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Failed to load time slots';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      isLoadingSlots = false;
    }
  }

  function selectTimeSlot(slot: TimeSlot) {
    if (slot.isAvailable && !slot.isBooked) {
      selectedTimeSlot = slot.time;
    }
  }

  function getDayOfWeek(dateString: string): number {
    const date = new Date(dateString);
    return date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  }

  function isDateDisabled(dateString: string): boolean {
    const dayOfWeek = getDayOfWeek(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to beginning of day
    
    const selectedDate = new Date(dateString);
    
    // Disable dates before tomorrow
    if (selectedDate < tomorrow) {
      return true;
    }
    
    // Disable dates more than 3 months in the future
    const maxDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    if (selectedDate > maxDate) {
      return true;
    }
    
    return false;
  }
</script>

<div class="space-y-6">
  <!-- Date Selection -->
  <div>
    <label for="appointmentDate" class="block text-sm font-medium text-gray-700 mb-2">
      Select Date<span class="text-red-500">*</span>
    </label>
    <input
      type="date"
      id="appointmentDate"
      bind:value={selectedDate}
      onchange={onDateChange}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required
    />
    <p class="mt-1 text-sm text-gray-500">
      Available: Monday-Friday (9AM-11:30AM, 1PM-4:30PM), Saturday (9AM-5PM), Sunday (9AM-12PM)
    </p>
  </div>

  <!-- Time Slot Selection -->
  {#if selectedDate}
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Select Time Slot<span class="text-red-500">*</span>
      </label>
      
      {#if isLoadingSlots}
        <div class="flex items-center justify-center py-8">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span class="ml-2 text-gray-600">Loading available slots...</span>
        </div>
      {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      {:else if availableSlots.length === 0}
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No available slots for this date. Please select another date.
        </div>
      {:else}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {#each availableSlots as slot (slot.time)}
            <button
              type="button"
              onclick={() => selectTimeSlot(slot)}
              disabled={!slot.isAvailable || slot.isBooked}
              class="px-3 py-2 text-sm font-medium rounded-md border transition-colors duration-200 {
                selectedTimeSlot === slot.time 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : slot.isAvailable && !slot.isBooked
                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }"
            >
              {slot.display}
            </button>
          {/each}
        </div>
        
        {#if selectedTimeSlot}
          <div class="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <p class="text-sm text-green-800">
              <span class="font-medium">Selected:</span> {availableSlots.find(s => s.time === selectedTimeSlot)?.display}
            </p>
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>
