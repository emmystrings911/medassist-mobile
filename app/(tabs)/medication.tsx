import { api } from "@/api/client";
import { takeNowDose } from "@/api/doseLogs";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import { getMedications } from "../../api/medications";

const hoursToMs = (h: number) => h * 60 * 60 * 1000;

export default function Medications() {
  const toast = useToast();
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [takingId, setTakingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadMeds();
  }, []);

  const loadMeds = async () => {
    setLoading(true);
    try {
      const data = await getMedications();
      setMeds(data);
    } finally {
      setLoading(false);
    }
  };

  const canTakePrn = (med: any) => {
    if (!med.lastTakenAt) return true;

    const nextAllowed =
      new Date(med.lastTakenAt).getTime() + hoursToMs(med.prnIntervalHours);

    return Date.now() >= nextAllowed;
  };

  const remainingTime = (med: any) => {
    const nextAllowed =
      new Date(med.lastTakenAt).getTime() + hoursToMs(med.prnIntervalHours);

    const diff = nextAllowed - Date.now();
    if (diff <= 0) return "0m";

    const h = Math.floor(diff / (60 * 60 * 1000));
    const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    return `${h > 0 ? `${h}h ` : ""}${m}m`;
  };

  const togglePause = async (med: any) => {
    try {
      if (med.isActive) {
        await api.patch(`/medications/${med._id}/pause`);
        toast.show("Medication paused", { type: "success" });
      } else {
        await api.patch(`/medications/${med._id}/resume`);
        toast.show("Medication resumed", { type: "success" });
      }

      await loadMeds();
    } catch {
      toast.show("Failed to update medication", { type: "danger" });
    }
  };

  const handleTakeNow = async (med: any) => {
    try {
      setTakingId(med._id);

      await takeNowDose({
        medicationId: med._id,
      });

      toast.show("Dose logged", { type: "success" });

      await loadMeds();
    } catch (err: any) {
      toast.show(err?.response?.data?.message || "Failed to log dose", {
        type: "danger",
      });
    } finally {
      setTakingId(null);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  const activeMeds = meds.filter((m) => m.isActive);
  const pausedMeds = meds.filter((m) => !m.isActive);

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : meds.length === 0 ? (
        /* Empty State */
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "700" }}>
            No medications yet
          </Text>

          <Text
            style={{
              marginTop: 8,
              textAlign: "center",
              color: "#475569",
              fontSize: 16,
            }}
          >
            Add your first medication and we’ll help you stay on track.
          </Text>

          <Pressable
            onPress={() => router.push("/add-medication")}
            style={{
              marginTop: 24,
              backgroundColor: "#2563EB",
              paddingVertical: 14,
              paddingHorizontal: 28,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
              ➕ Add medication
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadMeds} />
          }
          contentContainerStyle={{ padding: 16 }}
          data={[...activeMeds, ...pausedMeds]}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => {
            const isFirstActive = index === 0 && activeMeds.length > 0;
            const isFirstPaused =
              index === activeMeds.length && pausedMeds.length > 0;

            const isPrn = item.type === "prn";
            const allowed = !isPrn || canTakePrn(item);
            const disabled =
              !item.isActive || takingId === item._id || (isPrn && !allowed);
            const isFinished =
              item.endDate && new Date(item.endDate).getTime() < Date.now();

            const editable = !item.lastTakenAt && !isFinished;

            return (
              <>
                {/* Section headers */}
                {isFirstActive && (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      marginBottom: 12,
                      color: "#020617",
                    }}
                  >
                    Active medications
                  </Text>
                )}

                {isFirstPaused && (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      marginVertical: 12,
                      color: "#64748B",
                    }}
                  >
                    Paused
                  </Text>
                )}

                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 14,
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  {/* Header */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "700",
                          color: item.isActive ? "#020617" : "#94A3B8",
                        }}
                      >
                        {item.name}
                      </Text>

                      <Text
                        style={{
                          marginTop: 2,
                          color: "#475569",
                          fontSize: 14,
                        }}
                      >
                        {item.dosage}
                      </Text>

                      {!item.isActive && (
                        <Text
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            fontWeight: "600",
                            color: "#92400E",
                          }}
                        >
                          ⏸ Paused — reminders disabled
                        </Text>
                      )}
                    </View>

                    <View style={{ alignItems: "flex-end", gap: 6 }}>
                      {editable ? (
                        <Pressable
                          onPress={() =>
                            router.push({
                              pathname: "/edit-medication/[id]",
                              params: { id: item._id },
                            })
                          }
                        >
                          <Text style={{ color: "#2563EB", fontWeight: "600" }}>
                            Edit
                          </Text>
                        </Pressable>
                      ) : (
                        <Text style={{ fontSize: 12, color: "#64748B" }}>
                          {item.lastTakenAt
                            ? "Editing locked after first dose"
                            : "Medication has ended"}
                        </Text>
                      )}
                      <Pressable onPress={() => togglePause(item)}>
                        <Text
                          style={{
                            color: item.isActive ? "#DC2626" : "#16A34A",
                            fontWeight: "600",
                          }}
                        >
                          {item.isActive ? "Pause" : "Resume"}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "../medication-history/[id]",
                            params: { id: item._id },
                          })
                        }
                      >
                        <Text style={{ color: "#0F172A", fontWeight: "600" }}>
                          History
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* PRN */}
                  {isPrn && (
                    <>
                      <Text
                        style={{
                          marginTop: 12,
                          fontSize: 13,
                          color: "#64748B",
                        }}
                      >
                        As needed • every {item.prnIntervalHours} hours
                      </Text>

                      <Pressable
                        disabled={disabled}
                        onPress={() => handleTakeNow(item)}
                        style={{
                          marginTop: 14,
                          paddingVertical: 14,
                          borderRadius: 12,
                          backgroundColor: disabled ? "#CBD5E1" : "#16A34A",
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            textAlign: "center",
                            fontWeight: "700",
                          }}
                        >
                          {!item.isActive
                            ? "Paused"
                            : takingId === item._id
                              ? "Logging dose..."
                              : allowed
                                ? "Take dose now"
                                : `Available in ${remainingTime(item)}`}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/prn-trends/[id]",
                            params: { id: item._id },
                          })
                        }
                        style={{
                          marginTop: 10,
                          paddingVertical: 10,
                          borderRadius: 10,
                          backgroundColor: "#EFF6FF",
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            fontWeight: "600",
                            color: "#2563EB",
                          }}
                        >
                          📈 View PRN trends
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </>
            );
          }}
        />
      )}
    </View>
  );
}
