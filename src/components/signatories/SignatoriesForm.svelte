<script>
  import {
    Button,
    Modal,
    Label,
    Input,
    Spinner,
    Alert,
    Textarea,
  } from "flowbite-svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  import SignatoryService from "../../services/SignatoryService";
  export let open;
  export let item = null;

  const dispatch = createEventDispatcher();
  let processing = false;
  let message = null;
  let signatoryService = new SignatoryService();

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
        let signatory = await signatoryService.update(formData);

        message = {
          type: "success",
          text: "Successfully updated signatory",
        };
      } else {
        let signatory = await signatoryService.add(formData);

        message = {
          type: "success",
          text: "Successfully added signatory",
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

  onMount(async () => {

  });
</script>

<Modal
  bind:open
  size="sm"
  title="SIGNATORY"
  placement="top-center"
  dismissable={false}
  autoclose={false}
  class="w-full"
  on:close={handleClose}
>
  <form
    on:submit|preventDefault={handleSubmit}
    class="flex flex-col text-left"
    action="#"
  >
    {#if item}
      <input type="hidden" name="id" value={item.id} />
    {/if}
    <input type="submit" id="submit" class="hidden" />
    <section class="flex mb-2">
      <div class="w-full me-1">
        <Label class="space-y-2">
          <span>College</span>
          <Input
            disabled={processing}
            name="college"
            value={item?.college ?? ""}
            placeholder="Enter college"
            required
          />
        </Label>
      </div>
      <div class="w-full ms-1">
        <Label class="space-y-2">
          <span>Document</span>
          <Input
            disabled={processing}
            name="document"
            value={item?.document ?? ""}
            placeholder="Enter document"
            required
          />
        </Label>
      </div>
    </section>
    <Label class="space-y-2 mb-2">
      <span>Content</span>
      <Textarea
        disabled={processing}
        name="content" 
        rows={10}
        value={item?.content ?? ""}
        placeholder="Enter content"
        required
      />
    </Label>
    <div class="col-span-12 text-right pt-3">
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
    <div class="absolute max-w-lg w-full top-full mt-5 -ml-5">
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
