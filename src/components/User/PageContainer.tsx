import React, { type ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = '6xl',
}) => {
  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 ${widthClasses[maxWidth]}`}>
      {children}
    </div>
  );
};
