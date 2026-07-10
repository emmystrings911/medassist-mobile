import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { api } from "@/services/api";

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  adherence: number;
  nextDoseTime: string | null;
}

export default function Medications() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    fetchMeds();
  }, []);

  const fetchMeds = async () => {
    try {
      const res = await api.get("/medications");
      setMeds(res.data.data);
    } catch (err) {
      console.log("❌ meds error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: string | null) => {
    if (!date) return "No upcoming dose";

    const d = new Date(date);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }: { item: Medication }) => {
    return (
      <ScrollView style={{}}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/patient/medication/[id]",
              params: { id: item._id },
            })
          }
          style={[
            card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceElevated,
              borderWidth: 1,
            },
          ]}
        >
          {/* HEADER */}
          <View style={{ marginBottom: 8 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: theme.text }}
            >
              {item.name}
            </Text>
            <Text style={{ color: theme.subText }}>{item.dosage}</Text>
          </View>

          {/* NEXT DOSE */}
          <Text style={{ color: theme.subText, marginBottom: 8 }}>
            ⏱ Next dose: {formatTime(item.nextDoseTime)}
          </Text>

          {/* ADHERENCE BAR */}
          <View
            style={{
              height: 8,
              backgroundColor: theme.text,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${item.adherence}%`,
                height: "100%",
                backgroundColor:
                  item.adherence > 80
                    ? "#4CAF50"
                    : item.adherence > 50
                      ? "#FF9800"
                      : "#F44336",
              }}
            />
          </View>

          {/* FOOTER */}
          <Text style={{ marginTop: 6, fontSize: 12, color: theme.subText }}>
            {item.adherence}% adherence
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Text
        style={[
          {
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 10,
            marginTop: 20,
            padding: 10,
          },
          { color: theme.text },
        ]}
      >
        Medications
      </Text>
      <FlatList
        data={meds}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderItem}
      />
    </View>
  );
}

const card = {
  padding: 16,
  borderRadius: 16,
  marginBottom: 12,
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 2,
  marginTop: 25,
};
