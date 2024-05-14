<script>
  import {
    Button,
    Modal,
    Label,
    Spinner,
    Alert,
    Input,
    Select,
  } from "flowbite-svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  import SubjectService from "../../services/SubjectService";
  export let open;
  export let item = null;

  let processing = false;
  let message = null;
  let id, code, title, year_level, semester, program;

  let year_levels = [
    { value: '1', name: '1st year'},
    { value: '2', name: '2nd year'},
    { value: '3', name: '3rd year'},
    { value: '4', name: '4th year'},
    { value: '5', name: '5th year'},
  ];

  let semesters = [
    { value: '1st', name: '1st semester'},
    { value: '2nd', name: '2nd semester'},
    { value: 'Summer', name: 'Summer semester'},
  ];

  let programs = [
    { value: 'BSBA', name: 'Bachelor of Science in Business Administration (BSBA)'},
    { value: 'BSIT', name: 'Bachelor of Science in Information Technology (BSIT)'},
    { value: 'BSED', name: 'Bachelor of Secondary Education (BSED)'},
    { value: 'BEED', name: 'Bachelor of Elementary Education (BEED)'},
  ];

  const dispatch = createEventDispatcher();
  let service = new SubjectService();

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
          text: "Successfully updated the subject",
        };
      } else {
        await service.add(formData);
        message = {
          type: "success",
          text: "Successfully added a subject",
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

 // @ts-ignore
   $: if (Boolean(item)) {
    // @ts-ignore
    id = item.id;
    // @ts-ignore
    code = item.code;
    // @ts-ignore
    title = item.title;
    // @ts-ignore
    year_level = item.year_level;
    // @ts-ignore
    semester = item.semester;
    // @ts-ignore
    program = item.program;
  }

  onMount(async () => {

  });
</script>

<Modal
  bind:open
  size="xs"
  title="SUBJECT"
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
    <input type="submit" id="submit" class="hidden" />
    <section class="flex mb-2">
      <div class="w-full me-1">
        <Label class="space-y-2">
          <span>Code</span>
          <Input
            disabled={processing}
            type="text"
            name="code"
            value={item?.code ?? ""}
            placeholder="Enter subject code"
            required
          />
        </Label>  
      </div>
      <div class="w-full ms-1">
        <Label class="space-y-2">
          <span>Semester</span>
          <Select
            disabled={processing}
            name="semester"
            items={semesters}
            value={item?.semester ?? ""}
            placeholder="Select semester"
            required
          />
        </Label>  
      </div>
    </section>
    <Label class="space-y-2 mb-2">
      <span>Title</span>
      <Input
        disabled={processing}
        type="text"
        name="title"
        value={item?.title ?? ""}
        placeholder="Enter subject title"
        required
      />
    </Label>
    <section class="flex">
      <div class="w-full me-1">
        <Label class="space-y-2">
          <span>Year level</span>
          <Select
            disabled={processing}
            name="year_level"
            items={year_levels}
            value={item?.year_level ?? ""}
            placeholder="Select year level"
            required
          />
        </Label>  
      </div>
      <div class="w-full ms-1">
        <Label class="space-y-2">
          <span>Program course</span>
          <Select
            disabled={processing}
            name="program"
            items={programs}
            value={item?.program ?? ""}
            placeholder="Select program course"
            required
          />
        </Label>  
      </div>
    </section>
    <br />
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
