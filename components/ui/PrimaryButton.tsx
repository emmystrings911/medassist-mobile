import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  theme: {
    primary: string;
  };
}

export default function PrimaryButton({
  title,
  onPress,
  loading,
  theme,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: theme.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 15,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: "#fff", fontWeight: "600" }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
