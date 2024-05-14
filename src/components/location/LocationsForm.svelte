<script>
  import {
    Button,
    Modal,
    Label,
    Input,
    Spinner,
    Alert,
  } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";
  import LocationService from "../../services/LocationService";
  import { ExclamationCircleSolid, InfoCircleSolid } from "flowbite-svelte-icons";
  export let open;
  export let item = null;

  let { HOST_URL } = CONFIG;
  const dispatch = createEventDispatcher();
  let photoSrc = "";
  let processing = false;
  let message = null;
  let service = new LocationService();

  const handlePhotoChange = (e) => {
    let files = e.target.files;

    if (files.length) {
      photoSrc = URL.createObjectURL(files[0]);
    } else {
      photoSrc = "";
    }
  };

  const handleClose = () => {
    photoSrc = "";
    message = null;
    dispatch("cancel");
  };

  const handleSubmit = async (e) => {
    processing = true;
    let form = e.target;
    let formData = new FormData(form);

    try {
      if(formData.get('id')) {
        await service.update(formData);
        message = {
          type: "success",
          text: "Successfully updated location",
        };
      } else {
        await service.add(formData);
        message = {
          type: "success",
          text: "Successfully added location",
        };
      }

      setTimeout(() => {
        processing = false;
        dispatch("cancel");
        dispatch("update");
        message = null;
      }, 1000);
    } catch (e) {
      message = {
        type: "error",
        text: e.message,
      };
      processing = false;
    }
  };

  $: item, (() => {
    if(item) {
      photoSrc = `${HOST_URL}/uploads/${item.photo}`;
    }
  })()

  const closeAlert = () => {
    message = null;
  };
</script>

<Modal
  bind:open={open}
  size="xs" 
  title="LOCATION"
  placement="top-center"
  dismissable={false}
  autoclose={false}
  class="w-full"
  on:close={() => dispatch("cancel")}
>
  <form
    on:submit|preventDefault={handleSubmit}
    class="flex flex-col space-y-6 text-left"
    action="#"
  >
    {#if item}
      <input type="hidden" name="id" value={item.id} />
    {/if}
    <input type="submit" id="submit" class="hidden" />
    {#if photoSrc}
      <!-- svelte-ignore a11y-img-redundant-alt -->
      <img
        class="mx-auto h-32"
        src={photoSrc}
        alt="Location photo"
      />
    {/if}
    <Label class="space-y-2">
      <span>Photo</span>
      <Input
        disabled={processing}
        type="file"
        name="photo"
        id="photo"
        on:change={handlePhotoChange}
      />
    </Label>
    <Label class="space-y-2">
      <span>Name</span>
      <Input
        disabled={processing}
        type="text"
        name="name"
        value={item?.name ?? ''}
        placeholder="Enter location name"
        required
      />
    </Label>
    <div>
      <Button
        disabled={processing}
        on:click={() => document.getElementById("submit").click()}
      >
        {#if processing}
          <Spinner size={4} class="mr-2" />
        {/if}
        Submit
      </Button>
      <Button disabled={processing} color="alternative" on:click={handleClose}
        >Cancel</Button
      >
    </div>
  </form>
  {#if message}
    <div class="absolute max-w-md w-full top-full mt-5 -ml-5">
      {#if message.type == "error"}
        <Alert color="red" class="m-0" dismissable on:close={closeAlert}>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          {message.text}
        </Alert>
      {/if}
      {#if message.type == "success"}
        <Alert color="green" class="m-0" dismissable on:close={closeAlert}>
          <InfoCircleSolid slot="icon" class="w-4 h-4" />
          {message.text}
        </Alert>
      {/if}
    </div>
  {/if}
</Modal>
