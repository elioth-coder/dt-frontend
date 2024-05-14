<script>
  import {
    Button,
    Modal,
    Label,
    Spinner,
    Alert,
    Select,
  } from "flowbite-svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  import DropdownSearch from "../DropdownSearch.svelte";
  import SubjectService from "../../services/SubjectService";
  import ScheduleService from "../../services/ScheduleService";
  export let open;
  export let teacher_id;
  export let semester_id;
  export let item = null;

  const dispatch = createEventDispatcher();
  let scheduleService = new ScheduleService();
  let processing = false;
  let message = null;
  let subject_options = [];

  let hours = [
    '08:00 AM',
    '08:30 AM',
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 NN',
    '12:30 PM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
    '06:00 PM',
    '06:30 PM',
    '07:00 PM',
    '07:30 PM',
    '08:00 PM',
    '08:30 PM',
    '09:00 PM',
    '09:30 PM',
  ];

  let courses = ['BSIT','BSBA','BSED','BEED'];
  let letters = ['A','B','C','D'];
  let blocks = [];

  for(let i=0; i<courses.length; i++) {
    for(let j=1; j<=4; j++) {
      for(let k=0; k<letters.length; k++) {
        blocks.push(`${courses[i]} - ${j}${letters[k]}`);
      }
    }
  }
  let sections = blocks.map(block => ({name: block, value: block}));

  let days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  let days_of_week = days.map(day => ({name: day, value: day}));

  let hour_options = hours.map(hour => ({ name: hour, value: hour}));

  let start_times = [...hour_options];
  start_times.pop();

  let end_times = [...hour_options];
  end_times.shift();

  let colors = ['blue','red','green','yellow','brown','pink','red'];
  let color_options = colors.map(color => ({name: color, value: color}));
  let color_preview; 

  const updateColorPreview = (e) => {
    color_preview = e.target.value;
  }

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
        await scheduleService.update(formData);

        message = {
          type: "success",
          text: "Successfully updated schedule",
        };
      } else {
        await scheduleService.add(formData);

        message = {
          type: "success",
          text: "Successfully added schedule",
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

  let id, section, day_of_week, color, subject_id, start_time, end_time;

 // @ts-ignore
  // @ts-ignore
  $: if(Boolean(item)) {
    // @ts-ignore
    id = item.id;
    // @ts-ignore
    section = item.section;
    // @ts-ignore
    day_of_week = item.day_of_week;
    // @ts-ignore
    color = item.color;
    // @ts-ignore
    subject_id = item.subject_id;
    // @ts-ignore
    start_time = item.start_time;
    // @ts-ignore
    end_time = item.end_time;
  } else {
    id = section = day_of_week = color = subject_id = start_time = end_time = "";
  }

  onMount(async () => {
    let subjectService = new SubjectService();
    let subjects = await subjectService.getAll();

    if (subjects.length) {
      subject_options = subjects.map((subject) => ({
        value: subject.id,
        text: `${subject.code} - ${subject.title}`,
      }));
    }

  });
</script>

<Modal
  bind:open
  size="xs"
  title="SCHEDULE"
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
    <input type="hidden" name="teacher_id" value={teacher_id} />
    <input type="hidden" name="semester_id" value={semester_id} />
    {#if item}
      <input type="hidden" name="id" value={item.id} />
    {/if}
    <input type="submit" id="submit" class="hidden" />
    <section class="flex mb-2">
      <div class="w-full me-2">
        <Label class="space-y-2">
          <span>Block/Section</span>
          <Select 
            name="section"
            value={section ?? ""}
            placeholder="Select block/section."
            items={sections}
          />
        </Label>
      </div>
      <div class="w-full ms-2">
        <Label class="space-y-2">
          <span>Day of week</span>
          <Select 
            value={day_of_week ?? ""}
            name="day_of_week"
            placeholder="Select day of week."
            items={days_of_week}
          />
        </Label>
      </div>
    </section>
    <div class="w-full mb-2">
      <Label class="space-y-3">
        <span>Subject</span>
        <DropdownSearch
          required={true}
          value={subject_id ?? ""}
          name="subject_id"
          placeholder="Select subject"
          options={subject_options.length ? subject_options : []}
        />
      </Label>    
    </div>
    <section class="flex mb-2">
      <div class="w-full me-2">
        <Label class="space-y-2">
          <span>Start time</span>
          <Select 
            value={start_time ?? ""}
            name="start_time"
            placeholder="Select start time."
            items={start_times}
          />
        </Label>
      </div>
      <div class="w-full ms-2">
        <Label class="space-y-2">
          <span>End time</span>
          <Select 
            value={end_time ?? ""}
            name="end_time"
            placeholder="Select end time."
            items={end_times}
          />
        </Label>
      </div>
    </section>
    <section class="flex mb-2">
      <div class="w-full me-2">
        <Label class="space-y-2">
          <span>Color</span>
            <Select 
              value={color ?? ""}
              name="color"
              placeholder="Select color."
              items={color_options}
              on:change={updateColorPreview}
            />
        </Label>
      </div>
      <div class="w-full ms-2">
        <Label class="space-y-2">
          <span>Preview</span>
          <div class="w-full h-10 border rounded" style="background-color: {color_preview ?? ((color) ? color : 'white')}"></div>
        </Label>
      </div>
    </section>
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
