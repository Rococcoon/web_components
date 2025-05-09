customElements.define(
  "todo-component",
  class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.render();
      this.hydrate();
    }

    hydrate() {
      this.todoInput = this.shadowRoot.querySelector("todo-input");
      this.todoList = this.shadowRoot.querySelector("todo-list");
      this.todoCount = this.shadowRoot.querySelector("todo-count");
      this.todoItems = Array.from(this.todoList.querySelectorAll("todo-item"));

      this.addEventListeners();
    }

    addEventListeners() {
      this.todoInput.addEventListener("todo-input-submit", this);
    }

    handleEvent(event) {
      switch (event.type) {
        case "todo-input-submit":
          this.todoList.createListItem(event.detail.text, event.detail.id);
          this.appendTodoItem(event.detail.id);
          this.todoInput.update();
          this.todoCount.incrementCount();
          break;
        case "todo-item-delete":
          this.todoList.deleteListItem(event.detail.id);
          this.removeTodoItem(event.detail.id);
          this.todoCount.decrementCount();
      }
    }

    appendTodoItem(id) {
      const newItem = this.todoList.querySelector(`todo-item[id="${id}"]`);
      if (!newItem) return;

      newItem.addEventListener("todo-item-delete", this);

      this.todoItems.push(newItem);
    }

    removeTodoItem(id) {
      this.todoItems = this.todoItems.filter(
        (item) => item.getAttribute("id") !== id,
      );
    }

    render() {
      this.shadowRoot.innerHTML = `
      <todo-input></todo-input>
      <todo-list></todo-list>
      <todo-count></todo-count>
    `;
    }
  },
);

customElements.define(
  "todo-input",
  class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
      this.hydrate();
    }

    hydrate() {
      this.addEventListeners();
    }

    addEventListeners() {
      this.querySelector("form").addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const value = formData.get("todo")?.trim();
        const id = Date.now().toString();

        if (!value) return;

        this.dispatchEvent(
          new CustomEvent("todo-input-submit", {
            bubbles: true,
            composed: false,
            detail: { text: value, id: id },
          }),
        );
      });
    }

    update() {
      this.render();
      this.hydrate();
    }

    render() {
      this.innerHTML = `
      <form>
        <input type="text" name="todo" placeholder="What needs to be done?" />
        <button type="submit">Add</button>
      </form>
    `;
    }
  },
);

customElements.define(
  "todo-list",
  class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
      this.hydrate();
    }

    hydrate() {
      this.listUl = this.querySelector("#todo-list-ul");
    }

    createListItem(text, id) {
      const listItem = document.createElement("todo-item");
      listItem.setAttribute("text", text);
      listItem.setAttribute("id", id);
      this.listUl.appendChild(listItem);
    }

    deleteListItem(id) {
      const itemToRemove = this.querySelector(`todo-item[id="${id}"]`);
      if (!itemToRemove) return;

      itemToRemove.remove();
    }

    render() {
      this.innerHTML = `
      <ul id="todo-list-ul">
      </ul>
    `;
    }
  },
);

customElements.define(
  "todo-item",
  class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
      this.hydrate();
    }

    hydrate() {
      this.addEventListeners();
    }

    addEventListeners() {
      this.querySelector("button").addEventListener("click", (event) => {
        event.preventDefault();

        const id = this.getAttribute("id");

        this.dispatchEvent(
          new CustomEvent("todo-item-delete", {
            bubbles: true,
            composed: false,
            detail: { id },
          }),
        );
      });
    }

    render() {
      this.innerHTML = `
      <li name="todo" value="">
        ${this.getAttribute("text") || ""}
        <button type="button">delete</button>
      </li>
    `;
    }
  },
);

customElements.define(
  "todo-count",
  class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
      this.hydrate();
    }

    hydrate() {
      this.count = this.querySelector("div");
    }

    incrementCount() {
      this.count.textContent = parseInt(this.count.textContent, 10) + 1;
    }

    decrementCount() {
      this.count.textContent = parseInt(this.count.textContent, 10) - 1;
    }

    render() {
      this.innerHTML = `
      <div>0</div>
    `;
    }
  },
);
