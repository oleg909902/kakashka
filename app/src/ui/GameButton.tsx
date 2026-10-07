import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
};

/** Chunky cartoon button matching the game logo. */
export function GameButton({ title, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 220,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 32,
    backgroundColor: '#FFC928',
    borderWidth: 5,
    borderColor: '#6B3A1E',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: '#FFB300',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  text: {
    fontSize: 32,
    fontWeight: '900',
    color: '#6B3A1E',
    letterSpacing: 1,
  },
});
