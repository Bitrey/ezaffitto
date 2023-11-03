import { FC, HTMLAttributes, useEffect, useState } from "react";
import UpChevron from "../icons/UpChevron";

interface AccordionPanelProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
}

export const Accordion: FC<AccordionPanelProps> = ({
  title,
  children,
  className,
  ...rest
}) => {
  const [chevronAnimation, setChevronAnimation] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setChevronAnimation(false);
    }, 100);
  }, []);

  function toggleOpen() {
    setIsOpen(!isOpen);
  }

  return (
    <div
      {...rest}
      className={`border dark:border-gray-500 w-full mx-auto dark:text-white rounded-xl overflow-hidden ${
        className || ""
      }`}
    >
      <div
        className="bg-gray-50 dark:bg-gray-700 flex justify-center items-center p-4 cursor-pointer"
        onClick={toggleOpen}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-lg ml-1">
          <UpChevron
            className={`scale-75 dark:fill-gray-400 transition-transform ${
              chevronAnimation || isOpen ? "" : "rotate-180"
            }`}
          />
        </span>
      </div>
      <div
        className={`${
          isOpen ? "max-h-screen" : "max-h-0"
        } transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <div className="flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
};

export default Accordion;
