<script>
  import { Heading, Hr } from "flowbite-svelte";
  import Page from "../components/Page.svelte";
  import Breadcrumb from "../components/Breadcrumb.svelte";
  import { onMount } from "svelte";

  let breadCrumbItems = [];
  const { ASSETS_URL } = CONFIG;

  onMount(async () => {

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
  <div class="flex">
    <section class="text-center w-full">
      <img src={`${ASSETS_URL}/img/neust-logo.png`} class="block w-80 h-80 m-auto" alt="">
    </section>
    <section class="text-center w-full">
      <img src={`${ASSETS_URL}/img/neust-papaya-logo.png`} class="block w-80 h-80 m-auto" alt="">
    </section>
  </div>
</Page>
