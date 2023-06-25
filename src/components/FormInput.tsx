"use client";
import { UseFormReturn } from "react-hook-form";
import { forwardRef } from "react";
import { cx } from "class-variance-authority";

export type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  editable?: boolean;
  error?: boolean;
  register?: UseFormReturn["register"];
};
const FormInput = forwardRef<HTMLInputElement, InputProps>(function (
  props,
  ref
) {
  const { editable = true, error } = props;
  return (
    <div
      className={cx(
        "overflow-hidden rounded-md text-lg",
        error
          ? "bg-red-500 text-stone-50"
          : editable
          ? "bg-stone-200 text-stone-950"
          : "bg-stone-500 text-stone-950"
      )}
    >
      <input
        className="group w-full rounded-sm border-0 bg-transparent py-1.5 pl-3 pr-10 focus:outline-0"
        disabled={!editable}
        {...props}
        ref={ref}
      />
    </div>
  );
});
FormInput.displayName = "FormInput";
export default FormInput;

type FormLabeledInputProps = InputProps & {
  label: string;
  after?: string;
  required?: boolean;
  inputElement?: React.ReactNode;
};
export const FormLabeledInput = forwardRef<
  HTMLInputElement,
  FormLabeledInputProps
>(function (props, ref) {
  const { label, error, required, ...inputProps } = props;
  const showAsterisk = required || error;
  const input = props.inputElement ?? (
    <FormInput {...inputProps} error={error} ref={ref} />
  );
  return (
    <div className={"flex flex-col"}>
      <label htmlFor={props.name} className="flex">
        <p>{props.label} </p>
        {
          <span
            className={cx("ml-2 font-semibold", error ? "text-red-500" : "")}
          >
            {showAsterisk ? "*" : ""}
          </span>
        }
        {props.after && (
          <span className="ml-auto text-stone-500">{props.after}</span>
        )}
      </label>
      {input}
    </div>
  );
});
FormLabeledInput.displayName = "FormLabeledInput";
