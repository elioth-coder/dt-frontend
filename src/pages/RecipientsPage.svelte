<script>
  import { Heading, Button, Spinner, Alert } from "flowbite-svelte";
  import Page from "../components/Page.svelte";
  import RecipientsTable from "../components/RecipientsTable.svelte";
  import RecipientsForm from "../components/RecipientsForm.svelte";
  import ConfirmModal from "../components/ConfirmModal.svelte";
  import RecipientService from "../services/RecipientService";
  import { ExclamationCircleSolid } from "flowbite-svelte-icons";
  import Breadcrumb from "../components/Breadcrumb.svelte";
  import { onMount } from "svelte";

  let service = new RecipientService();
  let hasUpdate = Date.now();
  let addItem = false;
  let deleteItem = false;
  let editItem = false;
  let asyncDelete = null;
  let breadCrumbItems = [
    {
      href: "#/recipients",
      label: "Recipients",
    },
  ];

  const confirmDelete = (item) => {
    deleteItem = item;
  };

  const handleDelete = async () => {
    // @ts-ignore
    let { id } = deleteItem;
    asyncDelete = service.delete(id);

    try {
      await asyncDelete;
      hasUpdate = Date.now();
    } catch (e) {}
  };

  const handleEdit = (item) => {
    editItem = item;
  };

  onMount(async () => {

  });
</script>

<Page>
  <Breadcrumb items={breadCrumbItems} />
  <br>
  <Heading tag="h2" class="text-left">
    All recipients
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
          Deleting recipient...
        </p>
      {:then}
        <Alert color="green" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          Successfully deleted the recipient
        </Alert>
      {:catch error}
        <Alert color="red" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          {error.message}
        </Alert>
      {/await}
    {/if}
  </div>
  <div class="w-full h-96 overflow-y-scroll overflow-x-hidden text-left px-5">
    <RecipientsTable
      {hasUpdate}
      on:edit={({ detail: item }) => handleEdit(item)}
      on:delete={({ detail: item }) => confirmDelete(item)}
    />
  </div>
  <RecipientsForm
    open={addItem || editItem}
    item={editItem ? editItem : null}
    on:update={() => (hasUpdate = Date.now())}
    on:cancel={() => {
      addItem = false;
      editItem = false;
    }}
  />
  <ConfirmModal
    on:continue={handleDelete}
    on:cancel={() => (deleteItem = false)}
    message="Delete this recipient now?"
    open={deleteItem}
  />
</Page>
