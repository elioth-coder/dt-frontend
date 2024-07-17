<script>
  import { Heading, Button, Spinner, Alert } from "flowbite-svelte";
  import Page from "../Page.svelte";
  import ConfirmModal from "../ConfirmModal.svelte";
  import SubjectService from "../../services/SubjectService";
  import { ExclamationCircleSolid } from "flowbite-svelte-icons";
  import Breadcrumb from "../Breadcrumb.svelte";
  import SubjectsForm from "./SubjectsForm.svelte";
  import SubjectsTable from "./SubjectsTable.svelte";
  import { onMount } from "svelte";
  import ProgramCourseService from "../../services/ProgramCourseService";

  let service = new SubjectService();
  let hasUpdate = Date.now();
  let addItem = false;
  let deleteItem = false;
  let editItem = false;
  let asyncDelete = null;
  let breadCrumbItems = [
    {
      href: "#/subjects",
      label: "Subjects",
    },
  ];

  const confirmDelete = (item) => {
    deleteItem = item;
  };

  const handleDelete = async () => {
    // @ts-ignore
    let { id } = deleteItem;
    console.log(id);
    asyncDelete = service.delete(id);

    try {
      await asyncDelete;
      hasUpdate = Date.now();
    } catch (e) {}
  };

  const handleEdit = (item) => {
    editItem = item;
  };

  let programs = [];
  let program_courses = [];
  let majors = {};

  onMount(async () => {
    let programCourseService = new ProgramCourseService();
    programs = await programCourseService.getAll();

    program_courses = programs.map(program => {
      return {
        name: `${program.degree} (${program.code}) - Major in ${program.major}`,
        value: program.code,
      }
    });

    for(let i=0; i<programs.length; i++) {
      let { code, major } = programs[i];

      majors[code] = major;
    }
  });
</script>

<Page>
  <Breadcrumb items={breadCrumbItems} />
  <br />
  <Heading tag="h2" class="text-left">
    All subjects
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
          Deleting subject...
        </p>
      {:then}
        <Alert color="green" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          Successfully deleted the subject
        </Alert>
      {:catch error}
        <Alert color="red" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          {error.message}
        </Alert>
      {/await}
    {/if}
  </div>
  <div class="w-full h-96 overflow-y-scroll overflow-x-hidden text-left">
  <SubjectsTable
    {hasUpdate}
    on:edit={({ detail: item }) => handleEdit(item)}
    on:delete={({ detail: item }) => confirmDelete(item)}
  />
  </div>
  {#if program_courses.length}
    <SubjectsForm 
      {majors}
      programs={program_courses}
      open={addItem || editItem}
      item={editItem ? editItem : null}
      on:update={() => (hasUpdate = Date.now())}
      on:cancel={() => {
        addItem = false;
        editItem = false;
      }}
    />
  {/if}
  <ConfirmModal
    on:continue={handleDelete}
    on:cancel={() => (deleteItem = false)}
    message="Delete this subject now?"
    open={deleteItem}
  />
</Page>
