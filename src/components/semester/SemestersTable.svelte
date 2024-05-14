<script>
  import {
    Button,
    Spinner,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    TableSearch,
  } from "flowbite-svelte";
  import SemesterService from "../../services/SemesterService";
  import { TrashBinSolid, PenSolid, OrdoredListSolid } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  export let hasUpdate;

  const dispatch = createEventDispatcher();
  let service = new SemesterService();
  let searchTerm = "";
  let items = [];
  let asyncItems;

  $: filteredItems = items.filter((item) => {
    return item.academic_year.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
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
  placeholder="Search by academic year"
  hoverable={true}
  bind:inputValue={searchTerm}
>
  <TableHead>
    <TableHeadCell>Semester</TableHeadCell>
    <TableHeadCell class="text-center">Academic Year</TableHeadCell>
    <TableHeadCell class="text-center">Action</TableHeadCell>
  </TableHead>
  <TableBody>
    {#await asyncItems}
      <TableBodyRow>
        <TableBodyCell colspan={3} class="text-center">
          <Spinner size={4} class="me-1" />
          Fetching items...
        </TableBodyCell>
      </TableBodyRow>
    {:catch error}
      <TableBodyRow>
        <TableBodyCell colspan={3} class="text-center text-red-600">
          {error.message}
        </TableBodyCell>
      </TableBodyRow>
    {/await}
    {#if filteredItems}
      {#each filteredItems as item}
        <TableBodyRow>
          <TableBodyCell>{item.semester} Semester</TableBodyCell>
          <TableBodyCell class="text-center">A.Y. {item.academic_year}</TableBodyCell>
          <TableBodyCell class="text-center">
            <Button
              href="#/scheduler/{item.id}"
              class="!p-2 bg-yellow-500"
              title="Schedule teachers"
            >
              <OrdoredListSolid class="w-5 h-5" />
            </Button>
            <Button
              on:click={() => dispatch("edit", item)}
              class="!p-2 bg-blue-500"
              title="Edit"
            >
              <PenSolid class="w-5 h-5" />
            </Button>
            <Button
              on:click={() => dispatch("delete", item)}
              class="!p-2 bg-red-500"
              title="Delete"
            >
              <TrashBinSolid class="w-5 h-5" />
            </Button>
          </TableBodyCell>
        </TableBodyRow>
      {:else}
        <TableBodyRow>
          <TableBodyCell colspan={3} class="text-center">
            No items found.
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    {/if}
  </TableBody>
</TableSearch>
