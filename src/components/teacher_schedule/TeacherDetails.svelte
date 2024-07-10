<script>
  export let teacher;

  const getInitials = (name) => {
    let names = name.split(' ');
    let initials = [];

    for(let i=0; i<names.length; i++) {
      initials.push(names[i].charAt(0) + '.');
    }

    return initials.join('');
  }    
</script>

<table class="w-full text-xs">
  <tbody>
    <tr>
      <td class="px-1 w-1/3 leading-none">Name: </td>
      <td class="w-2/3 leading-none font-bold">
        {teacher.first_name.toUpperCase()}
        {getInitials(teacher.middle_name)}
        {teacher.last_name.toUpperCase()},
        {teacher.degree}
      </td>
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
