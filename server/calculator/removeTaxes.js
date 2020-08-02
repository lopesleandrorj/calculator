const functions = {
    removeTaxes: (initialValue, tax) => {
        return initialValue * (1 - tax/100)
    }
} 

module.exports = functions