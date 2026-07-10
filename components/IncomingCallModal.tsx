import { Modal, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  callerName?: string;
  onAccept: () => void;
  onDecline: () => void;
};

export default function IncomingCallModal({
  visible,
  callerName = "Incoming call",
  onAccept,
  onDecline,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000cc",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 20, marginBottom: 10 }}>
          📞 Incoming Call
        </Text>

        <Text style={{ color: "#aaa", marginBottom: 30 }}>{callerName}</Text>

        <View style={{ flexDirection: "row" }}>
          {/* ❌ DECLINE */}
          <TouchableOpacity
            onPress={onDecline}
            style={{
              backgroundColor: "red",
              padding: 15,
              borderRadius: 50,
              marginHorizontal: 20,
            }}
          >
            <Text style={{ color: "white" }}>Decline</Text>
          </TouchableOpacity>

          {/* ✅ ACCEPT */}
          <TouchableOpacity
            onPress={onAccept}
            style={{
              backgroundColor: "#22c55e",
              padding: 15,
              borderRadius: 50,
              marginHorizontal: 20,
            }}
          >
            <Text style={{ color: "white" }}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
