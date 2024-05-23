<script>
  // @ts-nocheck

  import { Button, Label, Spinner, Alert, Select } from "flowbite-svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  import DropdownSearch from "../DropdownSearch.svelte";
  import SubjectService from "../../services/SubjectService";
  import ScheduleService from "../../services/ScheduleService";
  export let teacher_id;
  export let semester_id;
  export let item = null;

  const dispatch = createEventDispatcher();
  let scheduleService = new ScheduleService();
  let processing = false;
  let message = null;
  let subject_options = [];

  let hours = [
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 NN",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM",
    "08:30 PM",
    "09:00 PM",
    "09:30 PM",
  ];

  let courses = ["BSIT", "BSBA", "BSED", "BEED"];
  let letters = ["A", "B", "C", "D"];
  let blocks = [];

  for (let i = 0; i < courses.length; i++) {
    for (let j = 1; j <= 4; j++) {
      for (let k = 0; k < letters.length; k++) {
        blocks.push(`${courses[i]} - ${j}${letters[k]}`);
      }
    }
  }

  let sections = blocks.map((block) => ({ name: block, value: block }));
  let rooms = [
    "COMLAB 1",
    "COMLAB 2",
    "COVERED COURT",
    "ROOM 1",
    "ROOM 2",
    "ROOM 3",
    "ROOM 4",
    "ROOM 5",
    "ROOM 6",
    "ROOM 7",
    "ROOM 8",
    "ROOM 9",
    "ROOM A",
    "ROOM B",
    "ROOM C",
    "ROOM D",
    "ROOM E",
    "ROOM F",
    "ROOM G",
    "ROOM H",
    "ROOM I",
  ].map((room) => ({ name: room, value: room }));

  let days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  let days_of_week = days.map((day) => ({ name: day, value: day }));

  let hour_options = hours.map((hour) => ({ name: hour, value: hour }));

  let start_times = [...hour_options];
  start_times.pop();

  let end_times = [...hour_options];
  end_times.shift();

  let colors = ["blue", "red", "green", "yellow", "indigo", "pink", "red"];
  let color_options = colors.map((color) => ({
    name: color.toUpperCase(),
    value: color,
  }));
  let color_preview;

  let _day_of_week, _start_time, _end_time, _color;

  const updateColorPreview = (e) => {
    color_preview = e.target.value;
  };

  const onChangeSection = async (e) => {
    let section = e.target.value;

    dispatch("change-section", section);
  };

  const onChangeRoom = async (e) => {
    let room = e.target.value;

    dispatch("change-room", room);
  };


  const onChangeColor = async (e) => {
    let color = e.target.value;

    _color = color;
  };

  const onChangeDayOfWeek = async (e) => {
    let day_of_week = e.target.value;

    _day_of_week = day_of_week;
  };

  const onChangeStart = async (e) => {
    let start_time = e.target.value;

    _start_time = start_time;
  };

  const onChangeEnd = async (e) => {
    let end_time = e.target.value;

    _end_time = end_time;
  };

  $: {
    if (_day_of_week && _start_time && _end_time) {
      dispatch("set-schedule", {
        day_of_week: _day_of_week,
        start_time: _start_time,
        end_time: _end_time,
        color: _color ?? "",
      });
    }
  }

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

  let id, section, room, day_of_week, color, subject_id, start_time, end_time;

  // @ts-ignore
  // @ts-ignore
  $: if (Boolean(item)) {
    // @ts-ignore
    id = item.id;
    // @ts-ignore
    section = item.section;
    // @ts-ignore
    room = item.room;
    // @ts-ignore
    color = item.color;
    // @ts-ignore
    subject_id = item.subject_id;
    // @ts-ignore
    day_of_week = item.day_of_week;
    _day_of_week = item.day_of_week;
    // @ts-ignore
    start_time = item.start_time;
    _start_time = item.start_time;
    // @ts-ignore
    end_time = item.end_time;
    _end_time = item.end_time;

    console.log({item});
  } else {
    id =
    section =
    day_of_week =
    color =
    subject_id =
    start_time =
    end_time = "";
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
  <section class="grid grid-cols-2 gap-x-3 gap-y-3">
    <div class="w-full">
      <Label class="space-y-2">
        <span>Block/Section</span>
        <Select
          name="section"
          on:change={onChangeSection}
          value={section ?? ""}
          placeholder="-- section --"
          items={sections}
          required
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Room No.</span>
        <Select
          name="room"
          on:change={onChangeRoom}
          value={room ?? ""}
          placeholder="-- room --"
          items={rooms}
          required
        />
      </Label>
    </div>
    <div class="w-full mb-2 col-span-2">
      <Label class="space-y-2">
        <span>Course Subject</span>
        {#if subject_options && subject_options?.length}
          <DropdownSearch
            required={true}
            value={subject_id ?? ""}
            name="subject_id"
            placeholder="-- subject --"
            options={subject_options.length ? subject_options : []}
          />
        {/if}
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Start time</span>
        <Select
          value={start_time ?? ""}
          name="start_time"
          on:change={onChangeStart}
          placeholder="--:-- --"
          items={start_times}
          required
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>End time</span>
        <Select
          value={end_time ?? ""}
          name="end_time"
          on:change={onChangeEnd}
          placeholder="--:-- --"
          items={end_times}
          required
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Day of week</span>
        <Select
          value={day_of_week ?? ""}
          name="day_of_week"
          on:change={onChangeDayOfWeek}
          placeholder="-- weekday --"
          items={days_of_week}
          required
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Color</span>
        <Select
          value={color ?? ""}
          name="color"
          on:change={onChangeColor}
          id="color"
          placeholder="-- color --"
          items={color_options}
          on:change={updateColorPreview}
          required
        />
      </Label>
    </div>
    <div class="col-span-2">
      <div
        class="border-gray-300 mt-4 w-full h-10 border rounded bg-{color_preview ??
          (color ? color : 'white')}-500"
      ></div>
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
