<script>
  import { onMount } from "svelte";
  import { replace } from "svelte-spa-router";
  import UserService from "../services/UserService";
  import Sidebar from "./Sidebar.svelte";
  import { Heading } from "flowbite-svelte";

  let service = new UserService();
  let user;

  onMount(async () => {
    let fetchedUser = await service.me();
    user = fetchedUser;

    if (!fetchedUser) {
      return replace("/login");
    }
  });
</script>

<div class="container mx-auto flex">
  <div class="sidebar border-e">
    <Heading tag="h3" class="text-center py-3 mx-1 mb-3 bg-primary-800 text-white">DocsTracking</Heading>
    <Sidebar />
  </div>
  <div class="content text-center w-full p-5">
    <slot {user} />
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
  }
</style>

