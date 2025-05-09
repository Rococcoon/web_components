// @ts-check

customElements.define(
  "toggle-theme",
  class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.observer = null;
    }

    /**
     * Lifecycle method called when the element is inserted into the dom
     *
     * @returns {void}
     */
    connectedCallback() {
      this.setSystemTheme();
      this.render();
      this.hydrate();
    }

    /**
     * Lifecycle method called when the element is removed from the DOM
     *
     * @returns {void}
     */
    disconnectedCallback() {
      if (this.shadowRoot !== null) {
        const sunIcon = this.shadowRoot.querySelector("icon-sun");
        if (sunIcon) {
          sunIcon.removeEventListener("clicked-sun", this);
        }
        const moonIcon = this.shadowRoot.querySelector("icon-moon");
        if (moonIcon) {
          moonIcon.removeEventListener("clicked-moon", this);
        }
      }
    }

    /**
     * Lifecycle method called after the element has rendered
     *
     * @returns {void}
     */
    hydrate() {
      this.addEventListeners();
    }

    /**
     * pass custom events to the eventHandler function
     *
     * @returns {void}
     */
    addEventListeners() {
      if (this.shadowRoot !== null) {
        const sunIcon = this.shadowRoot.querySelector("icon-sun");
        if (sunIcon) {
          sunIcon.addEventListener("clicked-sun", this);
        }
        const moonIcon = this.shadowRoot.querySelector("icon-moon");
        if (moonIcon) {
          moonIcon.addEventListener("clicked-moon", this);
        }
      }
    }

    /**
     * handles events for sun and moon icon clicks
     *
     * @param {CustomEvent} event - the event object, triggered on click of sun or moon icon
     * @returns {void}
     */
    handleEvent(event) {
      switch (event.type) {
        case "clicked-sun":
          this.handleIconClick(event);
          break;
        case "clicked-moon":
          this.handleIconClick(event);
          break;
      }
    }

    /**
     * Updates the data-theme attribute on the <html> element
     * Updates the data-active on the sun and moon icons
     *
     * @param {CustomEvent} event - the event object, triggered on click of sun or moon icon
     * @returns {void}
     */
    handleIconClick(event) {
      if (event.detail.id === "moon") {
        if (this.shadowRoot != null) {
          this.shadowRoot
            .querySelector("icon-moon")
            ?.setAttribute("data-active", "false");
          this.shadowRoot
            .querySelector("icon-sun")
            ?.setAttribute("data-active", "true");
          document.documentElement.setAttribute("data-theme", "dark");
        }
      }
      if (event.detail.id === "sun") {
        if (this.shadowRoot != null) {
          this.shadowRoot
            .querySelector("icon-moon")
            ?.setAttribute("data-active", "true");
          this.shadowRoot
            .querySelector("icon-sun")
            ?.setAttribute("data-active", "false");
          document.documentElement.setAttribute("data-theme", "light");
        }
      }
    }

    /**
     * Ensures that the <html> element has the data-theme attribute
     * if missing, sets it to default system setting (default 'light')
     *
     * @returns {void}
     */
    setSystemTheme() {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      if (currentTheme !== null) return;

      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)",
      ).matches;
      const systemTheme = prefersDark ? "dark" : "light";

      document.documentElement.setAttribute("data-theme", systemTheme);
    }

    /**
     * Determines if the icon should be visible based on the current data-theme
     *
     * @param {'sun' | 'moon'} icon - The icon type, either "sun" or "moon"
     * @returns {string} "true" if the icon should be visible, "false" otherwise
     */
    setIconVisibility(icon) {
      const dataTheme =
        document.documentElement.getAttribute("data-theme") || "light";
      if (icon === "sun") return dataTheme === "dark" ? "true" : "false";
      if (icon === "moon") return dataTheme === "light" ? "true" : "false";
      return "false";
    }

    /**
     * render the components inner html
     *
     * @returns {void}
     */
    render() {
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
        <icon-sun data-active=${this.setIconVisibility("sun")}></icon-sun>
        <icon-moon data-active=${this.setIconVisibility("moon")}></icon-moon>
        <style>
          :host {
            align-items: center;
            display: flex;
            height: 28px;
            justify-content: center;
            position: relative;
            width: 28px;
          }
          icon-moon,
          icon-sun {
            align-items: center;
            display: flex;
            height: 32px;
            justify-content: center;
            position: absolute;
            width: 32px;
          }

          .icon {
            grid-column: 1 / 1;
            grid-row: 1 / 1;
            height: 32px;
            position: absolute;
            transition: transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
            width: 32px;
          }

          /* Default state: hidden via scale(0) */
          .icon-sun,
          .icon-moon {
            transform: scale(0);
            opacity: 0;
            pointer-events: none;
            z-index: 0;
          }

          /* Active state */
          .icon-sun.active,
          .icon-moon.active {
            transform: scale(1) rotate(360deg);
            opacity: 1;
            pointer-events: auto;
            z-index: 1;
          }

          /* Delay moon to fade in later if both toggle at once */
          .icon-moon {
            transition-delay: 100ms;
          }
          .icon-sun {
            transition-delay: 0ms;
          }

          /* Optional fill color styling */
          .icon-sun svg path {
            fill: var(--warn);
          }
          .icon-moon svg path {
            fill: var(--success);
          }
        </sytle>
    `;
      }
    }
  },
);

/**
 * Custom element representing an icon with a sun design.
 * It includes functionality for event handling, attribute observation, and rendering the icon.
 */
customElements.define(
  "icon-sun",
  class extends HTMLElement {
    /**
     * Creates an instance of the icon-sun custom element.
     * Initializes the observer to monitor attribute changes.
     */
    constructor() {
      super();
      this.observer = null;
    }

    /**
     * Called when the element is added to the DOM.
     * It renders the icon and hydrates its state (finds and sets up event listeners and observers).
     */
    connectedCallback() {
      this.render();
      this.hydrate();
    }

    /**
     * Called when the element is removed from the DOM.
     * Disconnects the mutation observer if it exists.
     */
    disconnectedCallback() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }

    /**
     * Initializes the icon element, sets up event listeners, and starts observing attribute changes.
     *
     * @throws {Error} Throws an error if the icon element is not found.
     */
    hydrate() {
      /** @type {SVGElement | null} */
      this.icon = this.querySelector("#icon-sun");
      if (!this.icon) {
        throw new Error("icon-sun element not found");
      }
      this.addEventListeners();
      this.observeAttributes();
    }

    /**
     * Adds event listeners to the icon element, specifically for the "click" event.
     */
    addEventListeners() {
      if (this.icon != null) {
        this.icon.addEventListener("click", this.handleClick.bind(this));
      }
    }

    /**
     * Handles the click event on the component.
     * Prevents the default action and dispatches a custom event with the details.
     *
     * @param {MouseEvent} event - The click event object that is passed by the browser when the user clicks on the component.
     * @returns {void}
     */
    handleClick(event) {
      event.preventDefault();

      this.dispatchEvent(
        new CustomEvent("clicked-sun", {
          bubbles: true,
          composed: false,
          detail: { id: "sun" },
        }),
      );
    }

    /**
     * Observes changes to specific attributes of the custom element (e.g., `data-active`).
     * Adjusts the display of the icon based on these attribute changes.
     */
    observeAttributes() {
      this.observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "attributes") {
            const active = this.getAttribute("data-active");

            // Hide or show the icon based on the attribute
            if (active === "true") {
              if (!this.icon) {
                throw new Error("icon is not initialized");
              }
              this.icon.classList.add("active");
              this.icon.tabIndex = 0;
            } else {
              if (!this.icon) {
                throw new Error("icon is not initialized");
              }
              this.icon.classList.remove("active");
              this.icon.tabIndex = -1;
            }
          }
        }
      });

      // Observe changes to 'data-hidden' and 'data-active' attributes
      this.observer.observe(this, { attributes: true });
    }

    /**
     * Set the initial active class depending on the html element data-theme attribute
     */
    setDisplay() {
      const dataTheme =
        document.documentElement.getAttribute("data-theme") || "light";
      return dataTheme === "dark" ? "active" : "";
    }

    /**
     * Renders the SVG for the sun icon inside the custom element.
     * This method is called when the element is connected to the DOM.
     */
    render() {
      this.innerHTML = `
      <div id="icon-sun" class="icon icon-sun ${this.setDisplay()}">
        <svg height="32" width="32" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"></path>
        </svg>
      </div>
      <style>
      </style>
    `;
    }
  },
);

/**
 * Custom element representing an icon with a sun design.
 * It includes functionality for event handling, attribute observation, and rendering the icon.
 */
customElements.define(
  "icon-moon",
  class extends HTMLElement {
    /**
     * Creates an instance of the icon-moon custom element.
     * Initializes the observer to monitor attribute changes.
     */
    constructor() {
      super();
      this.observer = null;
    }

    /**
     * Called when the element is added to the DOM.
     * It renders the icon and hydrates its state (finds and sets up event listeners and observers).
     */
    connectedCallback() {
      this.render();
      this.hydrate();
    }

    /**
     * Called when the element is removed from the DOM.
     * Disconnects the mutation observer if it exists.
     */
    disconnectedCallback() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }

    /**
     * Initializes the icon element, sets up event listeners, and starts observing attribute changes.
     *
     * @throws {Error} Throws an error if the icon element is not found.
     */
    hydrate() {
      /** @type {HTMLElement | null} */
      this.icon = this.querySelector("#icon-moon");
      if (!this.icon) {
        throw new Error("icon-moon element not found");
      }
      this.addEventListeners();
      this.observeAttributes();
    }

    /**
     * Adds event listeners to the icon element, specifically for the "click" event.
     */
    addEventListeners() {
      if (this.icon != null) {
        this.icon.addEventListener("click", this.handleClick.bind(this));
      }
    }

    /**
     * Handles the click event on the component.
     * Prevents the default action and dispatches a custom event with the details.
     *
     * @param {MouseEvent} event - The click event object that is passed by the browser when the user clicks on the component.
     * @returns {void}
     */
    handleClick(event) {
      event.preventDefault();

      this.dispatchEvent(
        new CustomEvent("clicked-moon", {
          bubbles: true,
          composed: false,
          detail: { id: "moon" },
        }),
      );
    }

    /**
     * Observes changes to specific attributes of the custom element (e.g., `data-active`).
     * Adjusts the display of the icon based on these attribute changes.
     */
    observeAttributes() {
      this.observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "attributes") {
            const active = this.getAttribute("data-active");

            // Hide or show the icon based on the attribute
            if (active === "true") {
              if (!this.icon) {
                throw new Error("icon is not initialized");
              }
              this.icon.classList.add("active");
            } else {
              if (!this.icon) {
                throw new Error("icon is not initialized");
              }
              this.icon.classList.remove("active");
            }
          }
        }
      });

      // Observe changes to 'data-hidden' and 'data-active' attributes
      this.observer.observe(this, { attributes: true });
    }

    /**
     * Set the initial active class depending on the html element data-theme attribute
     */
    setDisplay() {
      const dataTheme =
        document.documentElement.getAttribute("data-theme") || "light";
      return dataTheme === "light" ? "active" : "";
    }

    /**
     * Renders the SVG for the moon icon inside the custom element.
     * This method is called when the element is connected to the DOM.
     */
    render() {
      this.innerHTML = `
      <div id="icon-moon" class="icon icon-moon ${this.setDisplay()}">
        <svg id="svg-moon" height="32" width="32" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path clip-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" fill-rule="evenodd"></path>
        </svg>
      </div>
      <style>
      </style>
    `;
    }
  },
);
