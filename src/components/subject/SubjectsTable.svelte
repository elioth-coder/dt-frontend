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
  import SubjectService from "../../services/SubjectService";
  import { TrashBinSolid, PenSolid } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  export let hasUpdate;

  const dispatch = createEventDispatcher();
  let service = new SubjectService();
  let searchTerm = "";
  let items = [];
  let asyncItems;

  $: filteredItems = items.filter((item) => {
    return (
      item.code.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      item.title.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      item.program.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      item.year_level.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      item.semester.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
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
  placeholder="Search by code"
  hoverable={true}
  bind:inputValue={searchTerm}
>
  <TableHead>
    <TableHeadCell>Code</TableHeadCell>
    <TableHeadCell>Title</TableHeadCell>
    <TableHeadCell class="text-center">Program</TableHeadCell>
    <TableHeadCell class="text-center">Year</TableHeadCell>
    <TableHeadCell class="text-center">Semester</TableHeadCell>
    <TableHeadCell class="text-center">Action</TableHeadCell>
  </TableHead>
  <TableBody>
    {#await asyncItems}
      <TableBodyRow>
        <TableBodyCell colspan={6} class="text-center">
          <Spinner size={4} class="me-1" />
          Fetching items...
        </TableBodyCell>
      </TableBodyRow>
    {:catch error}
      <TableBodyRow>
        <TableBodyCell colspan={6} class="text-center text-red-600">
          {error.message}
        </TableBodyCell>
      </TableBodyRow>
    {/await}
    {#if filteredItems}
      {#each filteredItems as item}
        <TableBodyRow>
          <TableBodyCell>{item.code}</TableBodyCell>
          <TableBodyCell class="max-w-80 text-ellipsis overflow-hidden" title={item.title}>{item.title}</TableBodyCell>
          <TableBodyCell class="text-center">{item.program}</TableBodyCell>
          <TableBodyCell class="text-center">{item.year_level}</TableBodyCell>
          <TableBodyCell class="text-center">{item.semester}</TableBodyCell>
          <TableBodyCell class="text-center">
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
          <TableBodyCell colspan={6} class="text-center">
            No items found.
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    {/if}
  </TableBody>
</TableSearch>
