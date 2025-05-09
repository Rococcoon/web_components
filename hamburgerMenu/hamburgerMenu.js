class HamburgerMenu extends HTMLElement {
  constructor() {
    super();
    this.rendered = false;
  }

  connectedCallback() {
    this.render();
    this.hydrate();
  }

  disconnectedCallback() {
    if (this.hmIcon) {
      this.hmIcon.removeEventListener("click", this.handleIconClick);
    }

    if (this.hmNavLinks) {
      this.hmNavLinks.forEach((link) => {
        link.removeEventListener("click", () => {
          this.toggleAttribute();
        });
      });
    }
  }

  hydrate() {
    this.hmNav = this.querySelector("#hm-nav");
    this.attachEventListener();
    this.setMenuState();
  }

  attachEventListener() {
    this.hmIcon = this.querySelector("#hm-icon");
    if (this.hmIcon) {
      this.hmIcon.addEventListener("click", () => {
        this.toggleAttribute();
      });
    }

    this.hmNavLinks = this.querySelectorAll("#hm-nav-link");
    this.hmNavLinks.forEach((link) => {
      link.addEventListener("click", () => {
        this.toggleAttribute();
      });
    });
  }

  setMenuState() {
    this.hmIcon.setAttribute("data-active", "false");
    this.hmNav.setAttribute("data-active", "false");
  }

  toggleAttribute() {
    const current = this.hmIcon.getAttribute("data-active") === "true";
    this.hmIcon.setAttribute("data-active", String(!current));
    this.hmNav.setAttribute("data-active", String(!current));
  }

  render() {
    if (this.rendered) return;
    this.rendered = true;

    this.innerHTML = `
      <hamburger-icon 
        data-active="false"
        id="hm-icon"
      ></hamburger-icon>
      <hamburger-nav 
        data-active="false"
        id="hm-nav"
      ></hamburger-nav>
      <style>
        hamburger-menu {
          align-items: center;
          box-sizing: border-box;
          display: flex;
          height: 50px;
          justify-content: center;
          margin: 0px;
          padding: 0px;
          position: relative;
          width: 50px;
        }
      </style>
    `;
  }
}

customElements.define("hamburger-menu", HamburgerMenu);

class HamburgerIcon extends HTMLElement {
  constructor() {
    super();
    this.attributeObserver = null;
  }

  connectedCallback() {
    this.render();
    this.hydrate();
  }

  disconnectedCallback() {
    if (this.attributeObserver) {
      this.attributeObserver.disconnect();
    }
  }

  hydrate() {
    this.hmIcon = this.querySelector("#hm-icon-container");
    this.observeAttributes();

    this.hmIcon.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.hmIcon.click();
      }
    });
  }

  observeAttributes() {
    this.attributeObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "attributes") {
          const active = this.getAttribute("data-active");
          if (active === "true") {
            this.hmIcon.classList.add("active");
          } else {
            this.hmIcon.classList.remove("active");
          }
        }
      }
    });

    this.attributeObserver.observe(this, { attributes: true });
  }

  render() {
    this.innerHTML = `
      <div class="hm-icon-container" id="hm-icon-container" tabindex="0">
        <span class="hm-icon-line"></span>
        <span class="hm-icon-line"></span>
        <span class="hm-icon-line"></span>
      </div>

      <style>
        hamburger-icon {
          left: 0;
          position: relative;
          top: 0; 
        }

        .hm-icon-container {
          align-items: center;
          background-color: var(--base);
          border: 3px solid var(--text);
          box-shadow: 6px 6px 0 var(--sub);
          color: var(--base);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 5px;
          height: 50px;
          justify-content: center;
          padding: var(--p-xs) var(--p-xs);
          position: relative;
          outline: 3px solid var(--base);
          transition:
            transform 0.2s ease-out,
            box-shadow 0.2s ease-out,
            outline 1s ease-out,
            position 1s ease-out,
            background-color 1s ease-out;
          width: 50px;
          z-index: 9999;
        }

        .hm-icon-container:hover {
          box-shadow: 10px 10px 0 var(--sub);
          transform: translate(-1px, -1px);
        }

        .hm-icon-container:active {
          background-color: var(--text);
          border-color: var(--text);
          box-shadow: 0px 0px 0 var(--sub);
          color: var(--text);
          transform: translate(1px, 1px);
        }

        .hm-icon-container.active {
          background-color: var(--main);
          border-color: var(--main);
          box-shadow: 0px 0px 0 var(--sub);
          color: var(--text);
          transform: translate(1px, 1px);
        }

        .hm-icon-line {
          background-color: var(--text);
          height: 4px;
          transition: transform 300ms ease, opacity 300ms ease;
          width: 100%;
        }

        .hm-icon-container.active .hm-icon-line:nth-child(1) {
          background-color: var(--base);
          transform: translateY(9px) rotate(45deg);
        }

        .hm-icon-container.active .hm-icon-line:nth-child(2) {
          opacity: 0;
        }

        .hm-icon-container.active .hm-icon-line:nth-child(3) {
          background-color: var(--base);
          transform: translateY(-9px) rotate(-45deg);
        }
      </style>
    `;
  }
}

