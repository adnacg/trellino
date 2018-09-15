customElements.define(
  "my-column",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["title", "columnId"];
    }

    constructor() {
      super();

      this.editing = false;
      this.currentTitleValue = "";
      this.cards = [];

      let template = document.getElementById("my-column");
      let templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML =
        '<link rel="stylesheet" href="components/column/column.css">';
      shadowRoot.appendChild(templateContent.cloneNode(true));

      const columnDivElem = shadowRoot.getElementById("column");
      columnDivElem.ondragenter = event => this.dragenter(event);
      columnDivElem.ondragover = event => this.dragover(event);
      columnDivElem.ondragleave = event => this.resetColumnColor(event);
      columnDivElem.ondragend = event => this.resetColumnColor(event);
      shadowRoot.getElementById("column-title-display").onclick = () =>
        this.toggleTitleEdit();
      shadowRoot.getElementById("column-title-display").onblur = () =>
        this.toggleTitleEdit();
      shadowRoot
        .getElementById("delete-column")
        .addEventListener("click", () => this.deleteColumn());
      shadowRoot.getElementById("column-title-edit").onsubmit = event =>
        this.editColumnTitle(event, this.getAttribute("columnId"));
      shadowRoot.getElementById("column-title-input").onchange = event =>
        this.updateTitleValue(event);
      shadowRoot.getElementById("add-card").onclick = () => this.addCard();
    }

    //-----------------------------
    // Lifecycle hooks
    //-----------------------------

    attributeChangedCallback(name, _, newValue) {
      if (name === "title") {
        this.shadowRoot.getElementById(
          "column-title-display"
        ).textContent = newValue;
        this.currentTitleValue = newValue;
      }
    }

    //-----------------------------
    // Event listener callbacks
    //-----------------------------

    addCard() {
      db.Card.fetchAll()
        .then(cards => {
          this.cards = cards;
          return db.Card.create({
            title: this.generateDefaultName(),
            description: "Your description here...",
            columnId: parseInt(this.getAttribute("columnId"))
          });
        })
        .then(newCard => {
          this.shadowRoot
            .getElementById("column-content")
            .appendChild(dom.createCardElem(newCard));
        })
        .catch(error => console.error("Something went wrong:", error));
    }

    toggleTitleEdit() {
      const titleDisplay = this.shadowRoot.getElementById(
        "column-title-display"
      );
      const titleEdit = this.shadowRoot.getElementById("column-title-edit");
      const titleInput = this.shadowRoot.getElementById("column-title-input");

      titleDisplay.style.display = this.editing ? "flex" : "none";
      titleEdit.style.display = this.editing ? "none" : "flex";
      titleInput.value = this.currentTitleValue;
      this.editing = !this.editing;
    }

    updateTitleValue(event) {
      this.currentTitleValue = event.target.value;
    }

    deleteColumn() {
      if (confirm("Delete the column?")) {
        db.Column.delete(this.getAttribute("columnId"))
          .then(() => {
            this.parentNode.removeChild(this);
          })
          .catch(error => console.error("Something went wrong:", error));
      }
    }

    editColumnTitle(event, columnId) {
      event.preventDefault();

      const newTitle = this.currentTitleValue;
      if (newTitle === this.getAttribute("title")) {
        this.toggleTitleEdit();
        return;
      }

      db.Column.fetchAll()
        .then(columns => {
          const titles = columns.map(column => column.title);
          if (titles.includes(newTitle)) {
            return Promise.reject("Name already taken");
          }
          return db.Column.editTitle(columnId, newTitle);
        })
        .then(() => {
          this.toggleTitleEdit();
          this.setAttribute("title", newTitle);
        })
        .catch(error => console.error("Something went wrong:", error));
    }

    dragenter(event) {
      event.preventDefault();
    }

    dragover(event) {
      event.preventDefault();
      event.currentTarget.style.background = "#c19489";
    }

    resetColumnColor(event) {
      event.preventDefault();
      event.currentTarget.style.background = "#c98474";
    }

    //-----------------------------
    // Utils
    //-----------------------------

    generateDefaultName() {
      const cardsTitles = this.cards.map(card => card.title);
      let newTitle = "New Card";

      let counter = 0;
      while (cardsTitles.includes(newTitle)) {
        counter++;
        newTitle = `New Card (${counter})`;
      }
      return newTitle;
    }
  }
);
