class Service {
    constructor(table_name, api=CONFIG.API_URL) {
        this.api        = api;
        this.table_name = table_name;
    }

    async update(data) {
        let response = await fetch(`${this.api}/${this.table_name}/update`, {
            method: 'POST',
            body: data,
            credentials: 'include',
        });
        let { status, message, item } = await response.json();

        if(status == 'error') throw new Error(message);

        return item;
    }

    async add(data) {
        let response = await fetch(`${this.api}/${this.table_name}/add`, {
            method: 'POST',
            body: data,
            credentials: 'include',
        });
        let { status, message, item } = await response.json();

        if(status == 'error') throw new Error(message);

        return item;
    }

    async getAll() {
        let response = await fetch(`${this.api}/${this.table_name}/`, {
            credentials: 'include',
        });
        let { status, message, items } = await response.json();

        if(status == 'error') throw new Error(message);

        return items;
    }

    async getByForm(data) {
        let response = await fetch(`${this.api}/${this.table_name}/get_by_form`, {
            method: 'POST',
            body: data,
            credentials: 'include',
        });
        let { status, message, items } = await response.json();

        if(status == 'error') throw new Error(message);

        return items;
    }

    async getValue(data, column) {
        let response = await fetch(`${this.api}/${this.table_name}/get_value/?column=${column}`, {
            method: 'POST',
            body: data,
            credentials: 'include',
        });
        let { status, message, value } = await response.json();

        if(status == 'error') throw new Error(message);

        return value;
    }

    async get(id) {
        let response = await fetch(`${this.api}/${this.table_name}/${id}`, {
            credentials: 'include',
        });
        let { status, message, item } = await response.json();

        if(status == 'error') throw new Error(message);

        return item;
    }

    async delete(id) {
        let response = await fetch(`${this.api}/${this.table_name}/delete/${id}`, {
            credentials: 'include',
        });
        let { status, message } = await response.json();

        if(status == 'error') throw new Error(message);
    }

    async deleteWhere(column, value) {
        let response = await fetch(`${this.api}/${this.table_name}/delete_where/?column=${column}&value=${value}`, {
            credentials: 'include',
        });
        let { status, message, items } = await response.json();

        if(status == 'error') throw new Error(message);
    }

    async deleteByForm(data) {
        let response = await fetch(`${this.api}/${this.table_name}/delete_by_form`, {
            method: 'POST',
            body: data,
            credentials: 'include',
        });
        let { status, message } = await response.json();

        if(status == 'error') throw new Error(message);
    }

    async search(column, query) {
        let response = await fetch(`${this.api}/${this.table_name}/search/?column=${column}&query=${query}`, {
            credentials: 'include',
        });
        let { status, message, items } = await response.json();

        if(status == 'error') throw new Error(message);

        return items;
    }

    async getWhere(column, value) {
        let response = await fetch(`${this.api}/${this.table_name}/get_where/?column=${column}&value=${value}`, {
            credentials: 'include',
        });
        let { status, message, items } = await response.json();

        if(status == 'error') throw new Error(message);

        return items;
    }

    async count() {
        let response = await fetch(`${this.api}/${this.table_name}/count`, {
            credentials: 'include',
        });
        let { status, message, count } = await response.json();

        if(status == 'error') throw new Error(message);

        return count;
    }
}

export default Service;