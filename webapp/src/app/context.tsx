import { createContext } from "react";
import { Option } from "react-tailwindcss-select/dist/components/type";

export const RentalTypeContext = createContext<{
    rentalType: Option[];
    setRentalType: (val: Option[]) => any;
}>({ rentalType: [], setRentalType: () => null });
