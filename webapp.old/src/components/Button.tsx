import React, {
  ButtonHTMLAttributes,
  FunctionComponent,
  HTMLAttributes
} from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <button
      className={`p-2 text-white bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-red-300 disabled:cursor-progress border-none outline-none transition-colors duration-75 ${
        className || ""
      }`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
