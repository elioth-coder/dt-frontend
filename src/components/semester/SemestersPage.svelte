<script>
  import { Heading, Button, Spinner, Alert } from "flowbite-svelte";
  import Page from "../Page.svelte";
  import SemestersTable from "./SemestersTable.svelte";
  import SemestersForm from "./SemestersForm.svelte";
  import SemesterCopyForm from "./SemesterCopyForm.svelte";
  import ConfirmModal from "../ConfirmModal.svelte";
  import SemesterService from "../../services/SemesterService";
  import { ExclamationCircleSolid } from "flowbite-svelte-icons";
  import Breadcrumb from "../Breadcrumb.svelte";
  import SemesterTeacherService from "../../services/SemesterTeacherService";
  import FacultyService from "../../services/FacultyService";
  import ScheduleService from "../../services/ScheduleService";
  import { onMount } from "svelte";
  import LoadingScreen from "../LoadingScreen.svelte";

  let service = new SemesterService();
  let hasUpdate = Date.now();
  let addItem = false;
  let deleteItem = false;
  let editItem = false;
  let asyncDelete = null;
  let breadCrumbItems = [
    {
      href: "#/scheduler",
      label: "Scheduler",
    },
  ];

  const confirmDelete = (item) => {
    deleteItem = item;
  };

  const handleDelete = async () => {
    // @ts-ignore
    let { id } = deleteItem;
    asyncDelete = service.delete(id);

    try {
      await asyncDelete;
      hasUpdate = Date.now();
    } catch (e) {}
  };

  const handleEdit = (item) => {
    editItem = item;
  };
  
  let semesterCopy = null;

  const handleCopy = async (semester) => {
    isLoading = true;
    let semesterTeacherService = new SemesterTeacherService();
    let facultyService  = new FacultyService();
    let scheduleService = new ScheduleService();
    let teachers = [];
    let semester_teachers = await semesterTeacherService.getWhere('semester_id', semester.id);
    
    for(let i=0; i<semester_teachers.length; i++) {
      let semester_teacher = semester_teachers[i];
      let teacher = await facultyService.get(semester_teacher.personnel_id);
      teacher.semester_details = semester_teacher;
      teacher.schedules = await scheduleService.getWhere('teacher_id', semester_teacher.id);

      teachers.push(teacher);
    }

    semester.teachers = [ ...teachers ];
    semesterCopy = { ...semester };
    console.log({semesterCopy});
    isLoading = false;
  };

  let teachers = [];
  let facultyService = new FacultyService();

  onMount(async () => {
    let faculties = await facultyService.getAll();

    teachers = faculties.map((faculty) => ({
      value: faculty.id,
      name: faculty.name,
    }));
  });

  let isLoading = false;
</script>

<Page>
  <Breadcrumb items={breadCrumbItems} />
  <br />
  <Heading tag="h2" class="text-left">
    All Semesters
    <Button on:click={() => (addItem = true)} class="float-right"
      >Add new</Button
    >
  </Heading>
  <br />
  <div class="px-4">
    {#if asyncDelete}
      {#await asyncDelete}
        <p>
          <Spinner />
          Deleting semester...
        </p>
      {:then}
        <Alert color="green" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          Successfully deleted the semester
        </Alert>
      {:catch error}
        <Alert color="red" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          {error.message}
        </Alert>
      {/await}
    {/if}
  </div>
  <div class="w-full h-96 overflow-auto text-left">
    <SemestersTable
      {hasUpdate}
      on:copy={({ detail: item}) => handleCopy(item)}
      on:edit={({ detail: item }) => handleEdit(item)}
      on:delete={({ detail: item }) => confirmDelete(item)}
    />
  </div>
  <SemesterCopyForm
    open={semesterCopy}
    item={semesterCopy ? semesterCopy : null}
    {teachers}
    on:update={() => (hasUpdate = Date.now())}
    on:cancel={() => {
      semesterCopy = null;
    }}
  />
  <SemestersForm
    open={addItem || editItem}
    item={editItem ? editItem : null}
    {teachers}
    on:update={() => (hasUpdate = Date.now())}
    on:cancel={() => {
      addItem = false;
      editItem = false;
    }}
  />
  <ConfirmModal
    on:continue={handleDelete}
    on:cancel={() => (deleteItem = false)}
    message="Delete this semester now?"
    open={deleteItem}
  />
  {#if isLoading}
    <LoadingScreen />
  {/if}
</Page>
