import React from 'react';
import { cn } from '../lib/utils';

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  text = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-primary',
    white: 'border-primary-foreground',
    gray: 'border-muted-foreground'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'spinner border-2 border-muted',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
