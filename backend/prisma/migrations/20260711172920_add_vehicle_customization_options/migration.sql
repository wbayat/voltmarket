-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "selectedColor" TEXT,
ADD COLUMN     "selectedInteriorColor" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "selectedColor" TEXT,
ADD COLUMN     "selectedInteriorColor" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "availableColors" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "availableInteriorColors" TEXT[] DEFAULT ARRAY[]::TEXT[];
