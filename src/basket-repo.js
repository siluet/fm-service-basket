const loki = require('lokijs');
const uuidv1 = require('uuid/v1');

const db = new loki('basket');
let products = db.addCollection('items', { products: ['userid'] });


class BasketProduct {
  constructor(userid, productid, count = 1) {
      this.id = uuidv1();
      this.userid = userid;
      this.productid = productid;
      this.count = count;
      this.createdAt = new Date().toISOString();
  }
  increaseCount(by = 1) {
    this.count += by;
  }
  decreaseCount(by = 1) {
    this.count -= by;
  }
}

function getUserProduct(userid, productid) {
  const existingProduct = products.findOne({ userid, productid });
  if (existingProduct && existingProduct instanceof BasketProduct) {
    return existingProduct;
  }
  return null;
}


module.exports = {
  getAll: (userid) => {
    const existingProducts = products.find({ userid });
    if (!existingProducts) {
      return null;
    }

    return existingProducts.map((p) => {
      const { meta, $loki, userid, createdAt, ...productData } = p;
      return productData;
    });
  },


  add: (userid, productid, by = 1) => {
    let basketProduct = getUserProduct(userid, productid);
    if (!basketProduct) {
      basketProduct = new BasketProduct(userid, productid, by);
      products.insert(basketProduct);
      return true;
    }
    
    basketProduct.increaseCount(by);
    products.update(basketProduct);
    return true;
  },

  remove: (userid, productid, by) => {
    let basketProduct = getUserProduct(userid, productid);
    if (!basketProduct) {
      return true;
    } 
    basketProduct.decreaseCount(by);

    if (basketProduct.count <= 0) {
      products.remove(basketProduct);
    }
    return true;
  },

};
