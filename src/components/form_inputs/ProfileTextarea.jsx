import { Controller } from "react-hook-form";

export default function ProfileTextAreaInput({
  name,
  control,
  placeholder,
  disabled,
  rows = 4,
  maxLength = 150,
  className = "",
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <textarea
          {...field}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`
  w-full
  resize-none
  rounded-xl
  border border-input
  bg-background
  px-3 py-2
  text-sm
  outline-none
  transition-colors
  focus:ring-0
  focus:border-slate-300
  dark:focus:border-slate-600
  disabled:cursor-not-allowed
  disabled:opacity-70
  ${className}
`}
        />
      )}
    />
  );
}
