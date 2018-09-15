customElements.define(
  "my-app",
  class extends HTMLElement {
    constructor() {
      super();

      this.columns = [];
      this.cards = [];
      this.displayCards = [];
      this.draggedCard;

      let template = document.getElementById("my-app");
      let templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML =
        '<link rel="stylesheet" href="components/app/app.css">';
      shadowRoot.appendChild(templateContent.cloneNode(true));

      shadowRoot.getElementById("add-column").onclick = () => this.addColumn();
      shadowRoot.getElementById("search-input").oninput = event =>
        this.searchCards(event);
    }

    //-----------------------------
    // Lifecycle hooks
    //-----------------------------

    /**
     * Fetch cards and columns from DB and build the dashboard on component creation
     */
    connectedCallback() {
      db.Column.fetchAll()
        .then(columns => {
          this.columns = columns;
          return db.Card.fetchAll();
        })
        .then(cards => {
          this.cards = cards;
          this.displayCards = cards;
          this.buildDashboard();
        })
        .catch(error => console.error("Something went wrong:", error));
    }

    //-----------------------------
    // Event listener callbacks
    //-----------------------------

    addColumn() {
      db.Column.fetchAll()
        .then(columns => {
          this.columns = columns;
          return db.Column.create({ title: this.generateDefaultName() });
        })
        .then(newColumn => {
          const containerElem = this.shadowRoot.getElementById(
            "main-container"
          );
          containerElem.appendChild(this.buildColumn(newColumn));
        })
        .catch(error => {
          console.error("Something went wrong:", error);
        });
    }

    searchCards(event) {
      event.preventDefault();
      const keyword = event.target.value;
      const columnElems = this.shadowRoot.querySelectorAll("my-column");
      columnElems.forEach(columnElem => {
        const cardElems = columnElem.shadowRoot.querySelectorAll("my-card");
        cardElems.forEach(cardElem => {
          if (
            cardElem.title.toLowerCase().includes(keyword.toLowerCase()) ||
            cardElem.description.toLowerCase().includes(keyword.toLowerCase())
          ) {
            cardElem.style.display = "flex";
          } else {
            cardElem.style.display = "none";
          }
        });
      });
    }

    //-----------------------------
    // Utils
    //-----------------------------

    generateDefaultName() {
      const columnTitles = this.columns.map(column => column.title);
      let newTitle = "New Column";

      let counter = 0;
      while (columnTitles.includes(newTitle)) {
        counter++;
        newTitle = `New Column (${counter})`;
      }
      return newTitle;
    }

    clearDashboard() {
      this.shadowRoot.getElementById("main-container").innerHTML = "";
    }

    buildDashboard() {
      const containerElem = this.shadowRoot.getElementById("main-container");
      this.columns.forEach(column => {
        const columnElem = this.buildColumn(column);
        containerElem.appendChild(columnElem);
      });
    }

    buildColumn(column) {
      const columnElem = dom.createColumnElem(column);
      columnElem.id = `my-column-${column.id}`;
      columnElem.ondrop = event => this.drop(event);
      const columnContentElem = columnElem.shadowRoot.getElementById(
        "column-content"
      );

      this.displayCards
        .filter(card => card.columnId === column.id)
        .forEach(card => {
          const cardElem = dom.createCardElem(card);
          cardElem.ondragstart = event => this.storeCard(event);
          columnContentElem.appendChild(cardElem);
        });
      return columnElem;
    }

    storeCard(event) {
      this.draggedCard = event.currentTarget;
    }

    drop(event) {
      const targetColumn = event.currentTarget;
      const columnContentElem = targetColumn.shadowRoot.getElementById(
        "column-content"
      );

      const cardId = parseInt(this.draggedCard.getAttribute("cardId"));
      const columnId = parseInt(targetColumn.getAttribute("columnId"));
      db.Card.editColumnId(cardId, columnId)
        .then(() => columnContentElem.appendChild(this.draggedCard))
        .catch(error => console.error("Something went wrong:", error));
    }
  }
);
