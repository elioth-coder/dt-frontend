<script>
  import { Button, Input, Label, Spinner } from "flowbite-svelte";
  import SemesterTeacherService from "../../services/SemesterTeacherService";
  export let semester_teacher;

  let processing = false;
  let semesterTeacherService = new SemesterTeacherService();

  const handleSubmit = async (e) => {
    processing = true;
    let form = e.target;
    let formData = new FormData(form);

    try {
      await semesterTeacherService.update(formData);

      alert('Success');
      setTimeout(() => {
        processing = false;
      }, 1000);
    } catch (e) {
      alert(e.message);
      processing = false;
    }
  };
</script>

<form class="flex mt-3 text-left items-end" on:submit|preventDefault={handleSubmit}>
  <input type="hidden" name="id" value={semester_teacher.id} />
  <input type="hidden" name="semester_id" value={semester_teacher.semester_id} />
  <input type="hidden" name="personnel_id" value={semester_teacher.personnel_id} />
  <div class="w-1/3 pr-1">
    <Label>
      <span>Research: </span><br />
      <Input 
        value={semester_teacher.research ?? ""}
        name="research" 
        type="text" 
        placeholder="-- research --" 
      />
    </Label>
  </div>
  <div class="w-1/3 px-1">
    <Label>
      <span>Extension: </span><br />
      <Input 
        value={semester_teacher.extension ?? ""}
        name="extension" 
        type="text" 
        placeholder="-- extension --" 
      />
    </Label>
  </div>
  <div class="w-1/3 pl-1">
    <Label>
      <span>Consultation: </span><br />
      <Input 
        value={semester_teacher.consultation ?? ""}
        name="consultation" 
        type="text" 
        placeholder="-- consultation --" 
      />
    </Label>
  </div>
  <Button disabled={processing} type="submit" class="ml-2 h-12 w-32">
    {#if processing}
      <Spinner size={4} class="mr-2" />
    {/if}
    Update
  </Button>
</form>
