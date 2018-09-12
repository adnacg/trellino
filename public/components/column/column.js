customElements.define(
  "my-column",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["title", "columnId"];
    }

    constructor() {
      super();
      let template = document.getElementById("my-column");
      let templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(templateContent.cloneNode(true));

      const columnTitle = this.shadowRoot.getElementById(
        "column-title-display"
      );
      this.editing = false;
      this.currentTitleValue = "";
      columnTitle.addEventListener("click", () => {
        const titleDisplay = this.shadowRoot.getElementById(
          "column-title-display"
        );
        const titleEdit = this.shadowRoot.getElementById("column-title-edit");
        const titleInput = this.shadowRoot.getElementById("column-title-input");
        if (!this.editing) {
          titleDisplay.style.display = "none";
          titleEdit.style.display = "unset";

          titleInput.value = this.currentTitleValue;
          titleInput.onchange = event => this.updateTitleValue(event);

          titleEdit.onsubmit = event =>
            this.editColumnTitle(event, this.getAttribute("columnId"));
          this.editing = true;
        }
      });

      const deleteColumnBtn = this.shadowRoot.getElementById("delete-column");
      deleteColumnBtn.addEventListener("click", event => {
        const confirmDelete = confirm("Are you sure?");
        if (confirmDelete) {
          this.deleteColumn(event, this.getAttribute("columnId"));
        }
      });

      const addCardBtn = this.shadowRoot.getElementById("add-card");
      addCardBtn.onclick = () => {
        let cards;
        let cardTitle;
        let cardDescription;
        fetch("http://localhost:3000/cards")
          .then(response => response.json())
          .then(allCards => {
            cards = allCards;
            const cardTitles = allCards.map(card => card.title);
            cardTitle = "New Card";
            cardDescription = "Your description here...";
            let counter = 0;
            while (cardTitles.indexOf(cardTitle) > -1) {
              counter++;
              cardTitle = `New Column (${counter})`;
            }
            return fetch("http://localhost:3000/cards", {
              method: "POST",
              headers: {
                "Content-Type": "application/json; charset=utf-8"
              },
              body: JSON.stringify({
                title: cardTitle,
                description: cardDescription
              })
            });
          })
          .then(response => {
            if (response.status === 201) {
              return response.json();
            }
          })
          .then(newCard => {
            const cardElem = document.createElement("my-card");
            cardElem.setAttribute("cardId", newCard.id);
            cardElem.setAttribute("title", newCard.title);
            cardElem.setAttribute("description", newCard.description);
            const columnContentElem = this.shadowRoot.getElementById(
              "column-content"
            );
            columnContentElem.appendChild(cardElem);
          })
          .catch(error => {
            console.error(
              "Something went wrong when creating card in DB:",
              error
            );
          });
      };
    }

    updateTitleValue(event) {
      this.currentTitleValue = event.target.value;
    }

    editColumnTitle(event, columnId) {
      event.preventDefault();
      const newTitle = this.currentTitleValue;
      if (newTitle === this.getAttribute("title")) {
        this.editing = false;
        const titleDisplay = this.shadowRoot.getElementById(
          "column-title-display"
        );
        const titleEdit = this.shadowRoot.getElementById("column-title-edit");
        titleDisplay.style.display = "flex";
        titleEdit.style.display = "none";
        return;
      }
      fetch(`http://localhost:3000/columns`)
        .then(response => response.json())
        .then(columns => {
          const titles = columns.map(column => column.title);
          if (titles.indexOf(newTitle) > -1) {
            return Promise.reject("Name already taken");
          }
          return fetch(`http://localhost:3000/columns/${columnId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({ title: newTitle })
          });
        })
        .then(response => {
          if (response.status !== 200) {
            return Promise.reject("Failed to edit column title in DB");
          }
          const titleDisplay = this.shadowRoot.getElementById(
            "column-title-display"
          );
          const titleEdit = this.shadowRoot.getElementById("column-title-edit");
          titleDisplay.style.display = "flex";
          titleEdit.style.display = "none";
          this.setAttribute("title", newTitle);
          this.editing = false;
        })
        .catch(error => console.log(error));
    }

    deleteColumn(event, columnId) {
      fetch(`http://localhost:3000/columns/${columnId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }).then(response => {
        if (response.status === 200) {
          this.parentNode.removeChild(this);
        }
      });
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "title") {
        let columnTitleElem = this.shadowRoot.getElementById(
          "column-title-display"
        );
        columnTitleElem.textContent = newValue;
        this.currentTitleValue = newValue;
      }
    }
  }
);
