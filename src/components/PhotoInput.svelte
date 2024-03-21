<script>
    import { createEventDispatcher } from "svelte";
    export let processing
    export let photo = '';
    export let error;
  
    const choosePhoto = () => {
      document.getElementById("photo").click();
    };
  
    $: if(photo == '') {
      let photoElement = document.getElementById("photo");
      // @ts-ignore
      if (!photo && photoElement) photoElement.value = null;
      console.log("photo changed");
  
    };
  
    const dispatch = createEventDispatcher();
  </script>
  
  <div
    class="d-flex align-items-center justify-content-center position-relative w-100 rounded border text-center"
    class:border-danger={error}
    style="height: 195px;"
  >
    <input
      disabled={processing}
      on:change
      type="file"
      name="photo"
      id="photo"
      style="display:none;"
    />
    {#if photo}
      <!-- svelte-ignore a11y-img-redundant-alt -->
      <img src={photo} style="height: 100%;" alt="Clinic's Photo" />
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        on:click={() => dispatch("remove")}
        class="fs-5 py-1 px-2 border rounded photo-icon position-absolute"
      >
        <i class="bi bi-x"></i>
      </div>
    {:else}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        on:click={choosePhoto}
        class="fs-5 py-1 px-2 border rounded photo-icon position-absolute"
      >
        <i class="bi bi-camera-fill"></i>
      </div>
    {/if}
  </div>
  
  <style>
    .photo-icon {
      cursor: pointer;
      color: #555;
      background-color: #fff;
    }
    .photo-icon:hover {
      background-color: #eee;
      color: #000;
    }
  </style>
  