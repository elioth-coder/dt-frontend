<script>
  import { Heading, Spinner, Alert, Hr } from "flowbite-svelte";
  import Page from "../Page.svelte";
  import ConfirmModal from "../ConfirmModal.svelte";
  import SemesterService from "../../services/SemesterService";
  import { ExclamationCircleSolid } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  import Breadcrumb from "../Breadcrumb.svelte";
  import SemesterTeacherTable from "./SemesterTeacherTable.svelte";
  import SemesterTeacherService from "../../services/SemesterTeacherService";
  export let params = {};

  let semester_id = params.id;
  let semesterService = new SemesterService();
  let semesterTeacherService = new SemesterTeacherService();
  let hasUpdate = Date.now();
  let deleteItem = false;
  let editItem = false;
  let asyncDelete = null;
  let semester;
  let breadCrumbItems = [
    {
      href: "#/scheduler",
      label: "Scheduler",
    },
    {
      href: "#/scheduler/" + semester_id,
      label: "Semester",
    },
  ];

  const confirmDelete = (item) => {
    deleteItem = item;
  };

  const handleDelete = async () => {
    // @ts-ignore
    let { assigned_id } = deleteItem;
    asyncDelete = semesterTeacherService.delete(assigned_id);

    try {
      await asyncDelete;
      hasUpdate = Date.now();
    } catch (e) {}
  };

  const handleEdit = (item) => {
    editItem = item;
  };

  onMount(async () => {
    semester = await semesterService.get(semester_id);
  });
</script>

<Page>
  <Breadcrumb items={breadCrumbItems} />
  <br />
  <Heading tag="h2" class="text-left">
    {#if semester}
      {semester.semester} Semester - A.Y. {semester.academic_year}
    {:else}
      Loading...
    {/if}
  </Heading>
  <Hr />
  <div class="mb-4">
    {#if asyncDelete}
      {#await asyncDelete}
        <p>
          <Spinner />
          Deleting teacher...
        </p>
      {:then}
        <Alert color="green" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          Successfully deleted the teacher
        </Alert>
      {:catch error}
        <Alert color="red" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          {error.message}
        </Alert>
      {/await}
    {/if}
  </div>
  {#if semester}
    <div class="w-full h-96 overflow-y-scroll overflow-x-hidden text-left">
      <SemesterTeacherTable
        {hasUpdate}
        {semester}
        on:edit={({ detail: item }) => handleEdit(item)}
        on:delete={({ detail: item }) => confirmDelete(item)}
      />
    </div>
  {/if}
  <ConfirmModal
    on:continue={handleDelete}
    on:cancel={() => (deleteItem = false)}
    message="Delete this teacher now?"
    open={deleteItem}
  />
</Page>
