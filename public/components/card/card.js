customElements.define(
  "my-card",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["title", "description"];
    }

    constructor() {
      super();

      this.hideContent = true;
      this.currentTitle;
      this.description;

      let template = document.getElementById("my-card");
      let templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML =
        '<link rel="stylesheet" href="components/card/card.css">';
      shadowRoot.appendChild(templateContent.cloneNode(true));

      shadowRoot
        .getElementById("card")
        .addEventListener("click", event => this.toggleDescription(event));
      shadowRoot
        .getElementById("delete-card")
        .addEventListener("click", () => this.deleteCard());
      shadowRoot.getElementById("card-title-edit").onsubmit = event =>
        this.editTitle(event, this.getAttribute("cardId"));
      shadowRoot.getElementById("card-content-input").onblur = event =>
        this.editDescription(event, this.getAttribute("cardId"));
      shadowRoot.getElementById("card-title-input").onchange = event =>
        this.updateTitle(event);
      shadowRoot.getElementById("card-content-input").onchange = event =>
        this.updateDescription(event);
    }

    //-----------------------------
    // Lifecycle hooks
    //-----------------------------

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "title") {
        this.shadowRoot.getElementById("card-title-input").value = newValue;
        this.currentTitle = newValue;
      } else if (name === "description") {
        this.shadowRoot.getElementById("card-content-input").value = newValue;
        this.description = newValue;
      }
    }

    //-----------------------------
    // Event listener callbacks
    //-----------------------------

    toggleDescription(event) {
      if (
        ["delete-card", "card-title-input", "card-content-input"].includes(
          event.target.id
        )
      ) {
        return;
      }
      const cardContent = this.shadowRoot.getElementById("card-content-input");
      cardContent.style.display = this.hideContent ? "unset" : "none";
      this.hideContent = !this.hideContent;
    }

    updateTitle(event) {
      this.currentTitle = event.target.value;
    }

    updateDescription(event) {
      this.description = event.target.value;
    }

    deleteCard() {
      if (confirm("Are you sure?")) {
        db.Card.delete(this.getAttribute("cardId"))
          .then(() => this.parentNode.removeChild(this))
          .catch(error => console.error("Something went wrong:", error));
      }
    }

    editTitle(event, cardId) {
      event.preventDefault();

      const newTitle = this.currentTitle;
      const inputElem = event.currentTarget.querySelector("input");
      if (newTitle === this.getAttribute("title")) {
        inputElem.blur();
        return;
      }

      db.Card.fetchAll()
        .then(cards => {
          const titles = cards.map(card => card.title);
          if (titles.includes(newTitle)) {
            return Promise.reject("Name already taken");
          }
          return db.Card.editTitle(cardId, newTitle);
        })
        .then(() => {
          this.setAttribute("title", newTitle);
          inputElem.blur();
        })
        .catch(error => console.error("Something went wrong:", error));
    }

    editDescription(event, cardId) {
      const newDescription = this.description;
      const descriptionElem = event.currentTarget;
      if (newDescription === this.getAttribute("description")) {
        return;
      }

      db.Card.editDescription(cardId, newDescription)
        .then(() => {
          this.setAttribute("description", newDescription);
          descriptionElem.blur();
        })
        .catch(error => console.error("Something went wrong:", error));
    }
  }
);
