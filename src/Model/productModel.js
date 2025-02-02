class Product {
  constructor(name, price, description, image, category, quantity) {
    this.name = name;
    this.price = price;
    this.description = description || '';
    this.image = image || '';
    this.category = category || '';
    this.quantity = quantity;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static createProduct(productData) {
    return new Product(
      productData.name,
      productData.price,
      productData.description,
      productData.image,
      productData.category,
      productData.quantity
    );
  }
}

module.exports = Product;