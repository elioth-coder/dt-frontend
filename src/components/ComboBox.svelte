<script>
  import { afterUpdate, createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();
  export let name;
  export let disabled = false;
  export let value = "";
  export let required = false;
  export let placeholder = "Choose an option";
  export let items;

  let filteredItems = [];
  let query = "";
  let isOpen = false;
  let selectedItem = null;
  let highlightedIndex = -1;

  onMount(() => {
    filteredItems = items;
  });

  $: {
    if (selectedItem?.value) {
      dispatch('change', selectedItem.value);
    }
  }

  function isReverse() {
    const rect = self.getBoundingClientRect();
    const y_coords = rect.y;
    const screen_height = window.innerHeight;

    return y_coords >= screen_height / 2;
  }

  function getHeight() {
    const rect = self.getBoundingClientRect();
    const y_coords = rect.y;
    const screen_height = window.innerHeight;
    const is_reverse = y_coords >= screen_height / 2;

    if (is_reverse) {
      return parseInt(y_coords + "");
    } else {
      return parseInt(screen_height - (y_coords + rect.height) + "");
    }
  }

  let reverse = false;
  let height = 0;
  function onInput(event) {
    reverse = isReverse();
    height = getHeight();

    let slug = event.target.value.toLowerCase();
    query = event.target.value;
    filteredItems = items.filter(
      (item) =>
        item.name.toLowerCase().includes(slug.trim()) || slug.trim() === ""
    );

    isOpen = filteredItems.length > 0;
    highlightedIndex = -1; // reset highlighted index
  }

  function onBlur(event) {
    setTimeout(() => { 
      isOpen = false; 
      query = selectedItem?.name ?? "";
    }, 250);
  }

  function selectItem(item) {
    selectedItem = item;
    query = item.name;
    isOpen = false;
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      highlightedIndex = (highlightedIndex + 1) % filteredItems.length;
      isOpen = true;
      scrollIntoView();
    } else if (event.key === "ArrowUp") {
      highlightedIndex = (highlightedIndex - 1 + filteredItems.length) % filteredItems.length;
      isOpen = true;
      scrollIntoView();
    } else if (event.key === "Enter" && highlightedIndex >= 0) {
      selectItem(filteredItems[highlightedIndex]);
      highlightedIndex = -1; // reset highlighted index
      event.preventDefault();
    }
  }

  function scrollIntoView() {
    const item = document.querySelector(`.item-${highlightedIndex}`);
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }

  afterUpdate(() => {

    if (value.trim().length) {
      let item = items.filter(item => item.value == value)[0];
      console.log({ name, value, items });

      if (item) selectItem(item);

      value = "";
    }
  });

  let self;
</script>

<div bind:this={self} class="relative w-full">
  <input
    type="search"
    class="disabled:bg-gray-200 disabled:cursor-not-allowed text-base w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
    {placeholder}
    {required}
    {disabled}
    bind:value={query}
    on:input={onInput}
    on:focus={onInput}
    on:blur={onBlur}
    on:keydown={handleKeyDown}
  />
  {#if isOpen && filteredItems.length > 0}
    <ul
      style="max-height: {height - 15}px;"
      class="absolute w-full bg-white border border-gray-300 rounded-md overflow-y-auto z-10 {reverse
        ? '-bottom-0 mb-12'
        : ''}"
    >
      {#each filteredItems as item, index}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li
          class="px-4 py-2 cursor-pointer hover:bg-blue-500 hover:text-white {highlightedIndex === index ? 'bg-blue-500 text-white' : ''} item-{index}"
          on:click={() => selectItem(item)}
        >
          {item.name}
        </li>
      {/each}
    </ul>
  {/if}
  <input
    type="hidden"
    value={selectedItem ? selectedItem.value : ""}
    {name}
  />
</div>

<style>
  /* TailwindCSS included via a postcss plugin */
</style>
