customElements.define(
  "my-app",
  class extends HTMLElement {
    constructor() {
      super();
      let template = document.getElementById("my-app");
      let templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
      let columns;
      let cards;
      console.log("Fetching data from DB.");
      fetch("http://localhost:3000/columns")
        .then(response => response.json())
        .then(response => {
          columns = response;
          return fetch("http://localhost:3000/cards");
        })
        .then(response => response.json())
        .then(response => {
          cards = response;
          // Update the main div
          this.buildDashboard(columns, cards);
        })
        .catch(error => {
          console.error(
            "Something went wrong while fetching data from DB:",
            error
          );
        });
    }

    buildDashboard(columns, cards) {
      console.log("Building dashboard for columns");
      columns.forEach(column => {
        const columnElem = document.createElement("my-column");
        columnElem.setAttribute("title", column.title);
        const containerElem = this.shadowRoot.getElementById("main-container");
        containerElem.appendChild(columnElem);
        cards.filter(card => card.columnId === column.id).forEach(card => {
          const cardElem = document.createElement("my-card");
          cardElem.setAttribute("title", card.title);
          cardElem.setAttribute("description", card.description);
          const columnContentElem = columnElem.shadowRoot.getElementById(
            "column-content"
          );
          columnContentElem.appendChild(cardElem);
        });
      });
      console.log(this.shadowRoot);
    }
  }
);
