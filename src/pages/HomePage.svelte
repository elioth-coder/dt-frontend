<script>
  import { Card, Heading, Hr } from "flowbite-svelte";
  import Page from "../components/Page.svelte";
  import Breadcrumb from "../components/Breadcrumb.svelte";
  import { onMount } from "svelte";
  import RecipientService from "../services/RecipientService";
  import LocationService from "../services/LocationService";
  import DocumentService from "../services/DocumentService";
  import SubjectService from "../services/SubjectService";

  let locationCount = 0 , recipientCount = 0, documentCount = 0, subjectCount = 0;
  let breadCrumbItems = [];

  onMount(async () => {
    let locationService  = new LocationService();
    let recipientService = new RecipientService();
    let subjectService = new SubjectService();
    let documentService  = new DocumentService();

    locationCount  = await locationService.count();
    recipientCount = await recipientService.count();
    subjectCount = await subjectService.count();
    documentCount  = await documentService.count();
  });
</script>

<Page let:user>
  <Breadcrumb items={breadCrumbItems} />
  <br>
  <Heading tag="h2">
    Welcome to NEUST SYSTEM,
    {#if user}
      @{user.username}
    {/if}
  </Heading>
  <Hr />
  <div class="flex flex-row flex-wrap">
    <Card href="#/records/locations" class="text-center m-2 w-52">
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {locationCount}
      </h5>
      <p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
        Locations
      </p>
    </Card>
    <Card href="#/records/subjects" class="text-center m-2 w-52">
      <h5
        class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
      >
        {subjectCount}
      </h5>
      <p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
        Subjects
      </p>
    </Card>
    <Card href="#/records/recipients" class="text-center m-2 w-52">
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {recipientCount}
      </h5>
      <p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
        Personnels
      </p>
    </Card>
    <Card href="#/records/documents" class="text-center m-2 w-52">
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {documentCount}
      </h5>
      <p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
        Documents
      </p>
    </Card>
  </div>
</Page>
