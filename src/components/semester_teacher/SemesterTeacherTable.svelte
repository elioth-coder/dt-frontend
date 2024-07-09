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
  CalendarEditSolid,
    PrinterSolid,
    TrashBinSolid,
  } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  import SemesterTeacherService from "../../services/SemesterTeacherService";
  import RecipientService from "../../services/RecipientService";
  export let hasUpdate;
  export let semester;

  const dispatch = createEventDispatcher();
  let { HOST_URL } = CONFIG;
  let items = [];
  let asyncItems;
  let searchTerm = "";
  let semesterTeacherService  = new SemesterTeacherService();
  let recipientService = new RecipientService();

  $: filteredItems = items.filter((item) => {
    return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
  });

  $: hasUpdate,
    (() => {
      updateItems();
    })();

  const updateItems = async () => {
    asyncItems = getTeachers();
    items = await asyncItems;
  };

  const getTeachers = async () => {
    let _items = await semesterTeacherService.getWhere('semester_id', semester.id);
    let teachers = [];

    for(let i=0; i<_items.length; i++) {
      let item = _items[i];
      let teacher = await recipientService.get(item.personnel_id);
      teacher.assigned_id = item.id;

      teachers.push(teacher);
    }

    return teachers;
  }
</script>

<TableSearch
placeholder="Search by name"
hoverable={true}
bind:inputValue={searchTerm}
>
<TableHead>
  <TableHeadCell class="text-center">Photo</TableHeadCell>
  <TableHeadCell>Name</TableHeadCell>
  <TableHeadCell>Employment Status</TableHeadCell>
  <TableHeadCell>Field of Specialization</TableHeadCell>
  <TableHeadCell class="text-center">Action</TableHeadCell>
</TableHead>
<TableBody>
  {#await asyncItems}
    <TableBodyRow>
      <TableBodyCell colspan={5} class="text-center">
        <Spinner size={4} class="me-1" />
        Fetching items...
      </TableBodyCell>
    </TableBodyRow>
  {:catch error}
    <TableBodyRow>
      <TableBodyCell colspan={5} class="text-center text-red-600">
        {error.message}
      </TableBodyCell>
    </TableBodyRow>
  {/await}
  {#if filteredItems}
    {#each filteredItems as item}
      <TableBodyRow>
        <TableBodyCell>
          {#if item.photo}
            <Avatar
              src={`${HOST_URL}/uploads/${item.photo}`}
              size="md"
              class="mx-auto"
            />
          {/if}
        </TableBodyCell>
        <TableBodyCell>{item.name}</TableBodyCell>
        <TableBodyCell>{item.employment_status}</TableBodyCell>
        <TableBodyCell>{item.field_specialization}</TableBodyCell>
        <TableBodyCell class="text-center">
          <Button 
            icon={true} 
            tag="a" 
            target="_blank" 
            href={`#/scheduler/print/${semester.id}/${item.assigned_id}`}
            class="!p-2 bg-green-500" 
            title="Print Schedule"
          >
            <PrinterSolid class="w-5 h-5" />
          </Button>
          <Button 
            href="#/scheduler/{semester.id}/{item.assigned_id}"
            class="!p-2 bg-yellow-500" 
            title="Edit"
          >
            <CalendarEditSolid class="w-5 h-5" />
          </Button>
          <Button 
            on:click={() => dispatch('delete', item)} 
            class="!p-2 bg-red-500" 
            title="Delete"
          >
            <TrashBinSolid class="w-5 h-5" />
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
