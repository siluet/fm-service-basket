const AppError = require('../app-error');
const basketRepo = require('../basket-repo');


module.exports = {
  moduleName: 'basket',

  register(registery) {
    registery.set('GET_ALL', {
      meta: [this.moduleName, 'getUserBasket'],
      func: this.getUserBasket,
    });
  },

  async getUserBasket(request) {
    const userId = request.params.uid;
    console.log(userId);

    try {
      return basketRepo.getAll(userId);
    } catch (err) {
      throw new AppError(`Unable to get basket data for userId ${userId}`, request);
    }
  },

};
