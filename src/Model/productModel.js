class Product {
  constructor(name, price, description, image, category, quantity) {
    this.name = name;
    this.price = price;
    this.description = description;
    this.image = image;
    this.category = category;
    this.quantity = quantity;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static validate(productData) {
    const errors = [];

    if (!productData.name || productData.name.trim().length === 0) {
      errors.push('Nome do produto é obrigatório');
    }

    if (!productData.price || productData.price <= 0) {
      errors.push('Preço deve ser maior que zero');
    }

    if (!productData.quantity || productData.quantity < 0) {
      errors.push('Quantidade não pode ser negativa');
    }

    return errors;
  }

  static createProduct(productData) {
    const errors = this.validate(productData);
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return new Product(
      productData.name,
      productData.price,
      productData.description || '',
      productData.image || '',
      productData.category || '',
      productData.quantity
    );
  }

  toJSON() {
    return {
      name: this.name,
      price: this.price,
      description: this.description,
      image: this.image,
      category: this.category,
      quantity: this.quantity,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Product;