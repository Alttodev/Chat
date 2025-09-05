import * as React from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { Controller } from 'react-hook-form';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const PasswordInput = ({ name, control, placeholder, disabled, className }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const isDisabled = disabled || field.value === '' || field.value === undefined;
        
        return (
          <div className="relative">
            <Input
              {...field}
              type={showPassword ? 'text' : 'password'}
              className={cn('hide-password-toggle pr-10 text-gray-700', className)}
              placeholder={placeholder}
              disabled={disabled}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isDisabled}
            >
              {showPassword && !isDisabled ? (
                <EyeIcon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                {showPassword ? 'Hide password' : 'Show password'}
              </span>
            </Button>

            <style>{`
              .hide-password-toggle::-ms-reveal,
              .hide-password-toggle::-ms-clear {
                visibility: hidden;
                pointer-events: none;
                display: none;
              }
            `}</style>
          </div>
        );
      }}
    />
  );
};

export { PasswordInput };