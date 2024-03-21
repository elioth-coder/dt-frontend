<script>
  import { Button, Modal, P } from "flowbite-svelte";
  import { ExclamationCircleOutline } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  export let open;
  export let message;

  const dispatch = createEventDispatcher();

  const handleClose = () => {
    dispatch('cancel');
  };

  const handleContinue = () => {
    dispatch('continue');
    dispatch('cancel')
  };
</script>

<Modal
  bind:open={open}
  size="xs" 
  on:close={handleClose}
  autoclose={false}
  dismissable
  class="w-full"
  on:close={() => dispatch("cancel")}
>
<div class="text-center">
  <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
  <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{message}</h3>
  <Button on:click={handleContinue} color="red" class="me-2">Continue</Button>
  <Button on:click={handleClose} color="alternative">Cancel</Button>
</div>

</Modal>
