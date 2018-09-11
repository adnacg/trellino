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
    }

    updateTitleValue(event) {
      console.log(event);
      this.currentTitleValue = event.target.value;
    }

    editColumnTitle(event, columnId) {
      event.preventDefault();
      const newTitle = this.currentTitleValue;
      console.log(newTitle);

      fetch(`http://localhost:3000/columns`)
        .then(response => response.json())
        .then(columns => {
          const titles = columns.map(column => column.title);
          if (titles.indexOf(newTitle) > 1) {
            return;
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
          if (response.status === 200) {
            console.log(response);
            if (this.editing) {
              const titleDisplay = this.shadowRoot.getElementById(
                "column-title-display"
              );
              const titleEdit = this.shadowRoot.getElementById(
                "column-title-edit"
              );
              titleDisplay.style.display = "flex";
              titleEdit.style.display = "none";
              this.setAttribute("title", newTitle);

              this.editing = false;
            }
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
