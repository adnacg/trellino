const db = {
  Card: {
    fetchAll: () =>
      fetch("http://localhost:3000/cards").then(response => response.json()),
    create: data =>
      fetch("http://localhost:3000/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(data)
      }).then(response => {
        if (response.status === 201) {
          return response.json();
        }
      }),
    delete: id =>
      fetch(`http://localhost:3000/cards/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }).then(response => {
        if (response.status === 200) {
          return response.json();
        } else {
          return Promise.reject("Failed to delete card from DB");
        }
      }),
    editTitle: (id, title) =>
      fetch(`http://localhost:3000/cards/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({ title })
      }).then(({ status }) => {
        if (status === 200) {
          return Promise.resolve(true);
        } else {
          return Promise.reject("Failed to edit card title in DB");
        }
      }),
    editDescription: (id, description) =>
      fetch(`http://localhost:3000/cards/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({ description })
      }).then(({ status }) => {
        if (status === 200) {
          return Promise.resolve(true);
        } else {
          return Promise.reject("Failed to edit card title in DB");
        }
      })
  },
  Column: {
    fetchAll: () =>
      fetch("http://localhost:3000/columns").then(response => response.json()),
    create: data =>
      fetch("http://localhost:3000/columns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(data)
      }).then(response => {
        if (response.status === 201) {
          return response.json();
        } else {
          return Promise.reject("Failed to add column to DB");
        }
      }),
    delete: id =>
      fetch(`http://localhost:3000/columns/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }).then(({ status }) => {
        if (status === 200) {
          return Promise.resolve(true);
        } else {
          return Promise.reject(`Failed to delete column ${id} from DB`);
        }
      }),
    editTitle: (id, title) =>
      fetch(`http://localhost:3000/columns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({ title })
      }).then(({ status }) => {
        if (status === 200) {
          return Promise.resolve(true);
        } else {
          return Promise.reject("Failed to edit column title in DB");
        }
      })
  }
};
