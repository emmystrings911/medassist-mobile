import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { api } from "@/services/api";

export default function EditMedication() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (id) fetchMedication();
  }, [id]);

  const fetchMedication = async () => {
    try {
      const res = await api.get(`/medications/${id}`);
      const med = res.data.data;

      setName(med.name);
      setDosage(med.dosage);
      setInstructions(med.instructions || "");
    } catch (err) {
      console.log("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name || !dosage) {
      return Alert.alert("Error", "Name and dosage are required");
    }

    try {
      setSaving(true);

      await api.patch(`/medications/${id}`, {
        name,
        dosage,
        instructions,
      });

      Alert.alert("Success", "Medication updated");

      router.back(); // go back to details
    } catch (err) {
      Alert.alert("Error", "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 20 }}>
        <Text
          style={[
            { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
            { color: theme.text },
          ]}
        >
          Edit Medication ✏️
        </Text>

        {/* NAME */}
        <Text style={[{ marginTop: 15 }, { color: theme.text }]}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[input, { backgroundColor: theme.inputBg }]}
        />

        {/* DOSAGE */}
        <Text style={[{ marginTop: 15 }, { color: theme.text }]}>Dosage</Text>
        <TextInput
          value={dosage}
          onChangeText={setDosage}
          style={[input, { backgroundColor: theme.inputBg }]}
        />

        {/* INSTRUCTIONS */}
        <Text style={[{ marginTop: 15 }, { color: theme.text }]}>
          Instructions
        </Text>
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          multiline
          style={[input, { backgroundColor: theme.inputBg, height: 100 }]}
        />

        {/* SAVE */}
        <TouchableOpacity
          disabled={saving}
          onPress={handleUpdate}
          style={[
            saveBtn,
            {
              backgroundColor: saving ? "#999" : theme.accent,
            },
          ]}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const input = {
  padding: 12,
  borderRadius: 10,
  marginTop: 5,
};

const saveBtn = {
  padding: 15,
  borderRadius: 12,
  marginTop: 25,
};
