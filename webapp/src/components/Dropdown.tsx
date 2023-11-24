import { FC, HTMLAttributes, useState, useRef, useEffect } from "react";
import Button from "./Button";
import UpChevron from "../icons/UpChevron";
import { useTranslation } from "react-i18next";

export interface DropdownOption<T = string> {
  key: T;
  value: string | JSX.Element;
}

interface DropdownProps<T = string> extends HTMLAttributes<HTMLDivElement> {
  options: DropdownOption<T>[];
  defaultOption?: DropdownOption<T>;
  enabledOptions?: DropdownOption<T>[];
  itemsClassName?: string;
  columns?: boolean;
  onSelectCustom: (option: DropdownOption<T>) => void;
}

export const Dropdown: FC<DropdownProps> = ({
  options,
  defaultOption,
  onSelectCustom,
  enabledOptions,
  itemsClassName,
  columns,
  ...rest
}) => {
  // Lo stato che indica se il menu è aperto o chiuso
  const [isOpen, setIsOpen] = useState(false);

  // Il riferimento al div che contiene il menu
  const menuRef = useRef<HTMLDivElement>(null);

  // La funzione che chiude il menu quando si clicca al di fuori
  function handleClickOutside(event: MouseEvent) {
    if (
      isOpen &&
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }

  // Aggiunge e rimuove l'event listener quando il menu si apre o si chiude
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const { t } = useTranslation();

  const [selected, setSelected] = useState<DropdownOption | undefined>(
    defaultOption || options[0]
  );

  const enabledKeys = enabledOptions?.map(e => e.key) || null;

  return (
    <div ref={menuRef} {...rest} className="relative">
      <Button
        className="flex items-center gap-1 font-medium rounded-xl px-3 py-2"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {selected?.value || t("dropdown.noOptions")}
        <UpChevron
          className={`scale-75 fill-white transition-transform ${
            isOpen ? "" : "rotate-180"
          }`}
        />
      </Button>
      {isOpen && (
        <div
          className={`z-50 absolute top-full left-0 mt-2 ${
            columns ? "w-64" : "w-48"
          } bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl p-4 shadow-lg transform transition-all duration-300 ease-in-out scale-x-100 origin-left`}
        >
          <div className="absolute top-0 left-0 -mt-2 w-0 h-0 border-b-8 border-r-8 border-gray-50 dark:border-gray-700"></div>
          <div
            className={columns ? "grid grid-cols-1 md:grid-cols-2 gap-x-4" : ""}
          >
            {options.map((option, index) => (
              <div
                key={index}
                className={`py-2 px-4 w-fit ${
                  enabledKeys && enabledKeys.includes(option.key)
                    ? "hover:bg-gray-100 dark:hover:bg-gray-600"
                    : "opacity-50 cursor-not-allowed"
                } cursor-pointer ${itemsClassName || ""}`}
                onClick={() => {
                  setIsOpen(false);
                  if (enabledKeys && !enabledKeys?.includes(option.key)) return;

                  onSelectCustom(option);
                  setSelected(option);
                }}
              >
                {option.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
