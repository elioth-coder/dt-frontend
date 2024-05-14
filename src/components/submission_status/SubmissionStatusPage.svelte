<script>
  import { Heading, Hr, List, Li } from "flowbite-svelte";
  import Page from "../Page.svelte";
  import ConfirmModal from "../ConfirmModal.svelte";
  import SubmissionService from "../../services/SubmissionService";
  import Breadcrumb from "../Breadcrumb.svelte";
  import { onMount } from "svelte";
  import { maxBy } from "lodash-es";
  import SubmissionAssignedService from "../../services/SubmissionAssignedService";
  import SubmissionFileService from "../../services/SubmissionFileService";
  import RecipientService from "../../services/RecipientService";
  import SubmissionFileStatusService from "../../services/SubmissionFileStatusService";
  import SubmissionStatusTable from "./SubmissionStatusTable.svelte";
  import { CheckOutline, FileCheckOutline, FileOutline } from "flowbite-svelte-icons";
  export let params = {};

  let submission_id = params.id;
  let submission = null;
  let assigned = [];
  let files = [];
  let rows = [];
  let submissionAssignedService = new SubmissionAssignedService();
  let submissionFileStatusService = new SubmissionFileStatusService();
  let submissionFileService = new SubmissionFileService();
  let submissionService = new SubmissionService();
  let recipientService = new RecipientService();
  let hasUpdate = Date.now();
  let deleteItem = false;
  let asyncDelete = null;
  let breadCrumbItems = [
    {
      href: "#/submissions",
      label: "Submissions",
    },
    {
      href: `#/submissions/${submission_id}`,
      label: "Status",
    },
  ];

  const confirmDelete = (item) => {
    deleteItem = item;
  };

  const handleEdit = (item) => {}

  const handleDelete = async () => {
    // @ts-ignore
    let { id } = deleteItem;
    asyncDelete = submissionService.delete(id);

    try {
      await asyncDelete;
      hasUpdate = Date.now();
    } catch (e) {}
  };

  const getLastSubmitted = async (submission_id, assigned_id) => {
    let formData = new FormData();
    formData.set('submission_id', submission_id);
    formData.set('assigned_id', assigned_id);
    formData.set('status', '1');
    let items = await submissionFileStatusService.getByForm(formData);

    if(!items.length) {
      return null;
    } else {
      return maxBy(items, item => item.dt_submitted)
    }
  }

  onMount(async () => {
    submission = await submissionService.get(submission_id);
    assigned = await submissionAssignedService.getWhere(
      "submission_id",
      submission_id
    );
    files = await submissionFileService.getWhere(
      "submission_id",
      submission_id
    );

    let items = [];
    for (let i = 0; i < assigned.length; i++) {
      let item = {};

      item.person = recipientService.get(assigned[i].personnel_id);
      let fileArray = [];
      for (let j = 0; j < files.length; j++) {
        let formData = new FormData();
        formData.set("file_id", files[j].id);
        formData.set("assigned_id", assigned[i].id);
        let file = submissionFileStatusService.getByForm(formData);
        
        fileArray.push(file);
      }

      item.last_submitted = getLastSubmitted(submission_id, assigned[i].id);
      item.files = [...fileArray];
      item.submitted = (async () => {
        let count = 0;
        for(let i=0; i<item.files.length; i++) {
          let file = await item.files[i];

          console.log({file});
          console.log(file[0].status);

          if(file[0].status == '1') count++;
        }

        return `${count}/${item.files.length}`;
      })();
      items.push(item);
    }

    rows = [...items];
  });
</script>

<Page>
  <Breadcrumb items={breadCrumbItems} />
  <br />
  <Heading tag="h2" class="text-left">
    {#if submission}
      {submission.title}
    {:else}
      Loading...
    {/if}
  </Heading>
  <Hr />
  <div class="w-full h-96 overflow-y-scroll overflow-x-hidden text-left">
    <section class="flex w-full px-5">
      <div class="w-full">
        <Heading tag="h5">Files to submit: </Heading>
        <List list="none" tag="ol">
          {#each files as file, index}
            <Li>
              <b class="me-2">F{index + 1}</b>
              {file.file}
            </Li>
          {/each}
        </List>    
      </div>
      <div class="w-full">
        <Heading tag="h5">File status: </Heading>
        <List>
          <Li icon>
            <span class="inline-block border-2 border-gray-800 rounded text-center w-6 me-1">
              <CheckOutline class="me-3" />
            </span>
            Submitted
          </Li>
          <Li icon>
            <span class="inline-block border-2 border-gray-800 rounded text-center w-6 me-1">
              <CheckOutline class="me-3 opacity-0" />
            </span>
            Not Submitted
          </Li>
        </List>
      </div>
    </section>
    <Hr />
    {#if rows.length && files.length}
      <SubmissionStatusTable 
        {rows}
        {files}
        on:edit={({ detail: item }) => handleEdit(item)}
        on:delete={({ detail: item }) => confirmDelete(item)}
      />
    {/if}
  </div>
  <ConfirmModal
    on:continue={handleDelete}
    on:cancel={() => (deleteItem = false)}
    message="Delete this submission now?"
    open={deleteItem}
  />
</Page>
