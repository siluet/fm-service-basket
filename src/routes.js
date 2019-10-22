const { warning } = require('./logger');

module.exports = {
  registry: null,

  /**
   * Initialize key-actions mapping
   *
   * @param {object[]} actions
   */
  init(actions) {
    // Expecting to get array of actions
    if (!actions || !Array.isArray(actions)) {
      return;
    }
    this.registry = new Map();
    actions.forEach((act) => {
      act.register(this.registry);
    });
  },

  callAction(key, request, preExecCallback = null) {
    if (!this.registry.has(key)) {
      warning(['routes', 'callAction'], `Unknown action key: ${key}`, request.id);
      return null;
    }

    // Get matching request
    const match = this.registry.get(key);

    // Add route meta to request obj
    request.route = match.meta;

    if (preExecCallback && typeof preExecCallback === 'function') {
      // call pre execution callback if defined
      preExecCallback({ key, request });
    }
    return match.func(request);
  },

};
