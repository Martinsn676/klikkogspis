export const lsList = {
  /**
   * Load from local
   * @param {string} name The name of local
   */
  async get(name) {
    const data = localStorage.getItem(name);

    try {
      if (data) {
        const parsedData = JSON.parse(data);
        const currentTime = new Date().getTime();
        if (
          parsedData.timestamp &&
          parsedData.expiryTime &&
          currentTime - parsedData.timestamp > parsedData.expiryTime
        ) {
          localStorage.removeItem(name);
          console.warn(name + " has expired");
          return null; // Data is expired
        } else {
          const returnData = parsedData.items || parsedData;

          return returnData; // Data is still valid
        }
      }
    } catch (error) {
      console.warn(`Error parsing JSON data for ${name}:`, error);

      this.remove(name);

      return false;
    }
  },
  /**
   * Save to local using this name
   * @param {string} name The name of local
   * @param {any} items the element to stringify into local save
   * @param {number} max optional, deletes old save count above Max
   */
  async save(name, items, expiryTime = false) {
    if (window.self !== window.top) {
      return Promise.resolve();
    }

    try {
      let data;
      if (expiryTime) {
        data = {
          timestamp: new Date().getTime(),
          items: items,
          expiryTime: expiryTime * 60000,
        };
      } else {
        data = items;
      }
      localStorage.setItem(name, JSON.stringify(data));
    } catch (error) {
      // Check for Storage Quota Exceeded Error
      if (
        error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED"
      ) {
        try {
          // Clear previous storage for the given name
          localStorage.removeItem("apiSave");
          // Retry saving without error handling
          localStorage.setItem(name, JSON.stringify(items));
        } catch (retryError) {
          console.error("Error occurred while retrying save:", retryError);
        }
      } else {
        // Handle other types of errors without rethrowing
        console.error("Error occurred while saving:", error);
      }
    }
    return Promise.resolve();
  },

  // Example usage
  // await save('exampleName', [{key: 'value'}]);

  /**
   * Add an element with push
   * @param {string} name
   * @param {object} object
   * @returns
   */
  async push(name, object) {
    const list = (await this.get(name)) || [];
    await lsList.save(name, [...list, ...object]);
  },
  async pushIfNew(name, object) {
    const list = (await this.get(name)) || [];
    if (!list.find((e) => e == object)) {
      await lsList.save(name, [...list, object]);
    }
  },
  /**
   * Delete local with this name
   * @param {string} name The name of local
   */
  async remove(name) {
    console.info(`${name} removed from ls`);
    localStorage.removeItem(name);
  },
  /**
   * Deletes all local saves
   */
  async clearAll() {
    localStorage.clear();
  },
};
export const ssList = {
  /**
   * Load from session storage
   * @param {string} name The name of the session storage key
   */
  async get(name) {
    const data = sessionStorage.getItem(name);
    try {
      if (data) {
        const parsedData = JSON.parse(data);

        const currentTime = new Date().getTime();
        if (
          parsedData.timestamp &&
          parsedData.expiryTime &&
          currentTime - parsedData.timestamp > parsedData.expiryTime
        ) {
          sessionStorage.removeItem(name);
          console.warn(name + " has expired");
          return null; // Data is expired
        } else {
          const returnData = parsedData.items || parsedData;

          return returnData; // Data is still valid
        }
      }
    } catch (error) {
      // console.warn(`Error parsing JSON data for ${name}:`, error);

      this.remove(name);

      return false;
    }
  },
  /**
   * Save to local using this name
   * @param {string} name The name of local
   * @param {any} items the element to stringify into local save
   * @param {number} max optional, deletes old save count above Max
   */
  async save(name, items, expiryTime = false) {
    if (window.self !== window.top) {
      return Promise.resolve();
    }

    try {
      let data;
      if (expiryTime) {
        data = {
          timestamp: new Date().getTime(),
          items: items,
          expiryTime: expiryTime * 60000,
        };
      } else {
        data = items;
      }
      sessionStorage.setItem(name, JSON.stringify(data));
    } catch (error) {
      // Check for Storage Quota Exceeded Error
      if (
        error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED"
      ) {
        try {
          // Clear previous storage for the given name
          sessionStorage.removeItem("apiSave");
          // Retry saving without error handling
          sessionStorage.setItem(name, JSON.stringify(items));
        } catch (retryError) {
          console.error("Error occurred while retrying save:", retryError);
        }
      } else {
        // Handle other types of errors without rethrowing
        console.error("Error occurred while saving:", error);
      }
    }
    return Promise.resolve();
  },

  // Example usage
  // await save('exampleName', [{key: 'value'}]);

  /**
   * Add an element with push
   * @param {string} name The name of the session storage key
   * @param {object} object The object to add to the list in session storage
   * @returns {Promise<void>}
   */
  async push(name, object) {
    const list = (await this.get(name)) || [];
    ssList.save(name, [...list, object]);
  },
  /**
   * Delete session storage with this name
   * @param {string} name The name of the session storage key
   */
  async remove(name) {
    sessionStorage.removeItem(name);
  },
  /**
   * Deletes all session storage items
   */
  async clearAll() {
    sessionStorage.clear();
  },
};