customElements.define("hamburger-icon", HamburgerIcon);

class HamburgerNav extends HTMLElement {
  constructor() {
    super();
    this.attributeObserver = null;
    this.dataLinks = null;
  }

  connectedCallback() {
    this.render();
    this.hydrate();
  }

  disconnectedCallback() {
    if (this.attributeObserver) {
      this.attributeObserver.disconnect();
    }
  }

  hydrate() {
    this.hmNav = this.querySelector("#hm-nav");
    this.hmNavLinks = this.querySelectorAll("#hm-nav-link");
    this.hmNavSubLinks = this.querySelectorAll("#hm-nav-sub-link");
    this.observeAttributes();

    this.hmNavLinks.forEach((link) => {
      link.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          link.click();
        }
      });
    });
    console.log("htmx is:", htmx); // Make sure it's defined
    htmx.process(this);
  }

  observeAttributes() {
    this.attributeObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "attributes") {
          const active = this.getAttribute("data-active");
          if (active === "true") {
            this.hmNav.classList.add("active");
            this.hmNavLinks.forEach((link) => {
              link.tabIndex = 0;
            });
            this.hmNavSubLinks.forEach((link) => {
              link.classList.remove("open");
              link.tabIndex = 0;
            });
          } else {
            this.hmNav.classList.remove("active");
            this.hmNavLinks.forEach((link) => {
              link.tabIndex = -1;
            });
            this.hmNavSubLinks.forEach((link) => {
              link.classList.remove("open");
              link.tabIndex = -1;
            });
          }
        }
      }
    });

    this.attributeObserver.observe(this, { attributes: true });
  }

  createLinkItem(link) {
    const li = document.createElement("li");
    const a = document.createElement("a");

    if (Array.isArray(link.children) && link.children.length > 0) {
      a.textContent = link.name;
      a.classList = "link-parent";
      li.tabIndex = 0;
      const subUl = document.createElement("ul");
      subUl.classList = "hm-nav-sub-ul";

      link.children.forEach((child) => {
        const subLi = this.createSubLinkItem(child);
        subUl.appendChild(subLi);
      });
      li.appendChild(a);
      li.appendChild(subUl);

      li.addEventListener("click", (e) => {
        e.preventDefault();
        li.classList.toggle("open");
        subUl.classList.toggle("open");
      });

      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          li.click();
        }
      });
    } else {
      a.textContent = link.name;
      a.classList = "hm-nav-link";
      a.id = "hm-nav-link";
      a.tabIndex = 0;
      if (link.url) {
        a.setAttribute("hx-get", link.url);
        a.setAttribute("hx-push-url", link.url);
        a.setAttribute("hx-select", "#main-container");
        a.setAttribute("hx-swap", "outerHTML swap:0.3s");
        a.setAttribute("hx-target", "#main-container");
        a.setAttribute(
          "hx-on:click",
          "window.scrollTo({ top: 0, behavior: 'smooth' });",
        );
      }

      li.appendChild(a);
    }
    return li;
  }

  createSubLinkItem(child) {
    const a = document.createElement("a");
    a.textContent = child.name;
    a.classList = "hm-nav-sub-link";
    a.id = "hm-nav-link";
    a.tabIndex = 0;
    a.setAttribute("hx-get", child.url);
    a.setAttribute("hx-push-url", child.url);
    a.setAttribute("hx-select", "#main-container");
    a.setAttribute("hx-swap", "outerHTML swap:0.3s");
    a.setAttribute("hx-target", "#main-container");
    a.setAttribute(
      "hx-on:click",
      "window.scrollTo({ top: 0, behavior: 'smooth' });",
    );
    return a;
  }

  getDataLinks() {
    const raw = document
      .querySelector("hamburger-menu")
      .getAttribute("data-links");
    let links = [];

    try {
      links = JSON.parse(raw);
    } catch (e) {
      console.error("Invalid JSON in data-links:", e);
      return;
    }
    return links;
  }

  render() {
    this.dataLinks = this.getDataLinks();

    const nav = document.createElement("nav");
    nav.classList.add("hm-nav");

    const ul = document.createElement("ul");
    ul.classList = "hm-nav-ul";
    ul.id = "hm-nav";

    this.dataLinks.forEach((link) => {
      const li = this.createLinkItem(link);
      ul.appendChild(li);
    });

    nav.appendChild(ul);

    const style = document.createElement("style");
    this.innerHTML = `
      <style>
        hamburger-nav {
          left: 0;
          position: absolute;
          top: 0; 
        }

        .hm-nav nav, .hm-nav-ul, .hm-nav-li, .hm-nav-a {
          background: none;
          border: none;
          color: inherit;
          font: inherit;
          list-style: none;
          margin: 0;
          padding: 0;
          text-decoration: none;
        }

        .hm-nav-ul {
          align-items: center;
          background-color: var(--main);
          color: var(--base);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100vh;
          justify-content: center;
          left: 0;
          position: fixed;
          top: 0;
          width: 100vw;

          clip-path: circle(0% at 0% 0%);
          opacity: 0;
          pointer-events: none;
          transition: clip-path 0.6s ease-in-out, opacity 0.3s ease-in-out;
        }

        .hm-nav-ul.active {
          clip-path: circle(150% at 0% 0%);
          opacity: 1;
          pointer-events: auto;
          z-index: 9998;
        }

        .hm-nav li {
          text-align: center;
        }

        .hm-nav-link {
          color: inherit;
          display: inline-block;
          font-family: var(--font-title); 
          font-size: var(--text-3xl);
          letter-spacing: 0.2rem;
          position: relative;
          text-align: center;
          text-decoration: none;
          transition: color 0.3s ease;
          width: 150px;
        }

        .hm-nav a::after {
          background-color: currentColor;
          bottom: -2px;
          content: '';
          height: 2px;
          left: 0;
          position: absolute;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
          width: 100%;
        }

        .hm-nav a:hover::after, .hm-nav li:hover::after  {
          transform: scaleX(1);
        }

        .hm-nav-sub-ul {
          display: none;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 0;
          opacity: 0;
          transition: max-height 1.0s ease, opacity 0.3s ease;
        }

        .hm-nav-sub-ul.open {
          display: flex;
          max-height: 500px;
          opacity: 1;
        }

        .link-parent {
          color: inherit;
          display: inline-block;
          font-size: 1.5rem;
          position: relative;
          text-align: center;
          text-decoration: none;
          transition: color 0.3s ease;
          width: 150px;
        }

        .link-parent.open {
          width: 150px;
        }

        .hm-nav-sub-link {
          color: inherit;
          display: inline-block;
          font-size: 1.2rem;
          margin-left: 6rem;
          position: relative;
          text-align: left;
          text-decoration: none;
          transition: color 0.3s ease;
          width: 150px;
        }
    </style>
  `;
    this.appendChild(style);
    this.appendChild(nav);
  }
}

customElements.define("hamburger-nav", HamburgerNav);
