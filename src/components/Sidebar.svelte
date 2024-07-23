<script>
  import { location } from "svelte-spa-router";
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
  } from "flowbite-svelte";
  import {
    ArrowRightToBracketSolid,
    BookmarkSolid,
    ArrowUpRightFromSquareSolid,
    HomeSolid,
    CalendarMonthSolid,
    PenNibSolid,
    UsersSolid,
    BookSolid,
    BuildingSolid,
  } from "flowbite-svelte-icons";
  import { replace } from "svelte-spa-router";
  import UserService from "../services/UserService";

  $: activeUrl = $location;
  let service = new UserService();

  const logout = async (e) => {
    e.preventDefault();
    let confirm_logout = confirm('Are you sure you want to log out?');
    
    if(confirm_logout) {
      let { status, message } = await service.logout();

      if(status == 'success') {
        replace('/login');
      }
    }
  }

  const items = [
    { label: 'Home', 'icon': HomeSolid, href: '#/' },
    { label: 'Files', 'icon': ArrowUpRightFromSquareSolid, href: '#/files' },
    { label: 'Scheduler', 'icon': CalendarMonthSolid, href: '#/scheduler' },
    { label: 'Rooms', 'icon': BuildingSolid, href: '#/rooms' },
    { label: 'Program Courses', 'icon': BookmarkSolid, href: '#/program_courses' },
    { label: 'Subjects', 'icon': BookSolid, href: '#/subjects' },
    { label: 'Faculties', 'icon': UsersSolid, href: '#/faculties' },
    { label: 'Signatories', 'icon': PenNibSolid, href: '#/signatories' },
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
