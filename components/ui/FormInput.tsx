import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: string;
  secure?: boolean;
  isPassword?: boolean;
  theme: {
    input: string;
    border: string;
    muted: string;
    primary: string;
    text: string;
  };
}

export default function FormInput({
  label,
  value,
  onChangeText,
  icon,
  secure,
  isPassword,
  theme,
}: FormInputProps) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  const isActive = focused || value;

  return (
    <View
      style={{
        backgroundColor: theme.input,
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: theme.border,
        paddingLeft: 40,
        paddingRight: isPassword ? 40 : 12,
        paddingTop: 18,
        paddingBottom: 6,
      }}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={theme.muted}
        style={{ position: "absolute", left: 12, top: 18 }}
      />

      <Text
        style={{
          position: "absolute",
          left: 40,
          top: isActive ? 6 : 18,
          fontSize: isActive ? 11 : 14,
          color: isActive ? theme.primary : theme.muted,
        }}
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPassword ? !show : secure}
        style={{ color: theme.text, fontSize: 16 }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {isPassword && (
        <TouchableOpacity
          onPress={() => setShow(!show)}
          style={{ position: "absolute", right: 12, top: 18 }}
        >
          <Ionicons
            name={show ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={theme.muted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
