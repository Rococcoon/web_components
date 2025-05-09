class CounterRoot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.count = 0;
  }

  connectedCallback() {
    this.render();
    this.hydrate();
  }

  hydrate() {
    this.shadowRoot
      .querySelector("counter-increment")
      .addEventListener("increment", this);

    this.shadowRoot
      .querySelector("counter-decrement")
      .addEventListener("decrement", this);
  }

  handleEvent(event) {
    switch (event.type) {
      case "increment":
        this.count++;
        break;
      case "decrement":
        this.count--;
        break;
    }
    this.update();
  }

  update() {
    this.shadowRoot
      .querySelector("count-total")
      .setAttribute("count", this.count);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <counter-decrement></counter-decrement>
      <count-total count="${this.count}"></count-total>
      <counter-increment></counter-increment>
    `;
  }
}

customElements.define("counter-component", CounterRoot);

class CountTotal extends HTMLElement {
  static observedAttributes = ["count"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "count") this.render();
  }

  hydate() {}

  render() {
    this.shadowRoot.innerHTML = `<span>${this.getAttribute("count")}</span>`;
  }
}

customElements.define("count-total", CountTotal);

class CounterIncrement extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.render();
    this.hydrate();
  }

  hydrate() {
    this.querySelector("button").addEventListener("click", () => {
      this.dispatchEvent(
        new Event("increment", { bubbles: true, composed: false }),
      );
    });
  }

  render() {
    this.innerHTML = `<button>+</button>`;
  }
}

customElements.define("counter-increment", CounterIncrement);

class CounterDecrement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.hydrate();
  }

  hydrate() {
    this.querySelector("button").addEventListener("click", () => {
      this.dispatchEvent(
        new Event("decrement", { bubbles: true, composed: false }),
      );
    });
  }

  render() {
    this.innerHTML = `<button>-</button>`;
  }
}

customElements.define("counter-decrement", CounterDecrement);
