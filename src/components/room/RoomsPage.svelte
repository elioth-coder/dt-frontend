<script>
  import { Heading, Button, Spinner, Alert } from "flowbite-svelte";
  import Page from "../Page.svelte";
  import RoomsTable from "./RoomsTable.svelte";
  import RoomsForm from "./RoomsForm.svelte";
  import ConfirmModal from "../ConfirmModal.svelte";
  import RoomService from "../../services/RoomService";
  import { ExclamationCircleSolid } from "flowbite-svelte-icons";
  import Breadcrumb from "../Breadcrumb.svelte";

  let service = new RoomService();
  let hasUpdate = Date.now();
  let addItem = false;
  let deleteItem = false;
  let editItem = false;
  let asyncDelete = null;
  let breadCrumbItems = [
    {
      href: '#/rooms',
      label: 'Rooms'
    }
  ];

  const confirmDelete = (item) => {
    deleteItem = item;
  };

  const handleDelete = async () => {
    // @ts-ignore
    let { id } = deleteItem;
    console.log(id);
    asyncDelete = service.delete(id);

    try {
      await asyncDelete;
      hasUpdate = Date.now();
    } catch(e) {}
  };

  const handleEdit = (item) => {
    editItem = item;
  }
</script>

<Page>
  <Breadcrumb items={breadCrumbItems} />
  <br>
  <Heading tag="h2" class="text-left">
    All Rooms
    <Button on:click={() => (addItem = true)} class="float-right"
      >Add new</Button
    >
  </Heading>
  <br />
  <div class="px-4">
    {#if asyncDelete}
      {#await asyncDelete}
        <p>
          <Spinner />
          Deleting room...
        </p>
      {:then}
        <Alert color="green" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          Successfully deleted the room
        </Alert>
      {:catch error}
        <Alert color="red" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          {error.message}
        </Alert>
      {/await}
    {/if}
  </div>
  <div class="w-full h-96 overflow-y-scroll overflow-x-hidden text-left">
    <RoomsTable
      {hasUpdate}
      on:edit={({ detail: item }) => handleEdit(item)}
      on:delete={({ detail: item }) => confirmDelete(item)}
    />
  </div>
  <RoomsForm
    open={addItem || editItem}
    item={(editItem) ? editItem : null}
    on:update={() => (hasUpdate = Date.now())}
    on:cancel={() => {
      addItem = false;
      editItem = false;
    }}
  />
  <ConfirmModal
    on:continue={handleDelete}
    on:cancel={() => (deleteItem = false)}
    message="Delete this room now?"
    open={deleteItem}
  />
</Page>
