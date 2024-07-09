import Service from "./Service";

class ScheduleService extends Service {
  constructor() {
    super('schedule');
  }

  async getSections(semester_id) {
    let response = await fetch(`${this.api}/${this.table_name}/get_sections/?semester_id=${semester_id}`, {
        credentials: 'include',
    });
    let { status, message, items } = await response.json();

    if(status == 'error') throw new Error(message);

    return items;
  }
}

export default ScheduleService;