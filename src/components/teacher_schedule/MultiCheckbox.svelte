<script>
  import { isEqual } from "lodash-es";
  import { afterUpdate, createEventDispatcher } from "svelte";

  export let name = '';
  export let items = [];
  export let selected = [];
  export let required = false;

  const dispatch = createEventDispatcher();
  let previousSelected = [];

  afterUpdate(() => {
    if(!isEqual(previousSelected, selected)) {
      previousSelected = [...selected];
      dispatch('change', selected);
    }
  });
</script>

<div class="w-full border border-gray-300 p-1 rounded-md">
  {#each items as item}
    <label class="w-1/3 inline-block">
      <input
        type="checkbox"
        {name}
        value={item.value}
        bind:group={selected}
      />
      {item.name}
    </label>
  {/each}
  <input 
    type="text"
    value={selected.join(',')}
    style="overflow: visible; border: none; padding: 0; height: 1px; width: 1px; display: block; margin: auto;" {required} />
</div>