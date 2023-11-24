import { FC, HTMLAttributes } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {}

const Container: FC<ContainerProps> = ({ children, className, ...rest }) => {
  return (
    <div className={`px-4 md:px-8 lg:px-12 pt-2 ${className || ""}`} {...rest}>
      {children}
    </div>
  );
};

export default Container;
