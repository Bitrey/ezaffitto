import React, { FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
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

  const { t } = useTranslation();

  return (
    // <div className="transition-colors"
    <Select
      value={val}
      onChange={onChangeFn}
      {...rest}
      classNames={{
        tagItem: () => "flex items-center gap-2 bg-gray-50 p-1 px-2 rounded"
      }}
    />
  );
};

export default CustomSelect;
