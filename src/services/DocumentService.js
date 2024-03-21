import Service from "./Service";

class DocumentService extends Service {
  constructor() {
    super('document');
  }

  async getTrail(id) {
    let response = await fetch(`${this.api}/${this.table_name}/trail/${id}`, {
      credentials: 'include',
    });
    let { status, message, items } = await response.json();

    if (status == 'error') throw new Error(message);

    return items;
  }
}

export default DocumentService;