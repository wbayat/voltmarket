import prisma from "../utils/prismaClient.js";
import { loanCalculatorSchema } from "../validators/loanCalculator.validator.js";
import { calculateLoan } from "../utils/loanCalculator.js";

export const getLoanCalculation = async (req, res) => {
    try {
        const result = loanCalculatorSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ message: "Invalid input", errors: result.error.issues });
        }

        const {
            vehicleId,
            downPayment,
            annualInterestRate,
            loanTermMonths,
        } = result.data;

        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });

        if (!vehicle || !vehicle.isActive) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        if (downPayment > vehicle.price) {
            return res.status(400).json({ 
                message: "Down payment cannot exceed vehicle price" 
            });
        }

        const calculation = calculateLoan({
            vehiclePrice: vehicle.price,
            downPayment,
            annualInterestRate,
            loanTermMonths,
        });

        return res.status(200).json({
            vehicle: {
                id: vehicle.id,
                brand: vehicle.brand,
                model: vehicle.model,
                year: vehicle.year,
            },
            vehiclePrice: vehicle.price,
            downPayment, 
            annualInterestRate,
            loanTermMonths,
            ...calculation,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({ message: "Something went wrong calculating the loan" });
    }
};