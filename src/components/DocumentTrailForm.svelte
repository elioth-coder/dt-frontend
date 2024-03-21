<script>
  import { Button, Modal, Label, Textarea, Spinner, Alert } from "flowbite-svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  import DropdownSearch from "./DropdownSearch.svelte";
  import DocumentTrailService from "../services/DocumentTrailService";
  import LocationService from "../services/LocationService";
  import RecipientService from "../services/RecipientService";
  export let open;
  export let item = null;
  export let _document;

  let processing = false;
  let location_options = [];
  let recipient_options = [];
  let message = null;
  let id, location_id, recipient_id, remarks, document_id;

  const dispatch = createEventDispatcher();
  let service = new DocumentTrailService();

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
          text: "Successfully updated the trail",
        };
      } else {
        await service.add(formData);
        message = {
          type: "success",
          text: "Successfully added a trail",
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

  $: if(Boolean(item)) {
    id = item.id;
    location_id = item.location.id;
    recipient_id = item.recipient.id;
    remarks  = item.remarks;
    document_id = item.document_id;

    console.log({item});
  }

  onMount(async () => {
    let locationService = new LocationService();
    let locations = await locationService.getAll();

    if (locations.length) {
      location_options = locations.map((location) => ({
        value: location.id,
        text: location.name,
      }));
    }

    let recipientService = new RecipientService();
    let recipients = await recipientService.getAll();

    if (recipients.length) {
      recipient_options = recipients.map((recipient) => ({
        value: recipient.id,
        text: recipient.name,
      }));
    }
  });
</script>

<Modal
  bind:open
  size="xs"
  title="DOCUMENT TRAIL"
  placement="top-center"
  dismissable={false}
  autoclose={false}
  class="w-full"
  on:close={() => dispatch("cancel")}
>
  <form
    on:submit|preventDefault={handleSubmit}
    class="flex flex-col text-left"
    action="#"
  >
    {#if item}
      <input type="hidden" name="id" value={item.id} />
    {/if}
    <input type="hidden" name="document_id" value={_document.id} />
    <input type="submit" id="submit" class="hidden" />
    <Label class="space-y-3">
      <span>Location</span>
      <DropdownSearch
        required={true}
        value={location_id ?? ""}
        name="location_id"
        placeholder="Select location"
        options={location_options.length ? location_options : []}
      />
    </Label>
    <br>
    <Label class="space-y-3">
      <span>Recipient</span>
      <DropdownSearch
        required={true}
        value={recipient_id ?? ""}
        name="recipient_id"
        placeholder="Select recipient"
        options={recipient_options.length ? recipient_options : []}
      />
    </Label>
    <br>
    <Label class="space-y-3">
      <span>Remarks</span>
      <Textarea 
        value={remarks ?? ""}
        name="remarks" 
        placeholder="Type remarks" 
        rows={4} 
      />
    </Label>
    <br>
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
