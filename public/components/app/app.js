customElements.define(
  "my-app",
  class extends HTMLElement {
    constructor() {
      super();

      this.columns = [];
      this.cards = [];
      this.displayCards = [];
      this.searchKey = "";

      let template = document.getElementById("my-app");
      let templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML =
        '<link rel="stylesheet" href="components/app/app.css">';
      shadowRoot.appendChild(templateContent.cloneNode(true));

      shadowRoot.getElementById("add-column").onclick = () => this.addColumn();
      shadowRoot.getElementById("search-form").onsubmit = event =>
        this.searchCards(event);
      shadowRoot.getElementById("search-input").onchange = event =>
        this.updateSearchKey(event);
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
        .catch(error => {
          console.error("Something went wrong:", error);
        });
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

    updateSearchKey(event) {
      this.searchKey = event.target.value;
    }

    searchCards(event) {
      event.preventDefault();
      const keyword = this.searchKey;
      this.displayCards = this.cards.filter(
        card =>
          card.title.toLowerCase().includes(keyword.toLowerCase()) ||
          card.description.toLowerCase().includes(keyword.toLowerCase())
      );
      this.clearDashboard();
      this.buildDashboard();
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
      const columnContentElem = columnElem.shadowRoot.getElementById(
        "column-content"
      );
      this.displayCards
        .filter(card => card.columnId === column.id)
        .forEach(card => {
          const cardElem = dom.createCardElem(card);
          columnContentElem.appendChild(cardElem);
        });
      return columnElem;
    }
  }
);
