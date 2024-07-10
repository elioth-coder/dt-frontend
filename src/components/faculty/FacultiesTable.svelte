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
    import FacultyService from "../../services/FacultyService";
    import { TrashBinSolid, PenSolid } from "flowbite-svelte-icons";
    import { createEventDispatcher } from "svelte";
    export let hasUpdate;
  
    const dispatch = createEventDispatcher();
    let { HOST_URL } = CONFIG;
    let service = new FacultyService();
    let searchTerm = "";
    let items = [];
    let asyncItems;
  
    $: filteredItems = items.filter((item) => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
    });

    $: hasUpdate, (() => {
      updateItems();
    })()
  
    const getInitials = (name) => {
      let names = name.split(' ');
      let initials = [];

      for(let i=0; i<names.length; i++) {
        initials.push(names[i].charAt(0) + '.');
      }

      return initials.join('');
    }

    const updateItems = async () => {
      asyncItems = service.getAll();
      items = await asyncItems;
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
      <TableHeadCell>Specialization</TableHeadCell>
      <TableHeadCell>College</TableHeadCell>
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
            <TableBodyCell>
              {#if item.photo}
                <Avatar
                  src={`${HOST_URL}/uploads/${item.photo}`}
                  size="md"
                  class="mx-auto"
                />
              {/if}
            </TableBodyCell>
            <TableBodyCell>
              {item.first_name} 
              {getInitials(item.middle_name)} 
              {item.last_name}
            </TableBodyCell>
            <TableBodyCell title={item.employment_status} 
              class="max-w-40 overflow-hidden text-ellipsis"
            >
              {item.employment_status}
            </TableBodyCell>
            <TableBodyCell title={item.field_specialization} 
              class="max-w-40 overflow-hidden text-ellipsis"
            >
              {item.field_specialization}
            </TableBodyCell>
            <TableBodyCell>{item.college}</TableBodyCell>
            <TableBodyCell class="text-center">
              <Button 
                on:click={() => dispatch('edit', item)}
                class="!p-2 bg-blue-500" 
                title="Edit"
              >
                <PenSolid class="w-5 h-5" />
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
            <TableBodyCell colspan={6} class="text-center">
              No items found.
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      {/if}
    </TableBody>
  </TableSearch>
  