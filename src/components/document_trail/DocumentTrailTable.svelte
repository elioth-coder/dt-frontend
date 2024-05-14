<script>
  import {
    Avatar,
    Button,
    P,
    Spinner,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Tooltip,
  } from "flowbite-svelte";
  import {
    PenSolid,
    TrashBinSolid,
  } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  import { format } from "date-fns";
  import DocumentService from "../../services/DocumentService";
  export let hasUpdate;
  export let _document;

  const dispatch = createEventDispatcher();
  let { HOST_URL } = CONFIG;
  let items = [];
  let asyncItems;
  let service = new DocumentService();

  $: hasUpdate,
    (() => {
      updateItems();
    })();

  const updateItems = async () => {
    asyncItems = service.getTrail(_document.id);
    items = await asyncItems;
  };
</script>


<Table
  hoverable={true}
>
  <TableHead>
    <TableHeadCell class="text-center"></TableHeadCell>
    <TableHeadCell>Location</TableHeadCell>
    <TableHeadCell class="text-center">Recipient</TableHeadCell>
    <TableHeadCell>Date/Remarks</TableHeadCell>
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
      {#each items as item}
        <TableBodyRow>
          <TableBodyCell class="text-center">
            {#if item.location.photo}
              <Avatar
                src={`${HOST_URL}/uploads/${item.location.photo}`}
                size="md"
                class="mx-auto"
              />
            {/if}
          </TableBodyCell>
          <TableBodyCell>
            {item.location.name}
          </TableBodyCell>
          <TableBodyCell class="text-center">
            <Avatar
              size="xs"
              class="inline"
              src={`${HOST_URL}/uploads/${item.recipient.photo ? item.recipient.photo : "profile.png"}`}
            />
            <Tooltip type="light">{item.recipient.name}</Tooltip>
          </TableBodyCell>
          <TableBodyCell>
            <P size="xs">{format(new Date(item.dt_created), "MMMM do, yyyy 'at' hh:mm a")}</P>
            {#if item.remarks}{item.remarks}{/if}
          </TableBodyCell>
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
  </TableBody>
</Table>
