<script>
  import { Button, Modal, Label, Input, Spinner, Alert } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";
  import DocumentService from "../services/DocumentService";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  export let open;
  export let item = null;

  const dispatch = createEventDispatcher();
  let processing = false;
  let message = null;
  let service = new DocumentService();

  const handleClose = () => {
    message = null;
    dispatch("cancel");
  };

  const handleSubmit = async (e) => {
    processing = true;
    let form = e.target;
    let formData = new FormData(form);

    try {
      if (formData.get("id")) {
        await service.update(formData);
        message = {
          type: "success",
          text: "Successfully updated document",
        };
      } else {
        await service.add(formData);
        message = {
          type: "success",
          text: "Successfully added document",
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

  const closeAlert = () => {
    message = null;
  };
</script>

<Modal
  bind:open
  size="xs"
  title="DOCUMENT"
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
    <Label class="space-y-2">
      <span>Name</span>
      <Input
        disabled={processing}
        type="text"
        name="name"
        value={item?.name ?? ""}
        placeholder="Enter document name"
        required
      />
    </Label>
    <Label class="space-y-2">
      <span>Category</span>
      <Input
        disabled={processing}
        type="text"
        name="category"
        value={item?.category ?? ""}
        placeholder="Enter document category"
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
