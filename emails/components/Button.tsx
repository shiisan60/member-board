import { Button as EmailButton } from '@react-email/components';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export default function Button({ 
  href, 
  children, 
  variant = 'primary',
  className = ''
}: ButtonProps) {
  const baseClasses = 'inline-block px-6 py-3 font-medium text-white text-decoration-none rounded-md text-center';
  
  const variantClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    danger: 'bg-red-600'
  };

  return (
    <EmailButton 
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </EmailButton>
  );
}