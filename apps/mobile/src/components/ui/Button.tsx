import { Pressable, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  children: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  loading,
  disabled,
  className,
}: ButtonProps) {
  const baseClasses = 'h-12 rounded-xl items-center justify-center px-6';
  const variantClasses = {
    primary: 'bg-brand-blue',
    secondary: 'bg-bg-elevated border border-border',
    ghost: 'bg-transparent',
  };
  const textClasses = {
    primary: 'text-white font-semibold text-base',
    secondary: 'text-text-primary font-semibold text-base',
    ghost: 'text-text-secondary font-semibold text-base',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50' : ''} ${className ?? ''}`}
    >
      {({ pressed }) => (
        <>
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className={`${textClasses[variant]} ${pressed ? 'opacity-70' : ''}`}>
              {children}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
}
