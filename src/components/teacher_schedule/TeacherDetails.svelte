<script>
    export let teacher;
</script>

<table class="w-full text-xs">
  <tbody>
    <tr>
      <td class="px-1 w-1/3 leading-none">Name: </td>
      <td class="w-2/3 leading-none font-bold">{teacher.name.toUpperCase()}</td>
    </tr>
    <tr>
      <td class="px-1 w-1/3 leading-none">Employment Status: </td>
      <td class="w-2/3 leading-none">{teacher.employment_status}</td>
    </tr>
    <tr>
      <td class="px-1 w-1/3 leading-none">Field of Specialization: </td>
      <td class="w-2/3 leading-none">{teacher.field_specialization}</td>
    </tr>
  </tbody>
</table>
