<script>
  import { Heading, Hr } from "flowbite-svelte";
  import Page from "../Page.svelte";
  import SemesterService from "../../services/SemesterService";
  import { onMount } from "svelte";
  import Breadcrumb from "../Breadcrumb.svelte";
  import RoomUtilizationTable from "./RoomUtilizationTable.svelte";
  export let params = {};

  let semester_id = params.id;
  let semesterService = new SemesterService();
  let hasUpdate = Date.now();
  let semester;
  let breadCrumbItems = [
    {
      href: "#/scheduler",
      label: "Scheduler",
    },
    {
      href: "#/scheduler/" + semester_id,
      label: "Room Utilization",
    },
  ];

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
  {#if semester}
    <div class="w-full h-96 overflow-y-scroll overflow-x-hidden text-left">
      <RoomUtilizationTable
        {hasUpdate}
        {semester}
      />
    </div>
  {/if}
</Page>
