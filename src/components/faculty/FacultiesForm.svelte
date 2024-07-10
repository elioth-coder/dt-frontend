<script>
  import { Button, Modal, Label, Input, Spinner, Alert } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";
  import FacultyService from "../../services/FacultyService";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  import ComboBox from "../ComboBox.svelte";
  export let open;
  export let item = null;

  let { HOST_URL } = CONFIG;
  const dispatch = createEventDispatcher();
  let photoSrc = "";
  let processing = false;
  let message = null;
  let service = new FacultyService();

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
    formData.set('name', [
      formData.get('first_name'),
      formData.get('last_name'),
    ].join(' '))

    try {
      if (formData.get("id")) {
        await service.update(formData);
        message = {
          type: "success",
          text: "Successfully updated faculty",
        };
      } else {
        await service.add(formData);
        message = {
          type: "success",
          text: "Successfully added faculty",
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

  $: item,
    (() => {
      if (item?.photo) {
        photoSrc = `${HOST_URL}/uploads/${item.photo}`;
      }
    })();

  const closeAlert = () => {
    message = null;
  };

  let colleges = [
    { value: 'CICT', name: 'CICT - COLLEGE OF INFORMATION AND COMMUNICATIONS TECHNOLOGY' },
    { value: 'CMBT', name: 'CMBT - COLLEGE OF MANAGEMENT AND BUSINESS TECHNOLOGY' },
    { value: 'COED', name: 'COED - COLLEGE OF EDUCATION' },
  ]; 
</script>

<Modal
  bind:open
  size="xs"
  title="FACULTY"
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
      <img class="mx-auto h-32" src={photoSrc} alt="Faculty photo" />
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
      <span>College/Department</span>
      <ComboBox 
        name="college" 
        value={item?.college ?? ""}
        items={colleges} 
        placeholder="-- college --"
        required={true} 
      />
    </Label>
    <div class="flex gap-1">
      <Label class="space-y-1">
        <span>First name</span>
        <Input
          disabled={processing}
          type="text"
          name="first_name"
          value={item?.first_name ?? ""}
          placeholder="Enter first name"
          required
        />
      </Label>
      <Label class="space-y-1">
        <span>Middle name</span>
        <Input
          disabled={processing}
          type="text"
          name="middle_name"
          value={item?.middle_name ?? ""}
          placeholder="Enter middle name"
          required
        />
      </Label>
    </div>
    <div class="flex gap-1">
      <Label class="space-y-1">
        <span>Last name</span>
        <Input
          disabled={processing}
          type="text"
          name="last_name"
          value={item?.last_name ?? ""}
          placeholder="Enter last name"
          required
        />
      </Label>
      <Label class="space-y-1">
        <span>Degree</span>
        <Input
          disabled={processing}
          type="text"
          name="degree"
          value={item?.degree ?? ""}
          placeholder="Enter degree"
        />
      </Label>
    </div>
    <Label class="space-y-1">
      <span>Employment Status</span>
      <Input
        disabled={processing}
        type="text"
        name="employment_status"
        value={item?.employment_status ?? ""}
        placeholder="Enter employment status"
        required
      />
    </Label>
    <Label class="space-y-1">
      <span>Field of Specialization</span>
      <Input
        disabled={processing}
        type="text"
        name="field_specialization"
        value={item?.field_specialization ?? ""}
        placeholder="Enter field of specialization"
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
