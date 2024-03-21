<script>
  import {
    Avatar,
    Popover,
    Spinner,
    Timeline,
    TimelineItem,
    Tooltip,
  } from "flowbite-svelte";
  import {
    MapLocationOutline,
    PenOutline,
    TrashBinOutline,
  } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  import { format } from "date-fns";
  import DocumentService from "../services/DocumentService";
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

<Timeline order="vertical">
  {#await asyncItems}
    <p class="text-center">
      <Spinner size={4} class="me-1" />
      Fetching items...
    </p>
  {:catch error}
    <p class="text-center text-red-600">
      {error.message}
    </p>
  {/await}
  {#each items as item}
    <TimelineItem
      class="item"
      title={item.recipient.name}
      date={format(new Date(item.dt_created), "MMMM do, yyyy 'at' hh:mm a")}
    >
      <svelte:fragment slot="icon">
        <span
          class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-primary-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-primary-900"
        >
          <Avatar
            size="xs"
            class="inline"
            src={`${HOST_URL}/uploads/${item.recipient.photo ? item.recipient.photo : "profile.png"}`}
          />
        </span>
        {#if item.remarks}
          <Tooltip type="light">{item.remarks}</Tooltip>
        {/if}
      </svelte:fragment>
      <div class="w-full">
        <h2 class="fs-2">
          <MapLocationOutline class="inline" />
          <!-- svelte-ignore a11y-missing-attribute -->
          Location: 
          <a class="cursor-pointer hover:underline hover:text-primary-600">{item.location.name}</a>
          <Popover class="w-80 text-sm">
            <div class="flex">
              <div class="me-3 shrink-0">
                <!-- svelte-ignore a11y-missing-attribute -->
                <a class="block p-2 bg-gray-100 rounded-lg dark:bg-gray-700">
                  <img 
                    class="w-8 h-8 rounded-full" 
                    src={`${HOST_URL}/uploads/${item.location.photo ? item.location.photo : "profile.png"}`}
                    alt="Flowbite logo" 
                  />
                </a>
              </div>
              <div class="flex items-center">
                <p class="mb-1 text-base font-semibold leading-none text-gray-900 dark:text-white">
                  {item.location.name}
                </p>
              </div>
            </div>
          </Popover>
        </h2>
      </div>
      <div class="w-full mt-1 border-b py-2 text-xs">
        <button
          title="Edit"
          on:click={() => dispatch("edit", item)}
          class="text-blue-500 hover:underline rounded px-1"
        >
          <PenOutline class="w-4 h-4 inline -mt-1" /> Edit
        </button>
        |
        <button
          title="Delete"
          on:click={() => dispatch("delete", item)}
          class="text-blue-500 hover:underline rounded px-1"
        >
          <TrashBinOutline class="w-4 h-4 inline -mt-1" /> Delete
        </button>
      </div>
    </TimelineItem>
  {:else}
    <h3 class="text-gray-100 text-center">No items found.</h3>
  {/each}
</Timeline>