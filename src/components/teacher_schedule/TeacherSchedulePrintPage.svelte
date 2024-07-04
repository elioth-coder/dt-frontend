<script>
  import { onDestroy, onMount } from "svelte";
  export let params = {};
  let { teacher_id, semester_id } = params;
  
  const assets_url = CONFIG.ASSETS_URL;
  let report;
  let printed = false;

  $: if (report?.length)
    (() => {
      if (!printed) {
        setTimeout(() => {
          window.print();
          window.close();
        }, 2000);
        printed = true;
      }
    })();

  onMount(async () => {

  });

  onDestroy(() => {

  });
</script>

<div id="header">
  <img src={`${assets_url}/assets/img/header.png`} alt="Header" />
</div>
<div id="content">
  <table>
    <thead>
      <tr>
        <td>
          <div class="header-placeholder"></div>
        </td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <!-- Contents to print goes here. -->
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td>
          <div class="footer-placeholder"></div>
        </td>
      </tr>
    </tfoot>
  </table>
</div>
<div id="footer">
  <img src={`${assets_url}/assets/img/footer.png`} alt="Footer" />
</div>

<style>
  @media print {
    @page {
      size: A4;
      margin: 0;
    }

    #header {
      top: 0;
    }

    #footer {
      bottom: 0;
    }

    #header,
    #footer {
      left: 0;
      right: 0;
      position: fixed;
    }

    #header img,
    #footer img {
      width: 100%;
    }

    .header-placeholder {
      height: 1.65in;
    }

    .footer-placeholder {
      height: 0.85in;
    }
  }
</style>
