import React, {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  FunctionComponent
} from "react";
import { Link } from "react-router-dom";

type ButtonAndHrefProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonHTMLAttributes<HTMLButtonElement>;

interface ButtonProps extends ButtonAndHrefProps {
  className?: string;
  href?: string;
  state?: any;
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  href,
  className,
  ...rest
}) => {
  const _className = `p-2 text-white bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-red-300 disabled:cursor-progress border-none outline-none transition-colors duration-75 ${
    className || ""
  }`;

  return href?.startsWith("/") ? (
    <Link to={href} className={_className} {...rest}>
      {children}
    </Link>
  ) : href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={_className}
      {...rest}
    >
      {children}
    </a>
  ) : (
    <button className={_className} {...rest}>
      {children}
    </button>
  );
};

export default Button;
