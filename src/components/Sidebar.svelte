<script>
  import { location } from "svelte-spa-router";
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
  } from "flowbite-svelte";
  import {
    PieChartSolid,
    ArrowRightToBracketSolid,
    FileCloneSolid,
    MapLocationOutline,
    UserAddSolid,
  } from "flowbite-svelte-icons";
  import { replace } from "svelte-spa-router";
  import UserService from "../services/UserService";

  $: activeUrl = $location;
  let service = new UserService();

  const logout = async () => {
    let { status, message } = await service.logout();

    if(status == 'success') replace('/login');
  }

  const items = [
    { label: 'Dashboard', 'icon': PieChartSolid, href: '#/' },
    { label: 'Locations', 'icon': MapLocationOutline, href: '#/locations' },
    { label: 'Recipients', 'icon': UserAddSolid, href: '#/recipients' },
    { label: 'Documents', 'icon': FileCloneSolid, href: '#/documents' },
  ];
</script>

<Sidebar {activeUrl}>
  <SidebarWrapper>
    <SidebarGroup>
      {#each items as item}
        <SidebarItem label={item.label} 
          href={item.href} 
          class={activeUrl === item.href.replace('#', '') ? "bg-gray-100" : ""}
        >
          <svelte:fragment slot="icon">
            <svelte:component 
              this={item.icon}
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            ></svelte:component>
          </svelte:fragment>
        </SidebarItem>
      {/each}
    </SidebarGroup>
    <SidebarGroup border>
      <SidebarItem label="Log out" on:click={logout}>
        <svelte:fragment slot="icon">
          <ArrowRightToBracketSolid
            class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
      </SidebarItem>
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>
