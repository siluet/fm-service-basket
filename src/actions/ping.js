module.exports = {
  moduleName: 'ping',

  register(registery) {
    registery.set('PING', {
      meta: [this.moduleName, 'ping'],
      func: this.ping,
    });
  },

  async ping() {
    const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    await sleep(2500);
    return { ping: 'pong' };
  },

};
