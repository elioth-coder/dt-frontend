<script>
  // @ts-nocheck

  import { Button, Label, Spinner, Alert, Textarea, Input } from "flowbite-svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  import DocumentTrailService from "../../services/DocumentTrailService";
  export let item = null;

  const dispatch = createEventDispatcher();
  let documentTrailService = new DocumentTrailService();
  let processing = false;
  let message = null;

  const handleSubmit = async (e) => {
    processing = true;
    let form = e.target;
    let formData = new FormData(form);

    try {
      if (formData.get("id")) {
        await documentTrailService.update(formData);

        message = {
          type: "success",
          text: "Successfully updated doument",
        };
      } else {
        await documentTrailService.add(formData);

        message = {
          type: "success",
          text: "Successfully forwarded doument",
        };
      }

      setTimeout(() => {
        processing = false;
        dispatch("update");
        dispatch("cancel");
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

  let id, type, purpose, name, program, quantity, action_needeed, office, date_forwarded, date_returned, status, remarks;

  $: if (Boolean(item)) {
    id = item.id;
    type = item.type;
    purpose = item.purpose;
    name = item.name;
    program = item.program;
    quantity = item.quantity;
    action_needeed = item.action_needeed;
    office = item.office;
    date_forwarded = item.date_forwarded;
    date_returned = item.date_returned;
    status = item.status;
    remark = item.remarks;

    console.log({item});
  } else {
    id = "";
    type = "";
    name = "";
    program = "";
    quantity = "";
    action_needeed = "";
    office = "";
    date_forwarded = "";
    date_returned = "";
    status = "";
    remarks = "";
  }

  onMount(async () => {

  });
</script>

<form
  on:submit|preventDefault={handleSubmit}
  class="flex flex-col text-left"
  action="#"
>
  {#if item}
    <input type="hidden" name="id" value={item.id} />
  {/if}
  <input type="submit" id="submit" class="hidden" />
  <section class="grid grid-cols-2 gap-4">
    <div class="w-full">
      <Label class="space-y-2">
        <span>Type</span>
        <Input
          name="type"
          value={type ?? ""}
          placeholder="-- type --"
          required
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Purpose</span>
        <Input
          name="purpose"
          value={type ?? ""}
          placeholder="-- purpose --"
        />
      </Label>
    </div>
    <div class="w-full col-span-2">
      <Label class="space-y-2">
        <span>Document Name</span>
        <Input
          name="name"
          value={type ?? ""}
          placeholder="-- document name --"
          required
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Program</span>
        <Input
          name="program"
          value={type ?? ""}
          placeholder="-- program --"
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Qty</span>
        <Input
          name="quantity"
          type="number"
          value={type ?? ""}
          placeholder="-- quantity --"
          required
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Action Needed</span>
        <Input
          name="action_needed"
          value={type ?? ""}
          placeholder="-- action needed --"
          required
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Office</span>
        <Input
          name="office"
          value={type ?? ""}
          placeholder="-- office --"
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Date Forwarded</span>
        <Input
          name="date_forwarded"
          type="date"
          value={type ?? ""}
          placeholder="-- date forwarded --"
          required
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Status</span>
        <Input
          name="status"
          value={type ?? ""}
          placeholder="-- status --"
        />
      </Label>
    </div>
    <div class="w-full col-span-2">
      <Label class="space-y-2">
        <span>Remarks</span>
        <Textarea
          name="remarks"
          value={type ?? ""}
          placeholder="-- remarks --"
          rows={4}
        />
      </Label>
    </div>
    <div class="pt-7 col-span-2 grid grid-cols-2 gap-2">
      <Button
        class="w-full"
        disabled={processing}
        on:click={() => document.getElementById("submit").click()}
      >
        {#if processing}
          <Spinner size={4} class="mr-2" />
        {/if}
        Submit
      </Button>
      <Button
        class="w-full"
        disabled={processing}
        color="red"
        on:click={() => dispatch('cancel')}
      >
        {#if processing}
          <Spinner size={4} class="mr-2" />
        {/if}
        Cancel
      </Button>
    </div>
  </section>
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
