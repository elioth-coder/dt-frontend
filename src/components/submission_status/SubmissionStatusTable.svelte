<script>
  import {
    Checkbox,
    Spinner,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";
  import SubmissionFileStatusService from "../../services/SubmissionFileStatusService";
  import { format } from "date-fns";
  export let rows;
  export let files;

  const dispatch = createEventDispatcher();
  let { HOST_URL } = CONFIG;
  let submissionFileStatusService = new SubmissionFileStatusService();

  const handleStatusChange = async (e, file_status) => {
    let element = e.target;
    let formData = new FormData();

    for (let key in file_status) {
      formData.append(key, file_status[key]);
    }

    if (element.checked) {
      formData.set("status", "1");
      await submissionFileStatusService.update(formData);
    } else {
      formData.set("status", "0");
      await submissionFileStatusService.update(formData);
    }
  };
</script>

<Table shadow>
  <TableHead defaultRow={false}>
    <tr>
      <TableHeadCell rowspan={2} class="text-center align-bottom">Names</TableHeadCell>
      {#each files as file, index}
        <TableHeadCell class="text-center">F{index + 1}</TableHeadCell>
      {/each}
      <TableHeadCell rowspan={2} class="text-center align-bottom">Submitted</TableHeadCell>
      <TableHeadCell rowspan={2} class="text-center align-bottom">Date Submitted</TableHeadCell>
    </tr>
    <tr>
      <TableHeadCell class="text-center" colspan={files.length}>File Status</TableHeadCell>
    </tr>
  </TableHead>
  <TableBody>
    {#if rows}
      {#each rows as row}
        <TableBodyRow>
          <TableBodyCell>
            {#await row.person}
              Loading...
            {:then person}
              {person.name}
            {/await}
          </TableBodyCell>
          {#each row.files as file}
            <TableBodyCell class="text-center">
              {#await file}
                <Spinner size={4} />
              {:then file_status}
                <Checkbox
                  checked={parseInt(file_status[0].status) == 1}
                  on:change={(e) => handleStatusChange(e, file_status[0])}
                  class="w-4 mx-auto"
                />
              {/await}
            </TableBodyCell>
          {/each}
          <TableBodyCell class="text-center">
            {#await row.submitted}
              <Spinner size={4} />
            {:then submitted}
              {submitted}
            {/await}
          </TableBodyCell>
          <TableBodyCell class="text-center">
            {#await row.last_submitted}
              Loading...
            {:then file}
              {file ? format(new Date(file.dt_submitted), 'yyyy-MM-dd') : ""}
            {/await}
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    {/if}
  </TableBody>
</Table>
