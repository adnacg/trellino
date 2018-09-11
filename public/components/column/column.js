customElements.define(
  "my-column",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["title"];
    }

    constructor() {
      super();
      let template = document.getElementById("my-column");
      let templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {}

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "title") {
        let columnTitleElem = this.shadowRoot.getElementById("column-title");
        columnTitleElem.textContent = newValue;
      }
    }
  }
);
