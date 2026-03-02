import { View, TextInput, Text, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="gap-1.5">
      {label && <Text className="text-text-secondary text-sm font-medium">{label}</Text>}
      <TextInput
        className={`h-12 bg-bg-tertiary rounded-lg px-4 text-text-primary text-base border ${error ? 'border-error' : 'border-border'}`}
        placeholderTextColor="#525252"
        {...props}
      />
      {error && <Text className="text-error text-xs">{error}</Text>}
    </View>
  );
}
