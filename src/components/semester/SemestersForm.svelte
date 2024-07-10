<script>
  import {
    Button,
    Modal,
    Label,
    // @ts-ignore
    Input,
    Spinner,
    Alert,
    MultiSelect,
    // @ts-ignore
    Textarea,
    Select,
  } from "flowbite-svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import SemesterService from "../../services/SemesterService";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  import FacultyService from "../../services/FacultyService";
  import SemesterTeacherService from "../../services/SemesterTeacherService";
  export let open;
  export let item = null;

  const dispatch = createEventDispatcher();
  let processing = false;
  let message = null;
  let assigned = [];
  let semesterTeacherService = new SemesterTeacherService();
  let semesterService = new SemesterService();
  let facultyService = new FacultyService();
  let teachers = [];

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

    let teachers = formData.getAll('teachers');

    console.log(teachers);
    console.log(formData.get('title'));

    if (!teachers.length && !formData.get("id")) {
      processing = false;
      return alert("Enter assigned teachers!");
    }

    try {
      if (formData.get("id")) {
        let semesterFormData = new FormData();
        semesterFormData.set("id", formData.get("id"));
        semesterFormData.set("title", formData.get("title"));
        semesterFormData.set("semester", formData.get("semester"));
        semesterFormData.set("academic_year", formData.get("academic_year"));
        // @ts-ignore
        let semester = await semesterService.update(semesterFormData);
        let deleteTeachers = assigned.filter(item => {
          return !teachers.includes(item)
        });

        for (let i = 0; i < deleteTeachers.length; i++) {
          let semesterTeacherFormData = new FormData();
          semesterTeacherFormData.set("semester_id", semester.id);
          semesterTeacherFormData.set("personnel_id", deleteTeachers[i]);

          await semesterTeacherService.deleteByForm(semesterTeacherFormData);
        }

        let addTeachers = teachers.filter(item => {
          return !assigned.includes(item)
        });

        for (let i = 0; i < addTeachers.length; i++) {
          let semesterTeacherFormData = new FormData();
          semesterTeacherFormData.set("semester_id", semester.id);
          semesterTeacherFormData.set("personnel_id", addTeachers[i]);

          await semesterTeacherService.add(semesterTeacherFormData);
        }

        message = {
          type: "success",
          text: "Successfully updated semester",
        };
      } else {
        let semesterFormData = new FormData();
        semesterFormData.set("title", formData.get("title"));
        semesterFormData.set("semester", formData.get("semester"));
        semesterFormData.set("academic_year", formData.get("academic_year"));
        let semester = await semesterService.add(semesterFormData);

        for (let i = 0; i < teachers.length; i++) {
          let semesterTeacherFormData = new FormData();
          semesterTeacherFormData.set("semester_id", semester.id);
          semesterTeacherFormData.set("personnel_id", teachers[i]);

          await semesterTeacherService.add(semesterTeacherFormData);
        }

        message = {
          type: "success",
          text: "Successfully added semester",
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

  $: if (item) {
    populateAssigned(item);
  } else {
    assigned = [];
  }

  const populateAssigned = async (item) => {
    // @ts-ignore
    let semester_teachers = await semesterTeacherService.getWhere(
      "semester_id",
      item.id
    );
    let items = [];
    for (let i = 0; i < semester_teachers.length; i++) {
      items.push(semester_teachers[i].personnel_id);
    }
    assigned = [...items];
  };

  onMount(async () => {
    let faculties = await facultyService.getAll();

    teachers = faculties.map((faculty) => ({
      value: faculty.id,
      name: faculty.name,
    }));
  });
</script>

<Modal
  bind:open
  size="xs"
  title="SEMESTER"
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
    <Label class="space-y-2 mb-2">
      <span>Assigned teachers</span>
      <MultiSelect
        placeholder="Select teacher"
        items={teachers}
        value={assigned}
        name="teachers"
      />
    </Label>
    <section class="flex mb-2">
      <div class="w-full me-1">
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
      <div class="w-full ms-1">
        <Label class="space-y-2">
          <span>Academic year</span>
          <Select
            disabled={processing}
            name="academic_year"
            items={academic_years}
            value={item?.academic_year ?? ""}
            placeholder="Select academic year"
            required
          />
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
