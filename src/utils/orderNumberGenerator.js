class OrderNumberGenerator {
  static generateOrderNumber() {
    // Generate 4 random letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let orderNumber = '';
    
    for (let i = 0; i < 4; i++) {
      orderNumber += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Generate 4 random numbers
    const numbers = Math.floor(1000 + Math.random() * 9000);
    
    return orderNumber + numbers;
  }
}

module.exports = OrderNumberGenerator;