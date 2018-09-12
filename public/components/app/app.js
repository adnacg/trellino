customElements.define(
  "my-app",
  class extends HTMLElement {
    constructor() {
      super();
      let template = document.getElementById("my-app");
      let templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(templateContent.cloneNode(true));

      const addColumnBtn = this.shadowRoot.getElementById("add-column");
      addColumnBtn.onclick = () => {
        let columns;
        let cards;
        let newTitle;
        fetch("http://localhost:3000/columns")
          .then(response => response.json())
          .then(cols => {
            columns = cols;
            const columnTitles = cols.map(column => column.title);
            newTitle = "New Column";
            let counter = 0;
            while (columnTitles.indexOf(newTitle) > -1) {
              counter++;
              newTitle = `New Column (${counter})`;
            }
            return fetch("http://localhost:3000/columns", {
              method: "POST",
              headers: {
                "Content-Type": "application/json; charset=utf-8"
              },
              body: JSON.stringify({ title: newTitle })
            });
          })
          .then(response => {
            if (response.status === 201) {
              return response.json();
            }
          })
          .then(newColumn => {
            console.log(newColumn);
            columns.push({
              title: newColumn.title,
              id: newColumn.id
            });
            return fetch("http://localhost:3000/cards");
          })
          .then(response => response.json())
          .then(response => {
            cards = response;
            // Update the main div
            this.clearDashboard();
            this.buildDashboard(columns, cards);
          })
          .catch(error => {
            console.error(
              "Something went wrong while fetching data from DB:",
              error
            );
          });
      };
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

    clearDashboard() {
      const mainContainer = this.shadowRoot.getElementById("main-container");
      mainContainer.innerHTML = "";
    }

    buildDashboard(columns, cards) {
      console.log("Building dashboard for columns");
      columns.forEach(column => {
        const columnElem = document.createElement("my-column");
        columnElem.setAttribute("title", column.title);
        columnElem.setAttribute("columnId", column.id);
        const containerElem = this.shadowRoot.getElementById("main-container");
        containerElem.appendChild(columnElem);
        cards.filter(card => card.columnId === column.id).forEach(card => {
          const cardElem = document.createElement("my-card");
          cardElem.setAttribute("cardId", card.id);
          cardElem.setAttribute("title", card.title);
          cardElem.setAttribute("description", card.description);
          const columnContentElem = columnElem.shadowRoot.getElementById(
            "column-content"
          );
          columnContentElem.appendChild(cardElem);
        });
      });
    }
  }
);
