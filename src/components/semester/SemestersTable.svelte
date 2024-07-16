<script>
  import {
    Button,
    ButtonGroup,
    Dropdown,
    DropdownItem,
    Spinner,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    TableSearch,
  } from "flowbite-svelte";
  import SemesterService from "../../services/SemesterService";
  import {
    TrashBinSolid,
    PenSolid,
    UsersSolid,
    UsersGroupSolid,
    PrinterSolid,
    BuildingSolid,
    FileCopySolid,
    DotsHorizontalOutline,
  } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  export let hasUpdate;

  const dispatch = createEventDispatcher();
  let service = new SemesterService();
  let searchTerm = "";
  let items = [];
  let asyncItems;

  $: filteredItems = items.filter((item) => {
    return (
      item.academic_year.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
    );
  });

  $: hasUpdate,
    (() => {
      updateItems();
    })();

  const updateItems = async () => {
    asyncItems = service.getAll();
    items = await asyncItems;
  };
</script>

<TableSearch
  class="overflow-visible"
  placeholder="Search by academic year"
  hoverable={true}
  bind:inputValue={searchTerm}
>
  <TableHead>
    <TableHeadCell>Title</TableHeadCell>
    <TableHeadCell>Semester</TableHeadCell>
    <TableHeadCell class="text-center">Academic Year</TableHeadCell>
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
          <TableBodyCell>{item.title}</TableBodyCell>
          <TableBodyCell>{item.semester} Semester</TableBodyCell>
          <TableBodyCell class="text-center"
            >A.Y. {item.academic_year}</TableBodyCell
          >
          <TableBodyCell class="text-center">
            <ButtonGroup class="*:!ring-primary-700">
              <Button
                on:click={() => dispatch("copy", item)}
                class="!p-2"
                title="Copy"
              >
                <FileCopySolid class="w-5 h-5" />
              </Button>
              <Button
                on:click={() => dispatch("edit", item)}
                class="!p-2 "
                title="Edit"
              >
                <PenSolid class="w-5 h-5" />
              </Button>
              <Button
                on:click={() => dispatch("delete", item)}
                class="!p-2"
                title="Delete"
              >
                <TrashBinSolid class="w-5 h-5" />
              </Button>
              <Button
                tag="a"
                target="_blank"
                href="#/scheduler/teaching_load/{item.id}"
                class="!p-2"
                title="Print"
              >
                <PrinterSolid class="w-5 h-5" />
              </Button>
              <Button
                class="!p-2"
                title="More"
              >
                <DotsHorizontalOutline class="w-5 h-5" />
              </Button>
              <Dropdown>
                <DropdownItem href="#/scheduler/{item.id}">Faculty Program</DropdownItem>
                <DropdownItem href="#/scheduler/student_program/{item.id}">Student Program</DropdownItem>
                <DropdownItem href="#/scheduler/room_utilization/{item.id}">Room Utilization</DropdownItem>
              </Dropdown>
            </ButtonGroup>
          </TableBodyCell>
        </TableBodyRow>
      {:else}
        <TableBodyRow>
          <TableBodyCell colspan={4} class="text-center">
            No items found.
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    {/if}
  </TableBody>
</TableSearch>
