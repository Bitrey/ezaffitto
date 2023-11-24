import { AnchorHTMLAttributes, FC } from "react";
import { Link } from "react-router-dom";

interface ColoredLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  external?: boolean;
  newPage?: boolean;
}
const ColoredLink: FC<ColoredLinkProps> = ({
  href,
  external,
  newPage,
  children,
  className,
  ...rest
}) => {
  return external ? (
    <a
      className={`text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white transition-colors ${
        className || ""
      }`}
      href={href}
      {...rest}
      target={newPage ? "_blank" : undefined}
      rel={newPage ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ) : (
    <Link
      className={`text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white transition-colors ${
        className || ""
      }`}
      to={href}
      {...rest}
    >
      {children}
    </Link>
  );
};

export default ColoredLink;
