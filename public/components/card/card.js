customElements.define(
  "my-card",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["cardId", "title", "description"];
    }

    constructor() {
      super();
      let template = document.getElementById("my-card");
      let templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(templateContent.cloneNode(true));

      this.hideContent = true;
      const cardDiv = this.shadowRoot.getElementById("card");

      cardDiv.addEventListener("click", event => {
        if (event.target.id === "delete-card") {
          return;
        }

        const cardContent = this.shadowRoot.getElementById("card-content");
        if (!this.hideContent) {
          cardContent.style.display = "none";
        } else {
          cardContent.style.display = "unset";
        }
        this.hideContent = !this.hideContent;
      });

      const deleteCardBtn = this.shadowRoot.getElementById("delete-card");
      deleteCardBtn.addEventListener("click", event => {
        const confirmDelete = confirm("Are you sure?");
        if (confirmDelete) {
          this.deleteCard(this.getAttribute("cardId"));
        }
      });
    }

    deleteCard(cardId) {
      fetch(`http://localhost:3000/cards/${cardId}`, {
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
        let cardTitleElem = this.shadowRoot.getElementById("card-title");
        cardTitleElem.textContent = newValue;
      } else if (name === "description") {
        let cardContentElem = this.shadowRoot.getElementById("card-content");
        cardContentElem.textContent = newValue;
      }
    }
  }
);
