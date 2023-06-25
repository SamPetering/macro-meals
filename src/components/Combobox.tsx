import { forwardRef, useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox as Cbx } from "@headlessui/react";
import { cx } from "class-variance-authority";
import { InputProps } from "./FormInput";

type ComboboxOption = { id: number | string; display?: string; value: string };
type ComboboxProps = InputProps & {
  options: ComboboxOption[];
  onChange: (option: ComboboxOption) => void;
  initialValue?: ComboboxOption;
};

const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function (
  props,
  ref
) {
  const [query, setQuery] = useState("");
  const { options, onChange, initialValue } = props;
  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) => {
          return (
            option.value.toLowerCase().includes(query.toLowerCase()) ||
            option.display?.toLowerCase().includes(query.toLowerCase())
          );
        });
  function handleChange(option: ComboboxOption) {
    onChange(option);
  }

  return (
    <Cbx as="div" value={initialValue} onChange={handleChange}>
      <div className="relative mt-2">
        <Cbx.Input
          className="w-full rounded-md border-0 bg-stone-200 py-1.5 pl-3 pr-10 text-lg text-stone-950 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-1 focus:ring-inset focus:ring-indigo-600"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(option: ComboboxOption) =>
            option.display ?? option.value
          }
          ref={ref}
        />
        <Cbx.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Cbx.Button>

        {filteredOptions.length > 0 && (
          <Cbx.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-stone-200 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.map((option) => (
              <Cbx.Option
                key={option.id}
                value={option}
                className={({ active }) =>
                  cx(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-indigo-600 text-stone-50" : "text-gray-900"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={cx(
                        "block truncate",
                        selected && "font-semibold"
                      )}
                    >
                      {option.display ?? option.value}
                    </span>

                    {selected && (
                      <span
                        className={cx(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-indigo-600"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Cbx.Option>
            ))}
          </Cbx.Options>
        )}
      </div>
    </Cbx>
  );
});
Combobox.displayName = "Combobox";
export default Combobox;
