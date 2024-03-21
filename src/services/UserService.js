import Service from "./Service";

class UserService extends Service {
  constructor() {
    super('user');
  }

  async logout() {
    let response = await fetch(`${this.api}/logout`, {
      credentials: 'include',
    });
    let { status, message } = await response.json();

    return { status, message };
  }

  async login(data) {
    let response = await fetch(`${this.api}/login`, {
      method: 'POST',
      credentials: 'include',
      body: data,
    });
    let { status, message } = await response.json();

    return { status, message };
  }

  async me() {
    let response = await fetch(`${this.api}/me`, {
      credentials: 'include',
    });
    let { user } = await response.json();

    return user;
  }
}

export default UserService;