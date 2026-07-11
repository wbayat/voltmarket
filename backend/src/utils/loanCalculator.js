const roundCurrency = (amount) => {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export const calculateLoan = ({
    vehiclePrice,
    downPayment,
    annualInterestRate,
    loanTermMonths,
}) => {
    const principal = vehiclePrice - downPayment;

    if (principal === 0) {
        return {
            principal: 0,
            monthlyPayment: 0,
            totalPayment: 0,
            totalInterest: 0,
        };
    }

    const monthlyInterestRate = annualInterestRate / 12 / 100;

    let monthlyPayment;

    if (monthlyInterestRate === 0) {
        monthlyPayment = principal / loanTermMonths;
    } else {
        const compoundFactor = (1 + monthlyInterestRate) ** loanTermMonths;

        monthlyPayment = 
            (principal * monthlyInterestRate * compoundFactor) / (compoundFactor - 1);
    }

    const totalPayment = monthlyPayment * loanTermMonths;
    const totalInterest = totalPayment - principal;

    return {
        principal: roundCurrency(principal),
        monthlyPayment: roundCurrency(monthlyPayment),
        totalPayment: roundCurrency(totalPayment),
        totalInterest: roundCurrency(totalInterest),
    };
};