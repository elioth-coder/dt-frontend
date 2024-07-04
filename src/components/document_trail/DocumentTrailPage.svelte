<script>
  import {
    Heading,
    Button,
    Spinner,
    Alert,
    Hr,
    Table,
    TableBodyRow,
    TableBodyCell,
    TableHead,
    TableHeadCell,
    Popover,
    Drawer,
    CloseButton,
    Avatar,
  } from "flowbite-svelte";
  import Page from "../Page.svelte";
  import ConfirmModal from "../ConfirmModal.svelte";
  import SemesterService from "../../services/SemesterService";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
    PenSolid,
    PrinterOutline,
    TrashBinSolid,
  } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  import Breadcrumb from "../Breadcrumb.svelte";
  import DocumentTrailForm from "./DocumentTrailForm.svelte";
  import DocumentTrailService from "../../services/DocumentTrailService";
  import { sineIn } from "svelte/easing";
  let { HOST_URL } = CONFIG;

  let documentTrailService = new DocumentTrailService();
  let hasUpdate = Date.now();
  let deleteItem = false;
  let editItem = false;
  let asyncDelete = null;
  let breadCrumbItems = [
    {
      href: "#/document_trail",
      label: "Document Trail",
    },
  ];

  const confirmDelete = (item) => {
    deleteItem = item;
  };

  const handleDelete = async () => {
    // @ts-ignore
    let { id } = deleteItem;
    asyncDelete = documentTrailService.delete(id);

    try {
      await asyncDelete;
      hasUpdate = Date.now();
    } catch (e) {}
  };

  const handleEdit = (item) => {
    editItem = false;
    hideDrawer = false;
    editItem = item;
  };

  onMount(async () => {
    updateItems();
  });

  $: hasUpdate,
    (() => {
      updateItems();
    })();

  let asyncItems;
  let items;

  const getDocuments = async () => {
    let documents = await documentTrailService.getAll();

    return documents;
  };

  const updateItems = async () => {
    asyncItems = getDocuments();
    items = await asyncItems;
  };

  const handleCancel = () => {
    editItem = false;
    hideDrawer = true;
  };

  let hideDrawer = true;
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn,
  };
</script>

<Page>
  <Breadcrumb items={breadCrumbItems} />
  <br />

  <Heading tag="h5" class="text-left align-middle my-0">
    All documents
    {#if hideDrawer}
      <Button on:click={() => (hideDrawer = false)} class="float-right">
        Forward document
      </Button>
    {/if}
  </Heading>

  <div class="mb-4">
    {#if asyncDelete}
      {#await asyncDelete}
        <p>
          <Spinner />
          Deleting document...
        </p>
      {:then}
        <Alert color="green" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          Successfully deleted the document
        </Alert>
      {:catch error}
        <Alert color="red" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          {error.message}
        </Alert>
      {/await}
    {/if}
  </div>
  <div class="flex flex-col">
    <Drawer
      backdrop={false}
      activateClickOutside={false}
      transitionType="fly"
      {transitionParams}
      bind:hidden={hideDrawer}
      width="w-96"
    >
      <div class="flex items-center mb-4">
        <h4
          id="drawer-label"
          class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
        >
          <InfoCircleSolid class="w-5 h-5 me-2.5" />Forward Document
        </h4>
        <CloseButton
          on:click={() => (hideDrawer = true)}
          class="mb-4 dark:text-white"
        />
      </div>

      <DocumentTrailForm
        item={editItem ?? null}
        on:update={() => (hasUpdate = Date.now())}
        on:cancel={handleCancel}
      />
    </Drawer>
    <br />
    <div class="flex flex-col">
      <div class="overflow-x-scroll" style="width: 900px;">
        <Table striped={true} border={true}>
          <TableHead>
            <TableHeadCell class="text-center">No.</TableHeadCell>
            <TableHeadCell>Type of Document</TableHeadCell>
            <TableHeadCell>Purpose</TableHeadCell>
            <TableHeadCell>Document Name</TableHeadCell>
            <TableHeadCell class="text-center">Program</TableHeadCell>
            <TableHeadCell class="text-center">Qty.</TableHeadCell>
            <TableHeadCell>Action Needed</TableHeadCell>
            <TableHeadCell>Forwarded Office</TableHeadCell>
            <TableHeadCell>Date Forwarded</TableHeadCell>
            <TableHeadCell>Date Returned</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Remarks</TableHeadCell>
            <TableHeadCell class="text-center">Action</TableHeadCell>
          </TableHead>
          {#await asyncItems}
            <TableBodyRow>
              <TableBodyCell colspan={13} class="text-center">
                <Spinner size={4} class="me-1" />
                Fetching items...
              </TableBodyCell>
            </TableBodyRow>
          {:catch error}
            <TableBodyRow>
              <TableBodyCell colspan={13} class="text-center text-red-600">
                {error.message}
              </TableBodyCell>
            </TableBodyRow>
          {/await}
          {#if items}
            {#each items as item, index}
              <TableBodyRow>
                <TableBodyCell class="text-right">{index + 1}.</TableBodyCell>
                <TableBodyCell>{item.document_type}</TableBodyCell>
                <TableBodyCell>{item.purpose}</TableBodyCell>
                <TableBodyCell>{item.name}</TableBodyCell>
                <TableBodyCell class="text-center">{item.program}</TableBodyCell>
                <TableBodyCell class="text-center">{item.quantity}</TableBodyCell>
                <TableBodyCell>{item.action_needeed}</TableBodyCell>
                <TableBodyCell>{item.office}</TableBodyCell>
                <TableBodyCell>{item.date_forwarded}</TableBodyCell>
                <TableBodyCell>{item.date_forwarded}</TableBodyCell>
                <TableBodyCell>{item.date_returned}</TableBodyCell>
                <TableBodyCell>{item.status}</TableBodyCell>
                <TableBodyCell>{item.remarks}</TableBodyCell>
                <TableBodyCell class="text-center"></TableBodyCell>
              </TableBodyRow>
            {:else}
              <TableBodyRow>
                <TableBodyCell colspan={11} class="text-center">
                  No schedules found.
                </TableBodyCell>
              </TableBodyRow>
            {/each}
          {/if}
        </Table>
      </div>

    </div>
    {#if hideDrawer}
      <section class="w-full text-right my-3">
        <Button icon={true}>
          <PrinterOutline size="lg" />
          Print Table
        </Button>
      </section>
    {/if}
  </div>
  <ConfirmModal
    on:continue={handleDelete}
    on:cancel={() => (deleteItem = false)}
    message="Delete this document?"
    open={deleteItem}
  />
</Page>
