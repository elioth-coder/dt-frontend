<script>
  import {
    Avatar,
    Button,
    Spinner,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    TableSearch,
  } from "flowbite-svelte";
  import {
    PrinterSolid,
  } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  import ScheduleService from "../../services/ScheduleService";
  export let hasUpdate;
  export let semester;

  const dispatch = createEventDispatcher();
  let { HOST_URL } = CONFIG;
  let items = [];
  let asyncItems;
  let searchTerm = "";
  let scheduleService = new ScheduleService();

  $: filteredItems = items.filter((item) => {
    return (
      item.section.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      item.year_level.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      item.program.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
    );
  });

  $: hasUpdate,
    (() => {
      updateItems();
    })();

  const updateItems = async () => {
    asyncItems = getSections();
    items = await asyncItems;
  };

  const getSections = async () => {
    let sections = [];
    let fetchedSections = await scheduleService.getSections(semester.id);

    sections = fetchedSections.map(item => {
      let [program, year_level] = item.section.split(' - ');
      year_level = parseInt(year_level);

      return {
        program,
        year_level,
        section: item.section
      }
    }).sort();

    return sections;
  }
</script>

<TableSearch
placeholder="Search by section"
hoverable={true}
bind:inputValue={searchTerm}
>
<TableHead>
  <TableHeadCell>Block/Section</TableHeadCell>
  <TableHeadCell class="text-center">Year Level</TableHeadCell>
  <TableHeadCell class="text-center">Program/Course</TableHeadCell>
  <TableHeadCell class="text-center">Action</TableHeadCell>
</TableHead>
<TableBody>
  {#await asyncItems}
    <TableBodyRow>
      <TableBodyCell colspan={4} class="text-center">
        <Spinner size={4} class="me-1" />
        Fetching items...
      </TableBodyCell>
    </TableBodyRow>
  {:catch error}
    <TableBodyRow>
      <TableBodyCell colspan={4} class="text-center text-red-600">
        {error.message}
      </TableBodyCell>
    </TableBodyRow>
  {/await}
  {#if filteredItems}
    {#each filteredItems as item}
      <TableBodyRow>
        <TableBodyCell>{item.section}</TableBodyCell>
        <TableBodyCell class="text-center">{item.year_level}</TableBodyCell>
        <TableBodyCell class="text-center">{item.program}</TableBodyCell>
        <TableBodyCell class="text-center">
          <Button 
            tag="a"
            target="_blank"
            href="#/scheduler/student_program/{semester.id}/{item.section}"
            class="!p-2 bg-primary-500" 
            title="Print Schedule"
          >
            <PrinterSolid class="w-5 h-5" />
            Print Schedule
          </Button>
        </TableBodyCell>
      </TableBodyRow>
    {:else}
      <TableBodyRow>
        <TableBodyCell colspan={5} class="text-center">
          No items found.
        </TableBodyCell>
      </TableBodyRow>
    {/each}
  {/if}
</TableBody>
</TableSearch>
