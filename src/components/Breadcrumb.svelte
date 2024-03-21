<script>
  import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
  export let items = [];
  
</script>

<Breadcrumb>
  <BreadcrumbItem href="#/" home>Home</BreadcrumbItem>
  {#each items as item}
    <BreadcrumbItem href={item.href}>
      {item.label}
    </BreadcrumbItem>
  {/each}
</Breadcrumb>
