<script>
  import {
    Button,
    Modal,
    Label,
    Input,
    Spinner,
    Alert,
    MultiSelect,
    Textarea,
  } from "flowbite-svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import SubmissionService from "../../services/SubmissionService";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
  } from "flowbite-svelte-icons";
  import FacultyService from "../../services/FacultyService";
  import SubmissionFileService from "../../services/SubmissionFileService";
  import SubmissionAssignedService from "../../services/SubmissionAssignedService";
  import SubmissionFileStatusService from "../../services/SubmissionFileStatusService";
  export let open;
  export let item = null;

  const dispatch = createEventDispatcher();
  let processing = false;
  let message = null;
  let assigned = [];
  let submissionAssignedService = new SubmissionAssignedService();
  let submissionFileService = new SubmissionFileService();
  let submissionFileStatusService = new SubmissionFileStatusService();
  let submissionService = new SubmissionService();
  let facultyService = new FacultyService();
  let employees = [];

  const handleClose = () => {
    message = null;
    dispatch("cancel");
  };

  const handleSubmit = async (e) => {
    processing = true;
    let form = e.target;
    let formData = new FormData(form);

    let data = formData.get('files') + '';
    let files = data.split('\n').map(file => file.trim());

    if(!files.length) {
      return alert("Enter files to submit!");
    }

    if(!assigned.length) {
      return alert("Enter assigned faculties!");
    }

    try {
      if (formData.get("id")) {
        let submissionFormData = new FormData();
          submissionFormData.set('id', formData.get('id'));
          submissionFormData.set('title', formData.get('title'));
          submissionFormData.set('deadline', formData.get('deadline'));
        let submission = await submissionService.update(submissionFormData);
        message = {
          type: "success",
          text: "Successfully updated submission",
        };
      } else {
        let submissionFormData = new FormData();
          submissionFormData.set('title', formData.get('title'));
          submissionFormData.set('deadline', formData.get('deadline'));
        let submission = await submissionService.add(submissionFormData);

        for(let i=0; i<files.length; i++) {
          let submissionFileFormData = new FormData();
          submissionFileFormData.set('file', files[i]);
          submissionFileFormData.set('submission_id', submission.id);
            
          await submissionFileService.add(submissionFileFormData);
        }

        for(let i=0; i<assigned.length; i++) {
          let submissionAssignedFormData = new FormData();
          submissionAssignedFormData.set('personnel_id', assigned[i]);
          submissionAssignedFormData.set('submission_id', submission.id);
            
          await submissionAssignedService.add(submissionAssignedFormData);
        }

        let assignedFiles = await submissionFileService.getWhere('submission_id', submission.id);
        let assignedPersonnels = await submissionAssignedService.getWhere('submission_id', submission.id);

        for(let i=0; i<assignedPersonnels.length; i++) {
          for(let j=0; j<assignedFiles.length; j++) {
            let fileStatusFormData = new FormData();
            fileStatusFormData.set('submission_id', submission.id);
            fileStatusFormData.set('assigned_id', assignedPersonnels[i].id);
            fileStatusFormData.set('file_id', assignedFiles[j].id);
            fileStatusFormData.set('status', '0');

            let file_status = await submissionFileStatusService.add(fileStatusFormData);

            console.log(file_status);
          }
        }

        assigned = [];

        message = {
          type: "success",
          text: "Successfully added submission",
        };
      }

      setTimeout(() => {
        processing = false;
        dispatch("cancel");
        dispatch("update");
        message = null;
      }, 1000);
    } catch (e) {
      message = {
        type: "error",
        text: e.message,
      };
      processing = false;
    }
  };

  const closeAlert = () => {
    message = null;
  };

  onMount(async () => {
    let faculties = await facultyService.getAll();

    employees = faculties.map((faculty) => ({
      value: faculty.id,
      name: faculty.name,
    }));
  });
</script>

<Modal
  bind:open
  size="lg"
  title="SUBMISSION"
  placement="top-center"
  dismissable={false}
  autoclose={false}
  class="w-full"
  on:close={() => dispatch("cancel")}
>
  <form
    on:submit|preventDefault={handleSubmit}
    class="grid grid-cols-2 text-left"
    action="#"
  >
    {#if item}
      <input type="hidden" name="id" value={item.id} />
    {/if}
    <input type="submit" id="submit" class="hidden" />
    <section class="flex flex-col space-y-6 pe-3">
      <Label class="space-y-2">
        <span>Title</span>
        <Input
          disabled={processing}
          type="text"
          name="title"
          value={item?.title ?? ""}
          placeholder="Enter submission title"
          required
        />
      </Label>
      {#if !item}
        <Label class="space-y-2">
          <span>Files to submit</span>
          <Textarea
            placeholder="Enter files to submit"
            rows="6" 
            name="files"
            required
          />
        </Label>
      {/if}
    </section>
    <section class="flex flex-col space-y-6 ps-3">
      <Label class="space-y-2">
        <span>Deadline</span>
        <Input
          disabled={processing}
          type="date"
          name="deadline"
          value={item?.deadline ?? ""}
          placeholder="Enter submission deadline"
          required
        />
      </Label>
      {#if !item}
        <Label class="space-y-2">
          <span>Assigned employees</span>
          <MultiSelect
            items={employees}
            bind:value={assigned}
          />
        </Label>
      {/if}
    </section>
    <div class="col-span-12 text-right pt-3">
      <Button
        disabled={processing}
        on:click={() => document.getElementById("submit").click()}
      >
        {#if processing}
          <Spinner size={4} class="mr-2" />
        {/if}
        Submit
      </Button>
      <Button disabled={processing} color="alternative" on:click={handleClose}
        >Cancel</Button
      >
    </div>
  </form>
  {#if message}
    <div class="absolute max-w-md w-full top-full mt-5 -ml-5">
      {#if message.type == "error"}
        <Alert color="red" class="m-0" dismissable on:close={closeAlert}>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          {message.text}
        </Alert>
      {/if}
      {#if message.type == "success"}
        <Alert color="green" class="m-0" dismissable on:close={closeAlert}>
          <InfoCircleSolid slot="icon" class="w-4 h-4" />
          {message.text}
        </Alert>
      {/if}
    </div>
  {/if}
</Modal>
