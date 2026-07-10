import { useTheme } from "@/hooks/useTheme";
import { resendOtp, verifyOtp } from "@/services/auth.api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email, type } = useLocalSearchParams();
  const { theme } = useTheme();

  const emailString = Array.isArray(email) ? email[0] : email;
  const typeString = Array.isArray(type) ? type[0] : type;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);

  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) {
      const digits = value.slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => (newOtp[i] = d));
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError("");

      const code = otp.join("");

      if (code.length < 6) {
        setError("Enter complete OTP");
        return;
      }

      await verifyOtp({
        email: emailString,
        otp: code,
        type: typeString,
      });

      // ✅ ROUTING LOGIC FIX
      if (typeString === "reset_password") {
        router.replace({
          pathname: "/(auth)/reset-password" as any,
          params: { email: emailString },
        });
      } else {
        router.replace("/(auth)/verified");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(60);
    await resendOtp({ email: emailString, type: typeString });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Verify OTP</Text>
      <Text style={[styles.subtitle, { color: theme.subText }]}>
        Enter the 6-digit code sent to your email
      </Text>

      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(value) => handleChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={[
              styles.otpInput,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />
        ))}
      </View>

      {error ? (
        <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleVerify}
      >
        {loading ? (
          <ActivityIndicator color={theme.buttonText} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Verify
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendRow}>
        <Text style={[styles.resendText, { color: theme.subText }]}>
          Didn’t receive code?
        </Text>
        {timer > 0 ? (
          <Text style={styles.timer}> {timer}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text style={[styles.resendBtn, { color: theme.primary }]}>
              {" "}
              Resend
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: "center",
    fontSize: 18,
  },
  error: {
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  resendText: { color: "#aaa" },
  timer: { color: "#777" },
  resendBtn: { color: "#22C55E", fontWeight: "600" },
});
