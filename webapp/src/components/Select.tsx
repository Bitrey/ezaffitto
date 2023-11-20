import { FunctionComponent, useState } from "react";
import Select from "react-tailwindcss-select";
import {
  Option,
  SelectProps,
  SelectValue
} from "react-tailwindcss-select/dist/components/type";

interface CustomSelectProps extends Omit<SelectProps, "value" | "onChange"> {
  defaultValues: Option[];
  onChange?: (o: Option[]) => any;
}

const CustomSelect: FunctionComponent<CustomSelectProps> = ({
  defaultValues,
  onChange,
  ...rest
}) => {
  const [val, setVal] = useState<Option[]>(defaultValues);

  function onChangeFn(e: SelectValue) {
    const vals = Array.isArray(e) ? e : e ? [e] : [];
    setVal(vals);

    onChange && onChange(vals);
  }

  return (
    // <div className="transition-colors"
    <Select
      value={val}
      onChange={onChangeFn}
      {...rest}
      classNames={{
        menuButton: val =>
          `flex text-sm text-gray-500 dark:text-white border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded shadow-sm transition-all duration-300 focus:outline-none ${
            val?.isDisabled
              ? "bg-gray-200"
              : "bg-white hover:border-gray-400 focus:border-red-500 dark:focus:border-gray-200 focus:ring focus:ring-red-500/20"
          }`,
        tagItem: val =>
          `dark:text-gray-100 flex items-center gap-2 p-1 px-2 rounded ${
            val?.isDisabled ? "bg-gray-200" : "bg-gray-50 dark:bg-gray-600"
          }`,
        tagItemText: "text-sm dark:text-white z-50",
        tagItemIconContainer:
          "flex items-center px-1 cursor-pointer rounded-r-sm hover:bg-red-200 dark:hover:bg-gray-500 dark:rounded hover:text-red-600 dark:hover:text-white transition-colors",
        menu: "absolute z-50 w-full bg-white dark:bg-gray-600 shadow-lg border dark:border-gray-500 rounded py-1 mt-1.5 text-sm text-gray-700",
        listItem: val =>
          `block transition z-50 duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${
            val?.isSelected
              ? `text-white bg-red-500 dark:bg-gray-600`
              : `text-gray-500 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-gray-500 hover:text-red-500 hover:dark:text-white`
          }`
      }}
    />
  );
};

export default CustomSelect;
