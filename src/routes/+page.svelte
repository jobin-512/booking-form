<script lang="ts">
  import ContactForm from '$lib/components/ContactForm.svelte';
</script>

<svelte:head>
  <title>Appointment Booking</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="w-full max-w-2xl">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Appointment Booking</h1>
    </div>
    
    <ContactForm />
  </div>
</div>
