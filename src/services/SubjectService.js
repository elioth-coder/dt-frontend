import Service from "./Service";

class SubjectService extends Service {
  constructor() {
    super('subject');
  }

  async getPrograms() {
    let response = await fetch(`${this.api}/${this.table_name}/programs`, {
      credentials: 'include',
    });
    let { status, message, items } = await response.json();

    if (status == 'error') throw new Error(message);

    return items;
  }

  async getProgramSubjects(program) {
    let response = await fetch(`${this.api}/${this.table_name}/program_subjects/${program}`, {
      credentials: 'include',
    });
    let { status, message, items } = await response.json();

    if (status == 'error') throw new Error(message);

    return items;
  }

}

export default SubjectService;