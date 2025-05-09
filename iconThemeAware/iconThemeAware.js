// @ts-check

customElements.define(
  "icon-theme-aware",
  class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      /** @type {MutationObserver | null} */
      this.observer = null;
    }

    /**
     * Lifecycle method called when the element is inserted into the dom
     *
     * @returns {void}
     */
    connectedCallback() {
      this.render();
      this.hydrate();
    }

    /**
     * Lifecycle method called when the element is removed from the DOM
     *
     * @returns {void}
     */
    disconnectedCallback() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }

    /**
     * Lifecycle method called after the element has rendered
     */
    async hydrate() {
      await this.initVariables();

      if (!this.cache) throw new Error("Cache was not initialized");
      if (!this.srcLight || !this.srcDark) {
        throw new Error("Missing icon source(s): srcLight or srcDark is null");
      }
      await this.initIcons(this.cache, this.srcLight, this.srcDark);
      if (this.iconLight === null) {
        this.iconLight = await this.fetchIcon(this.srcLight, this.cache);
      }
      if (this.iconDark === null) {
        this.iconDark = await this.fetchIcon(this.srcDark, this.cache);
      }
      if (
        typeof this.iconWidth !== "number" ||
        typeof this.iconHeight !== "number"
      ) {
        throw new Error(
          "iconWidth and iconHeight must be set before calling insertIcon",
        );
      }
      if (typeof this.currentTheme !== "string") {
        throw new Error("currentTheme must be set before calling insertIcon");
      }
      this.insertIcon(this.iconHeight, this.iconWidth, this.currentTheme);
      this.observeAttributes();
    }

    /**
     * Init Variables
     */
    async initVariables() {
      /** @type {string}**/
      this.currentTheme = this.getSystemTheme();
      /** @type {Blob | null}**/
      this.iconLight = null;
      /** @type {Blob | null}**/
      this.iconDark = null;
      /** @type {number} **/
      this.iconHeight = this.getDimensionAttribute(this, "data-height", 64);
      /** @type {number} **/
      this.iconWidth = this.getDimensionAttribute(this, "data-width", 64);
      /** @type {string | null} **/
      this.srcLight = this.getAttribute("data-src-light");
      /** @type {string | null} **/
      this.srcDark = this.getAttribute("data-src-dark");
      /** @type {string | null} **/
      this.name = this.getAttribute("data-name");
      /** @type {string | null} **/
      this.key = this.getAttribute("data-name");
      /** @type {Cache}**/
      this.cache = await this.initCache(this.name);
    }

    /**
     * Retrieves a numeric dimension attribute (e.g., width or height) from an element.
     * If the attribute is missing or not a valid number, a fallback value is returned.
     *
     * @param {Element} el - The HTML element to read the attribute from.
     * @param {string} attrName - The name of the data attribute (e.g., "data-width").
     * @param {number} fallback - The fallback value to use if the attribute is missing or invalid.
     * @returns {number} The parsed dimension value or the fallback.
     */
    getDimensionAttribute(el, attrName, fallback) {
      const attr = el.getAttribute(attrName);
      const value = attr !== null ? parseInt(attr, 10) : fallback;
      return isNaN(value) ? fallback : value;
    }

    /**
     * Init the cache
     *
     * @param {string | null} cacheName
     * @return {Promise<Cache>}
     */
    initCache = async (cacheName) => {
      return await caches.open(`${cacheName}`);
    };

    /**
     * Get blob item(icon) from the cache
     *
     * @param {Cache} cachePromise
     * @param {string | null} key
     * @return {Promise<Blob | null>}
     */
    getCacheItem = async (cachePromise, key) => {
      const cache = cachePromise;
      if (!cache) {
        return null;
      }

      if (key === null) {
        return null;
      }
      const response = await cache.match(key);
      if (!response) {
        return null;
      }

      return await response.blob();
    };

    setCacheItem = async () => {};

    /**
     * Initializes the icons to the cached icon or null
     *
     * @param {Cache} cache
     * @param {string | null} srcLight
     * @param {string | null} srcDark
     */
    initIcons = async (cache, srcLight, srcDark) => {
      this.iconLight = await this.getIcon(cache, srcLight);
      this.iconDark = await this.getIcon(cache, srcDark);
    };

    /**
     * Gets the icons for the component, first checks local storage, will then
     * fetch based on data-src* attributes. Will then save to local storage.
     * Assigns the raw data to an icon variable as a Blob type.
     *
     * @param {Cache} cache
     * @param {string | null} iconSrc
     * @returns {Promise<Blob | null>}
     */
    async getIcon(cache, iconSrc) {
      const iconCache = this.getCacheItem(cache, iconSrc);
      return iconCache;
    }

    /**
     * Fetch Icon from the server
     *
     * @param {string | null} iconSrc
     * @param {Cache} cache
     * @returns {Promise<Blob | null>}
     */
    fetchIcon = async (iconSrc, cache) => {
      console.log(iconSrc);
      if (!iconSrc || !cache) {
        console.warn("Icon source or cache not available");
        return null;
      }

      try {
        const response = await fetch(iconSrc, { cache: "no-cache" });
        if (!response.ok) {
          throw new Error(`Failed to fetch icon: ${response.statusText}`);
        }

        // Clone the response for caching
        const responseClone = response.clone();
        await cache.put(iconSrc, responseClone);

        // Return blob from the original response
        return await response.blob();
      } catch (error) {
        console.error("Error fetching icon:", error);
        return null;
      }
    };

    /**
     * Inserts both icons (light and dark) into the container unconditionally
     *
     * @param {number} height
     * @param {number} width
     * @param {string} theme
     * @returns {void}
     */
    insertIcon(height, width, theme) {
      if (!this.shadowRoot) return;

      const container = this.shadowRoot.getElementById("icon-container");
      if (!container) return;

      container.innerHTML = "";

      if (theme === "light") {
        if (this.iconLight instanceof Blob) {
          if (
            typeof this.iconWidth !== "number" ||
            typeof this.iconHeight !== "number"
          ) {
            throw new Error(
              "iconWidth and iconHeight must be set before calling insertIcon",
            );
          }
          const lightImg = document.createElement("img");
          const lightUrl = URL.createObjectURL(this.iconLight);
          lightImg.onload = () => URL.revokeObjectURL(lightUrl);
          lightImg.width = width;
          lightImg.height = height;
          lightImg.src = lightUrl;
          lightImg.alt = "Light Icon";
          lightImg.classList.add("fade-in");
          container.appendChild(lightImg);
          requestAnimationFrame(() => {
            lightImg.classList.add("show");
          });
        }
      }

      if (theme === "dark") {
        if (this.iconDark instanceof Blob) {
          if (
            typeof this.iconWidth !== "number" ||
            typeof this.iconHeight !== "number"
          ) {
            throw new Error(
              "iconWidth and iconHeight must be set before calling insertIcon",
            );
          }
          const darkImg = document.createElement("img");
          const darkUrl = URL.createObjectURL(this.iconDark);
          darkImg.onload = () => URL.revokeObjectURL(darkUrl);
          darkImg.width = this.iconWidth;
          darkImg.height = this.iconHeight;
          darkImg.src = darkUrl;
          darkImg.alt = "Dark Icon";
          darkImg.classList.add("fade-in");
          container.appendChild(darkImg);
          requestAnimationFrame(() => {
            darkImg.classList.add("show");
          });
        }
      }
    }

    /**
     * Ensures that the <html> element has the data-theme attribute.
     * If missing, it sets it based on the user's system preference.
     * Defaults to "light" if no preference is detected.
     *
     * @returns {string} The current theme, either "light" or "dark"
     */
    getSystemTheme() {
      /** @type {string | null}**/
      let theme = document.documentElement.getAttribute("data-theme");

      if (theme === null) {
        /** @type {boolean}**/
        const prefersDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;

        /** @type {string}**/
        theme = prefersDark ? "dark" : "light";

        document.documentElement.setAttribute("data-theme", theme);
      }

      return theme;
    }

    /**
     * Observes changes to specific attributes of the custom element (e.g., `data-active`).
     * Adjusts which icon to display based on these attribute changes.
     */
    observeAttributes() {
      this.observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "attributes") {
            /** @type {string | null}**/
            const theme = document.documentElement.getAttribute("data-theme");
            if (this.currentTheme !== undefined && theme !== null) {
              this.currentTheme = theme;
            }

            // Hide or show the icon based on the attribute
            if (theme === "light") {
              if (
                this.iconHeight !== undefined &&
                this.iconWidth !== undefined &&
                this.currentTheme !== undefined
              ) {
                this.insertIcon(
                  this.iconHeight,
                  this.iconWidth,
                  this.currentTheme,
                );
              }
            } else if (theme === "dark") {
              if (
                this.iconHeight !== undefined &&
                this.iconWidth !== undefined &&
                this.currentTheme !== undefined
              ) {
                this.insertIcon(
                  this.iconHeight,
                  this.iconWidth,
                  this.currentTheme,
                );
              }
            }
          }
        }
      });

      // Observe changes to 'data-hidden' and 'data-active' attributes
      this.observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    }

    /**
     * render the components inner html
     *
     * @returns {void}
     */
    render() {
      /** @type {number} **/
      const height = this.getDimensionAttribute(this, "data-height", 64);
      /** @type {number} **/
      const width = this.getDimensionAttribute(this, "data-width", 64);

      if (this.shadowRoot != null) {
        this.shadowRoot.innerHTML = `
          <style>
            .icon-container {
              height: ${height}px;
              width: ${width}px;
            }

            .fade-in {
              opacity: 0;
              transition: opacity 0.6s ease-in-out;
            }

            .fade-in.show {
              opacity: 1;
            }
          </style>
          <div id="icon-container" class="icon-container"></div>
        `;
      }
    }
  },
);
