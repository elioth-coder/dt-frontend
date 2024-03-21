<script>
  import { Card, Button, Label, Input, Alert, Heading } from "flowbite-svelte";
  import { ExclamationCircleSolid, FileCopyOutline } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  import { replace } from "svelte-spa-router";
  let { API_URL } = CONFIG;
  let errorMessage = "";

  const handleSubmit = async (e) => {
    let form = e.target;
    let formData = new FormData(form);

    let response = await fetch(`${API_URL}/login`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    let { status, message } = await response.json();

    if (status == "success") {
      replace("/");
    } else {
      errorMessage = message;
    }
  };

  const closeAlert = () => {
    errorMessage = "";
  };

  onMount(async () => {
    let response = await fetch(`${API_URL}/me`, {
      credentials: "include",
    });
    let { user: fetchedUser } = await response.json();

    if (fetchedUser) {
      return replace("/");
    }
  });
</script>

<div class="w-100 relative">
  <Heading tag="h1" class="text-center mt-5">
    <FileCopyOutline class="w-16 h-16 inline-block -ml-16" />
    DocsTracking
  </Heading>
  <Card class="mx-auto mt-5">
    <form
      on:submit|preventDefault={handleSubmit}
      class="flex flex-col space-y-6"
    >
      <h3 class="text-xl font-medium text-gray-900 dark:text-white">
        Sign in to platform
      </h3>
      <Label class="space-y-2">
        <span>Username</span>
        <Input
          type="text"
          name="username"
          placeholder="Enter username."
          required
        />
      </Label>
      <Label class="space-y-2">
        <span>Password</span>
        <Input
          type="password"
          name="password"
          placeholder="Enter password."
          required
        />
      </Label>
      <Button type="submit" class="w-full">Login to your account</Button>
    </form>
  </Card>
  <div class="max-w-sm mx-auto mt-5">
    {#if errorMessage}
      <Alert color="red" dismissable on:close={closeAlert}>
        <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
        {errorMessage}
      </Alert>
    {/if}
  </div>
</div>
