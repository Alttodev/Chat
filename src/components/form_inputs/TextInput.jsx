import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "../ui/input";

function TextInput({ name, control, placeholder, type, disabled }) {
  return (
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            placeholder={placeholder}
            className="text-gray-700"
            type={type}
            disabled={disabled}
          />
        )}
      />
    </div>
  );
}

export default TextInput;
