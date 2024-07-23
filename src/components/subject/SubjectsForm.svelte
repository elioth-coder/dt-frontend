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
  import { afterUpdate, createEventDispatcher, onMount } from "svelte";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  import SubjectService from "../../services/SubjectService";
  export let open;
  export let item = null;
  export let programs;
  export let majors = {};

  let processing = false;
  let message = null;
  let major = "";

  let lec_selected = 0, lab_selected = 0, units_selected = 0;

  $: hours_week = ((lec_selected + lab_selected) == 0) ? "" : (lec_selected + lab_selected) + "";

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

  afterUpdate(() => {
    if(item) {
      // @ts-ignore
      lec_selected = parseInt(item?.lec ?? "");
      // @ts-ignore
      lab_selected = parseInt(item?.lab ?? "");
      // @ts-ignore
      units_selected = parseInt(item?.units ?? "");
      major = majors[item?.program] ?? ""; 
      console.log(item);
    }
  });

  const onChangeProgramCourse = (e) => {
    let code = e.target.value;

    major = majors[code];
  }
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

    <input type="hidden" name="major" value={major} />
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
            placeholder="-- code --"
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
            placeholder="-- semester --"
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
        placeholder="-- title --"
        required
      />
    </Label>
    <section class="flex mb-2">
      <div class="w-full me-1">
        <Label class="space-y-2">
          <span>Year level</span>
          <Select
            disabled={processing}
            name="year_level"
            items={year_levels}
            value={item?.year_level ?? ""}
            placeholder="-- year level --"
            required
          />
        </Label>  
      </div>
      <div class="w-full ms-1">
        <Label class="space-y-2">
          <span>Pre-requisites</span>
          <Input
            disabled={processing}
            type="text"
            name="pre_req"
            value={item?.pre_req ?? ""}
            placeholder="-- pre-requisites --"
          />
        </Label>
      </div>
    </section>
    <Label class="space-y-2 mb-2">
      <span>Program course</span>
      <Select
        disabled={processing}
        name="program"
        items={programs}
        value={item?.program ?? ""}
        placeholder="-- program course --"
        on:change={onChangeProgramCourse}
        required
      />
    </Label>  
    <section class="flex">
      <div class="w-full me-1">
        <Label class="space-y-2">
          <span>Units</span>
          <Select
            disabled={processing}
            name="units"
            bind:value={units_selected}
            items={[
              {value: 0, name: 0},
              {value: 1, name: 1},
              {value: 2, name: 2},
              {value: 3, name: 3},
              {value: 4, name: 4},
              {value: 5, name: 5},
              {value: 6, name: 6},
              {value: 7, name: 7},
              {value: 8, name: 8},
              {value: 9, name: 9},
              {value: 10, name: 10},
            ]}
            placeholder="-- units --"
            required
          />
        </Label>  
      </div>
      <div class="w-full mx-1">
        <Label class="space-y-2">
          <span>Hrs/week</span>
          <Input name="hours_week"
            placeholder="-- hrs/week --"
            bind:value={hours_week}
            required
          />
        </Label>  
      </div>
      <div class="w-full mx-1">
        <Label class="space-y-2">
          <span>Lec</span>
          <Select
            disabled={processing}
            name="lec"
            bind:value={lec_selected}
            items={[
              {value: 0, name: 0},
              {value: 1, name: 1},
              {value: 2, name: 2},
              {value: 3, name: 3},
              {value: 4, name: 4},
              {value: 5, name: 5},
              {value: 6, name: 6},
              {value: 7, name: 7},
              {value: 8, name: 8},
              {value: 9, name: 9},
              {value: 10, name: 10},
            ]}
            placeholder="-- lec --"
          />
        </Label>  
      </div>
      <div class="w-full ms-1">
        <Label class="space-y-2">
          <span>Lab</span>
          <Select
            disabled={processing}
            name="lab"
            bind:value={lab_selected}
            items={[
              {value: 0, name: 0},
              {value: 1, name: 1},
              {value: 2, name: 2},
              {value: 3, name: 3},
              {value: 4, name: 4},
              {value: 5, name: 5},
              {value: 6, name: 6},
              {value: 7, name: 7},
              {value: 8, name: 8},
              {value: 9, name: 9},
              {value: 10, name: 10},
            ]}
            placeholder="-- lab --"
          />
        </Label>  
      </div>
    </section>
    <hr class="my-5"/>
    <div class="text-right">
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
