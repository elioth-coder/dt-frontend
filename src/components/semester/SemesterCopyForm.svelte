<script>
  import {
    Button,
    Modal,
    Label,
    Input,
    Spinner,
    Alert,
    MultiSelect,
    Select,
  } from "flowbite-svelte";
  import { afterUpdate, createEventDispatcher, onMount } from "svelte";
  import SemesterService from "../../services/SemesterService";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  import SemesterTeacherService from "../../services/SemesterTeacherService";
  import ScheduleService from "../../services/ScheduleService";
  export let open;
  export let item = null;
  export let teachers = [];

  const dispatch = createEventDispatcher();
  let processing = false;
  let message = null;
  let assigned = [];
  let semesterTeacherService = new SemesterTeacherService();
  let semesterService = new SemesterService();
  let scheduleService = new ScheduleService();

  let semesters = [
    { value: "1st", name: "1st semester" },
    { value: "2nd", name: "2nd semester" },
    { value: "Summer", name: "Summer semester" },
  ];

  let academic_years = (() => {
    let years = [];
    let limit = 50;
    for (let i = 2017; i <= 2017 + limit; i++) {
      years.push({
        value: `${i}-${i + 1}`,
        name: `A.Y. ${i}-${i + 1}`,
      });
    }

    return years;
  })();

  const handleClose = () => {
    message = null;
    assigned = [];
    dispatch("cancel");
  };

  const handleSubmit = async (e) => {
    processing = true;
    let form = e.target;
    let formData = new FormData(form);

    try {
      let semesterFormData = new FormData();
      semesterFormData.set("title", formData.get("title"));
      semesterFormData.set("semester", formData.get("semester"));
      semesterFormData.set("academic_year", formData.get("academic_year"));
      let semester = await semesterService.add(semesterFormData);
      let copiedTeachers = item?.teachers;
      let newTeachers = [];
      
      for (let i = 0; i < copiedTeachers.length; i++) {
        let copiedTeacher = copiedTeachers[i];
        let semesterTeacherFormData = new FormData();
        semesterTeacherFormData.set("semester_id", semester.id);
        semesterTeacherFormData.set("personnel_id", copiedTeacher.semester_details.personnel_id);
        semesterTeacherFormData.set("research", copiedTeacher.semester_details.research ?? "");
        semesterTeacherFormData.set("extension", copiedTeacher.semester_details.extension ?? "");
        semesterTeacherFormData.set("consultation", copiedTeacher.semester_details.consultation ?? "");

        let semesterTeacher = await semesterTeacherService.add(semesterTeacherFormData);
        let newTeacher = {
          ...copiedTeacher,
          semester_details: {...semesterTeacher},
        }

        newTeachers.push(newTeacher);
      }

      for(let i=0; i<newTeachers.length; i++) {
        let teacher = newTeachers[i];

        if(teacher.schedules.length) {
          for(let j=0; j<teacher.schedules.length; j++) {
            let schedule = teacher.schedules[j];
            let scheduleFormData = new FormData();
            delete schedule.id;

            for (const property in schedule) {
              scheduleFormData.set(property, schedule[property]);
            }
            scheduleFormData.set('teacher_id', teacher.semester_details.id);
            scheduleFormData.set('semester_id', teacher.semester_details.semester_id);

            await scheduleService.add(scheduleFormData);
          }
        }
      }

      message = {
        type: "success",
        text: "Successfully added semester",
      };

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
    if(item) populateAssigned(item);
  });

  const populateAssigned = async (item) => {
    // @ts-ignore
    let semester_teachers = [ ...item.teachers ];
    let items = [];
    for (let i = 0; i < semester_teachers.length; i++) {
      items.push(semester_teachers[i].id);
    }
    assigned = [...items];
  };

  let htmlForm;
</script>

<Modal
  bind:open
  size="xs"
  title="COPY SEMESTER"
  placement="top-center"
  dismissable={false}
  autoclose={false}
  class="w-full"
  on:close={handleClose}
>
  <form
    bind:this={htmlForm}
    on:submit|preventDefault={handleSubmit}
    class="flex flex-col text-left hover:overflow-y-scroll overflow-x-hidden max-h-96"
    action="#"
  >
    <input type="hidden" name="semester" value={item?.semester ?? ""} />
    <input type="hidden" name="academic_year" value={item?.academic_year ?? ""} />
    <input type="submit" id="submit" class="hidden" />
    <Label class="space-y-2 mb-2">
      <span>Title</span>
      <Input
        disabled={processing}
        name="title"
        value={item?.title ?? ""}
        placeholder="Enter a title for this semester"
        required
      />
    </Label>
    <Label class="space-y-2 mb-2 relative">
      <span>Assigned teachers</span>
      <MultiSelect
        placeholder="Select teacher"
        disabled={true}
        items={teachers}
        bind:value={assigned}
        name="teachers"
      />
      <div class="absolute w-full h-full top-0 left-0 right-0 bottom-0 z-10 bg-gray-200/50"></div>
    </Label>
    <section class="flex mb-2">
      <div class="w-full me-1">
        <Label class="space-y-2">
          <span>Semester</span>
          <Select
            disabled={true}
            items={semesters}
            value={item?.semester ?? ""}
            placeholder="Select semester"
            required
          />
        </Label>
      </div>
      <div class="w-full ms-1">
        <Label class="space-y-2">
          <span>Academic year</span>
          <Select
            disabled={true}
            items={academic_years}
            value={item?.academic_year ?? ""}
            placeholder="Select academic year"
            required
          />
        </Label>
      </div>
    </section>
  </form>
  <div class="col-span-12 text-right pt-3">
    <Button
      disabled={processing}
      on:click={() => {
        htmlForm.querySelector('#submit').click();
      }}    
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
