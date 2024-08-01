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
  import SignatoryService from "../../services/SignatoryService";
  import { TrashBinSolid, PenSolid } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  import { sortBy } from "lodash-es";
  export let hasUpdate;

  const dispatch = createEventDispatcher();
  let service = new SignatoryService();
  let searchTerm = "";
  let items = [];
  let asyncItems;

  $: filteredItems = items.filter((item) => {
    return ( 
      item.college.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      item.program.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      item.document.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
    );
  });

  $: hasUpdate,
    (() => {
      updateItems();
    })();

  const updateItems = async () => {
    asyncItems = service.getAll();
    let rowItems = await asyncItems;
    items = sortBy(rowItems, item => item.document);
  };
</script>

<TableSearch
  placeholder="Search by document name"
  hoverable={true}
  bind:inputValue={searchTerm}
>
  <TableHead>
    <TableHeadCell>College</TableHeadCell>
    <TableHeadCell>Program</TableHeadCell>
    <TableHeadCell>Document</TableHeadCell>
    <TableHeadCell>Content</TableHeadCell>
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
          <TableBodyCell>{item.college}</TableBodyCell>
          <TableBodyCell>{item.program}</TableBodyCell>
          <TableBodyCell>{item.document}</TableBodyCell>
          <TableBodyCell class="w-48 max-w-48 text-ellipsis overflow-hidden">{item.content}</TableBodyCell>
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
