const generateFinalPrice = async (originalPrice, discount) => {

    const finalPrice = originalPrice - (originalPrice * discount) / 100

    return finalPrice
}

module.exports = { generateFinalPrice }