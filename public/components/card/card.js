customElements.define(
  "my-card",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["title", "description"];
    }

    constructor() {
      super();
      let template = document.getElementById("my-card");
      let templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(templateContent.cloneNode(true));
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
