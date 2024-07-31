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
  import ProgramCourseService from "../../services/ProgramCourseService";
  import { TrashBinSolid, PenSolid } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  export let hasUpdate;

  const dispatch = createEventDispatcher();
  let { HOST_URL } = CONFIG;
  let service = new ProgramCourseService();
  let searchTerm = "";
  let items = [];
  let asyncItems;

  $: filteredItems = items.filter((item) => {
    return (
      item.code.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      item.degree.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      item.program.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      item.major.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
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
  placeholder="Search by degree"
  hoverable={true}
  bind:inputValue={searchTerm}
>
  <TableHead>
    <TableHeadCell>Code</TableHeadCell>
    <TableHeadCell>Degree</TableHeadCell>
    <TableHeadCell>Major</TableHeadCell>
    <TableHeadCell>Program</TableHeadCell>
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
          <TableBodyCell>{item.code}</TableBodyCell>
          <TableBodyCell>{item.degree}</TableBodyCell>
          <TableBodyCell>{item.major}</TableBodyCell>
          <TableBodyCell>{item.program}</TableBodyCell>
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
          <TableBodyCell colspan={5} class="text-center">
            No items found.
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    {/if}
  </TableBody>
</TableSearch>
