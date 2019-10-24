const AppError = require('../app-error');
const basketRepo = require('../basket-repo');


module.exports = {
  moduleName: 'basket',

  register(registery) {
    registery.set('GET_BY_USERID', {
      meta: [this.moduleName, 'getUserBasket'],
      func: this.getUserBasket,
    });
    registery.set('ADD', {
      meta: [this.moduleName, 'addToUserBasket'],
      func: this.addToUserBasket,
    });
    registery.set('DELETE', {
      meta: [this.moduleName, 'deleteFromUserBasket'],
      func: this.deleteFromUserBasket,
    });
  },

  async getUserBasket(request) {
    const userId = request.params.uid;

    try {
      return basketRepo.getAll(userId);
    } catch (err) {
      throw new AppError(`Unable to get basket data for userId ${userId}`, request);
    }
  },

  async addToUserBasket(request) {
    // Extract required params from request obj.
    const { uid: userId, pid: productId } = request.params;

    /** @TODO: Connect to product & stock services to validate the product and availability of the product */

    try {
      return basketRepo.add(userId, productId);
    } catch (err) {
      throw new AppError(`Unable to add product #${productId} to user #${userId} basket.`, request);
    }
  },

  async deleteFromUserBasket(request) {
    // Extract required params from request obj.
    const { uid: userId, pid: productId } = request.params;
    try {
      return basketRepo.delete(userId, productId);
    } catch (err) {
      throw new AppError(`Unable to remove product #${productId} from user #${userId} basket.`, request);
    }
  },

};
