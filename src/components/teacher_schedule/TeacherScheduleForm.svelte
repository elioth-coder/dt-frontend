<script>
  import { Button, Label, Spinner, Alert } from "flowbite-svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  import ScheduleService from "../../services/ScheduleService";
  import ComboBox from "../ComboBox.svelte";
  import RoomService from "../../services/RoomService";
  export let teacher_id;
  export let semester;
  export let item = null;
  export let sections = [];
  export let subjects = [];

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

  let rooms = [];
  let days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  let days_of_week = days.map((day) => ({ name: day, value: day }));
  let hour_options = hours.map((hour) => ({ name: hour, value: hour }));

  let start_times = [...hour_options];
  start_times.pop();

  let end_times = [...hour_options];
  end_times.shift();

  let colors = ["blue", "red", "green", "yellow", "orange", "amber", "lime", "teal"];
  let color_options = colors.map((color) => ({
    name: color.toUpperCase(),
    value: color,
  }));
  let color_preview;

  let _day_of_week, _start_time, _end_time, _color, _section;

  const onChangeSection = (value) => {
    _section = value;
    subject_id = "";
    dispatch("change-section", value);
  };

  const onChangeRoom = (value) => {
    dispatch("change-room", value);
  };

  const onChangeColor = async (value) => {
    _color = value;
    color_preview = value;
  };

  const onChangeDayOfWeek = async (value) => {
    _day_of_week = value;
  };

  const onChangeStart = (value) => {
    _start_time = value;
  };

  const onChangeEnd = (value) => {
    _end_time = value;
  };

  let disable_subjects;
  $: {
    (async() => {
      if(_section) {        
        subject_options = subjects.filter(subject => {
          let [program, year_level] = _section.split(' - ');
          year_level = parseInt(year_level);

          return (subject.year_level==year_level && subject.program==program && subject.semester==semester.semester);
        }).map((subject) => ({
          value: subject.id,
          name: `${subject.code} - ${subject.title}`,
        }));
      } else {
        subject_options = subjects.map((subject) => ({
          value: subject.id,
          name: `${subject.code} - ${subject.title}`,
        }));
      }

      if(_section) {
        disable_subjects = false;
      } else {
        disable_subjects = true;
      }
    })();
  }

  $: {
    if (_day_of_week && _start_time && _end_time) {
      dispatch("set-schedule", {
        day_of_week: _day_of_week,
        start_time: _start_time,
        end_time: _end_time,
        color: _color ?? "white",
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
    // @ts-ignore
    _day_of_week = item.day_of_week;
    // @ts-ignore
    start_time = item.start_time;
    // @ts-ignore
    _start_time = item.start_time;
    // @ts-ignore
    end_time = item.end_time;
    // @ts-ignore
    _end_time = item.end_time;

  } else {
    id =
    section =
    day_of_week =
    color =
    subject_id =
    start_time =
    end_time = "";
  }

  let roomService = new RoomService();
  onMount(async () => {
    if (subjects.length) {
      subject_options = subjects.map((subject) => ({
        value: subject.id,
        name: `${subject.code} - ${subject.title}`,
      }));
    }

    let _rooms = await roomService.getAll();
    rooms = _rooms.map(room=> ({ name: room.name, value: room.name }));
  });
</script>

<form
  on:submit|preventDefault={handleSubmit}
  class="flex flex-col text-left"
  action="#"
>
  <input type="hidden" name="teacher_id" value={teacher_id} />
  <input type="hidden" name="semester_id" value={semester.id} />
  {#if item}
    <input type="hidden" name="id" value={item?.id} />
  {/if}
  <input type="submit" id="submit" class="hidden" />
  <section class="grid grid-cols-2 gap-x-3 gap-y-3">
    <div class="w-full">
      <Label class="space-y-2">
        <span>Block/Section</span>
        <ComboBox 
          on:change={({detail}) => onChangeSection(detail)}
          name="section" 
          value={section ?? ""}
          items={sections} 
          placeholder="-- section --"
          required={true} 
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Room No.</span>
        <ComboBox 
          on:change={({detail}) => onChangeRoom(detail)}
          name="room" 
          value={room ?? ""}
          items={rooms} 
          placeholder="-- room --"
          required={true} 
        />
      </Label>
    </div>
    <div class="w-full mb-2 col-span-2">
      <Label class="space-y-2">
        <span>Course Subject</span>
        <ComboBox 
          disabled={disable_subjects}
          name="subject_id" 
          value={subject_id ?? ""}
          items={subject_options} 
          placeholder="-- subject --"
          required={true} 
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Start time</span>
        <ComboBox 
          on:change={({detail}) => onChangeStart(detail)}
          name="start_time" 
          value={start_time ?? ""}
          items={start_times} 
          placeholder="-- start time --"
          required={true} 
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>End time</span>
        <ComboBox 
          on:change={({detail}) => onChangeEnd(detail)}
          name="end_time" 
          value={end_time ?? ""}
          items={end_times} 
          placeholder="-- end time --"
          required={true} 
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Day of week</span>
        <ComboBox 
          on:change={({detail}) => onChangeDayOfWeek(detail)}
          name="day_of_week" 
          value={day_of_week ?? ""}
          items={days_of_week} 
          placeholder="-- weekday --"
          required={true} 
        />
      </Label>
    </div>
    <div class="w-full">
      <Label class="space-y-2">
        <span>Color</span>
        <ComboBox 
          on:change={({detail}) => onChangeColor(detail)}
          name="color" 
          value={color ?? ""}
          items={color_options} 
          placeholder="-- color --"
          required={true} 
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
