import React, {
    FunctionComponent,
    HTMLInputTypeAttribute,
    InputHTMLAttributes
} from "react";

interface TextboxProps extends InputHTMLAttributes<HTMLInputElement> {
    type: HTMLInputTypeAttribute;
    className?: string;
}

const Textbox: FunctionComponent<TextboxProps> = ({ className, ...rest }) => {
    return (
        <input
            className={`p-2 rounded border border-inherit outline-none focus:border-red-600 transition-colors duration-100 ${
                className || ""
            }`}
            {...rest}
        />
    );
};

export default Textbox;
