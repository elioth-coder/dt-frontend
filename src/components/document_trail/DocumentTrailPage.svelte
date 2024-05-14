<script>
  import { Heading, Button, Spinner, Alert, Hr } from "flowbite-svelte";
  import Page from "../Page.svelte";
  import ConfirmModal from "../ConfirmModal.svelte";
  import DocumentService from "../../services/DocumentService";
  import DocumentTrailService from "../../services/DocumentTrailService";
  import { ExclamationCircleSolid } from "flowbite-svelte-icons";
  import DocumentTrailTable from "./DocumentTrailTable.svelte";
  import { onMount } from "svelte";
  import DocumentTrailForm from "./DocumentTrailForm.svelte";
  import Breadcrumb from "../Breadcrumb.svelte";
  export let params = {};

  let document_id = params.id;
  let documentService = new DocumentService();
  let trailService = new DocumentTrailService();
  let hasUpdate = Date.now();
  let addItem = false;
  let deleteItem = false;
  let editItem = false;
  let asyncDelete = null;
  let _document;
  let breadCrumbItems = [
    {
      href: "#/documents",
      label: "Documents",
    },
    {
      href: "#/documents/" + document_id,
      label: "Trail",
    },
  ];

  const confirmDelete = (item) => {
    deleteItem = item;
  };

  const handleDelete = async () => {
    // @ts-ignore
    let { id } = deleteItem;
    asyncDelete = trailService.delete(id);

    try {
      await asyncDelete;
      hasUpdate = Date.now();
    } catch (e) {}
  };

  const handleEdit = (item) => {
    editItem = item;
  };

  onMount(async () => {
    _document = await documentService.get(document_id);
  });
</script>

<Page>
  <Breadcrumb items={breadCrumbItems} />
  <br>
  <h4 class="text-gray-400 text-start">
    Category : 
    {#if _document}
      {_document.category}
    {:else}
      Loading...
    {/if}
  </h4>
  <Heading tag="h2" class="text-left">
    {#if _document}
      {_document.name}
    {:else}
      Loading...
    {/if}
    <Button on:click={() => (addItem = true)} class="float-right">
      Add trail
    </Button>
  </Heading>
  <Hr />
  <div class="mb-4">
    {#if asyncDelete}
      {#await asyncDelete}
        <p>
          <Spinner />
          Deleting trail...
        </p>
      {:then}
        <Alert color="green" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          Successfully deleted the trail
        </Alert>
      {:catch error}
        <Alert color="red" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          {error.message}
        </Alert>
      {/await}
    {/if}
  </div>
  {#if _document}
    <div class="w-full h-96 overflow-y-scroll overflow-x-hidden text-left">
      <DocumentTrailTable
        {hasUpdate}
        {_document} 
        on:edit={({ detail: item }) => handleEdit(item)}
        on:delete={({ detail: item }) => confirmDelete(item)}
      />
    </div>
    <DocumentTrailForm
      {_document}
      open={addItem || editItem}
      item={(editItem) ? editItem : null}
      on:update={() => (hasUpdate = Date.now())}
      on:cancel={() => {
        addItem = false;
        editItem = false;
      }}
    />
  {/if}
  <ConfirmModal
    on:continue={handleDelete}
    on:cancel={() => (deleteItem = false)}
    message="Delete this trail now?"
    open={deleteItem}
  />
</Page>
