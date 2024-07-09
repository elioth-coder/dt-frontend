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
  import { sortBy } from "lodash-es";
  export let hasUpdate;
  export let semester;

  let items = [];
  let asyncItems;
  let searchTerm = "";
  let scheduleService = new ScheduleService();

  $: filteredItems = items.filter((item) => {
    return (
      item.room.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
    );
  });

  $: hasUpdate,
    (() => {
      updateItems();
    })();

  const updateItems = async () => {
    asyncItems = getRooms();
    items = await asyncItems;
  };

  const getRooms = async () => {
    let rooms = [];
    let fetchedRooms = await scheduleService.getRooms(semester.id);

    rooms = fetchedRooms.map(item => {
      let room = item.room.toUpperCase();
      let building = item.room.toUpperCase();
      let building_1 = ['ROOM 1','ROOM 2','ROOM 3','ROOM 4','COMLAB 1'];
      let building_2 = ['ROOM A','ROOM B','ROOM C','ROOM D','ROOM F','ROOM G','ROOM H','ROOM I','ROOM J','COMLAB 2'];

      if(building_1.includes(room)) {
        building = 'BUILDING 1';
      }
      if(building_2.includes(room)) {
        building = 'BUILDING 2';
      }
      
      return {
        building,
        room,
      }
    });

    rooms = sortBy(rooms, (room) => room.building);

    return rooms;
  }
</script>

<TableSearch
placeholder="Search by room number"
hoverable={true}
bind:inputValue={searchTerm}
>
<TableHead>
  <TableHeadCell>Room No.</TableHeadCell>
  <TableHeadCell class="text-center">Building</TableHeadCell>
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
        <TableBodyCell>{item.room}</TableBodyCell>
        <TableBodyCell class="text-center">{item.building}</TableBodyCell>
        <TableBodyCell class="text-center">
          <Button 
            tag="a"
            target="_blank"
            href="#/scheduler/room_utilization/{semester.id}/{item.room}"
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
        <TableBodyCell colspan={3} class="text-center">
          No items found.
        </TableBodyCell>
      </TableBodyRow>
    {/each}
  {/if}
</TableBody>
</TableSearch>
