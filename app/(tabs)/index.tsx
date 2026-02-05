// ⚠️ SAME IMPORTS YOU HAD — only added Modal-related state
import { api } from "@/api/client";
import MissedDoseBanner from "@/components/MissedDoseBanner";
import StreakCard from "@/components/StreakCard";
import { registerForPushNotifications } from "@/hooks/useNotifications";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { updateProfile } from "firebase/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { getAdherence, getStreak } from "../../api/analytics";
import { auth } from "../../firebase/firebase";

/* -------------------- Types -------------------- */
interface TodayDose {
  _id: string;
  medicationName: string;
  dosage: string;
  time: string;
}

/* -------------------- Helpers -------------------- */
const ONE_HOUR = 60 * 60 * 1000;

const getScheduledDate = (dose: any) => {
  // ✅ Preferred: backend-provided datetime
  if (dose.scheduledAt) {
    return new Date(dose.scheduledAt);
  }

  // 🛟 Fallback: try to parse HH:mm safely
  if (!dose?.time) return null;

  const parts = dose.time.split(":");
  if (parts.length !== 2) return null;

  const h = Number(parts[0]);
  const m = Number(parts[1]);

  if (Number.isNaN(h) || Number.isNaN(m)) return null;

  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

const canTakeScheduledDose = (dose: any) => {
  if (!dose?.scheduledAt) return false;

  const scheduled = new Date(dose.scheduledAt);
  return Date.now() >= scheduled.getTime() - ONE_HOUR;
};

const availableIn = (dose: any) => {
  const scheduled = getScheduledDate(dose);
  if (!scheduled) return false;

  const earliest = scheduled.getTime() - ONE_HOUR;
  const diff = earliest - Date.now();

  if (diff <= 0) return null;

  const mins = Math.ceil(diff / (60 * 1000));
  return `${mins} min`;
};

const getNextDoseFromToday = (doses: TodayDose[]) => {
  const now = new Date();

  const upcoming = doses
    .map((dose) => {
      const [h, m] = dose.time.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d > now ? d : null;
    })
    .filter((d): d is Date => d !== null);

  if (!upcoming.length) return null;
  return new Date(Math.min(...upcoming.map((d) => d.getTime())));
};

/* -------------------- Screen -------------------- */
export default function DashboardScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(true);

  const [todayDoses, setTodayDoses] = useState<TodayDose[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [streak, setStreak] = useState(0);

  // ✅ missed dose
  const [missedDose, setMissedDose] = useState<any | null>(null);

  // ✅ snooze UX
  const [snoozingDose, setSnoozingDose] = useState<any | null>(null);
  const [optimisticHiddenLogIds, setOptimisticHiddenLogIds] = useState<
    string[]
  >([]);

  const [tick, setTick] = useState(Date.now());

  /* -------------------- Fetch -------------------- */
  const fetchTodayDoses = async () => {
    try {
      const res = await api.get("/schedules/today");
      setTodayDoses(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchMissedDose = async () => {
    try {
      const res = await api.get("/logs/missed/today");

      if (!res.data || res.data.length === 0) {
        setMissedDose(null);
        return;
      }

      const activeMissed = res.data.find(
        (d: any) => d.medicationId?.isActive !== false,
      );

      setMissedDose(activeMissed || null);
    } catch (err) {
      console.error("Fetch missed dose error:", err);
      setMissedDose(null);
    }
  };

  const fetchSummary = async () => {
    setSummary(await getAdherence("week"));
  };

  const fetchStreak = async () => {
    const res = await getStreak();
    setStreak(res.streak);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTodayDoses();
      fetchMissedDose();
      fetchSummary();
      fetchStreak();
    }, []),
  );

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  useEffect(() => {
    const i = setInterval(() => setTick(Date.now()), 60_000);
    return () => clearInterval(i);
  }, []);

  /* -------------------- Derived -------------------- */

  const nextDose = useMemo(
    () => getNextDoseFromToday(todayDoses),
    [todayDoses, tick],
  );

  // ✅ only hide snoozed doses optimistically
  const visibleMissedDose =
    missedDose && !optimisticHiddenLogIds.includes(missedDose._id)
      ? missedDose
      : null;

  /* -------------------- Actions -------------------- */
  const saveName = async () => {
    if (!user || !name.trim()) return;
    setSavingName(true);
    await updateProfile(user, { displayName: name.trim() });
    setSavingName(false);
  };

  const markAsTaken = async (doseLogId: string) => {
    const prev = [...todayDoses];
    setTodayDoses((d) => d.filter((x) => x._id !== doseLogId));

    try {
      await api.post(`/schedules/${doseLogId}/taken`);
    } catch {
      setTodayDoses(prev);
    }
  };

  const handleTakeNow = async (dose: any) => {
    const id = dose._id;

    // 🔥 Optimistically hide banner immediately
    setOptimisticHiddenLogIds((ids) => [...ids, id]);

    try {
      await api.post("/logs/take-now", {
        medicationId: dose.medicationId._id,
        scheduleId: dose.scheduleId,
      });

      // optional but good
      fetchSummary();
      fetchMissedDose();
    } catch (err) {
      // ❌ rollback if API fails
      setOptimisticHiddenLogIds((ids) => ids.filter((x) => x !== id));
    }
  };

  const openSnoozeSheet = (dose: any) => {
    setSnoozingDose(dose);
  };

  const confirmSnooze = async (minutes = 30) => {
    if (!snoozingDose) return;

    const id = snoozingDose._id;
    setOptimisticHiddenLogIds((ids) => [...ids, id]);
    setSnoozingDose(null);

    try {
      await api.patch(`/schedules/${id}/snooze`, { minutes });
    } catch {
      setOptimisticHiddenLogIds((ids) => ids.filter((x) => x !== id));
    }
  };

  /* -------------------- Render -------------------- */
  return (
    <>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchTodayDoses} />
        }
        data={todayDoses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {
          const allowed = canTakeScheduledDose(item);
          const availableText = availableIn(item);

          return (
            <View
              style={{
                marginTop: 12,
                padding: 16,
                borderRadius: 12,
                backgroundColor: "#F8FAFC",
                shadowColor: "#212020",
              }}
            >
              <Text style={{ fontWeight: "600" }}>{item.medicationName}</Text>
              <Text style={{ marginTop: 4, color: "#475569" }}>
                {item.time} • {item.dosage}
              </Text>

              <Pressable
                onPress={() => markAsTaken(item._id)}
                disabled={!allowed}
                style={{
                  marginTop: 10,
                  backgroundColor: allowed ? "#16A34A" : "#CBD5E1",
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {allowed
                    ? "✔ Mark as taken"
                    : availableText
                      ? `Available in ${availableText}`
                      : "Not available yet"}
                </Text>
              </Pressable>
            </View>
          );
        }}
        ListHeaderComponent={
          <>
            {visibleMissedDose && (
              <MissedDoseBanner
                dose={visibleMissedDose}
                onTakeNow={handleTakeNow}
                onSnooze={openSnoozeSheet}
              />
            )}

            {!user?.displayName && (
              <View
                style={{
                  backgroundColor: "#FEFCE8",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontWeight: "600", marginBottom: 8 }}>
                  What should we call you?
                </Text>
                <TextInput
                  placeholder="Your name"
                  value={name}
                  onChangeText={setName}
                  style={{
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 10,
                  }}
                />
                <Pressable
                  onPress={saveName}
                  disabled={savingName}
                  style={{
                    backgroundColor: "#2563EB",
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Save
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Walkthrough */}
            {showWalkthrough && (
              <View
                style={{
                  backgroundColor: "#EFF6FF",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "600" }}>
                  👋 Welcome{user?.displayName ? `, ${user.displayName}` : ""}!
                </Text>
                <Text style={{ marginTop: 8 }}>
                  Add your medications, get reminders, and track progress.
                </Text>
                <Pressable
                  onPress={() => setShowWalkthrough(false)}
                  style={{ marginTop: 12, alignSelf: "flex-end" }}
                >
                  <Text style={{ color: "#2563EB", fontWeight: "600" }}>
                    Got it
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Header + Actions */}
            <Text style={{ fontSize: 28, fontWeight: "bold" }}>Dashboard</Text>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <Pressable
                onPress={() => router.push("/add-medication")}
                style={{
                  flex: 1,
                  backgroundColor: "#2563EB",
                  padding: 16,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  ➕ Add Medication
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/medication")}
                style={{
                  backgroundColor: "#fff",
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="list-outline" size={22} color="#0A84FF" />
                <Text style={{ color: "#0A84FF", fontWeight: "600" }}>
                  All Meds
                </Text>
              </Pressable>
            </View>

            {summary && (
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  padding: 16,
                  borderRadius: 16,
                  marginTop: 24,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "700" }}>
                  This Week
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 12,
                  }}
                >
                  <Text>✅ Taken: {summary.taken}</Text>
                  <Text>❌ Missed: {summary.missed}</Text>
                  <Text style={{ fontWeight: "700" }}>
                    📊 {summary.adherence}%
                  </Text>
                </View>
              </View>
            )}

            <StreakCard streak={streak} />

            <Text style={{ fontSize: 20, fontWeight: "600", marginTop: 32 }}>
              Today’s Medications
            </Text>

            {/* <Text style={{ color: "#2563EB", marginTop: 6 }}>
              {nextDose ? formatCountdown(nextDose) : "No more doses today 🎉"}
            </Text> */}
          </>
        }
      />

      {/* ✅ Snooze bottom sheet */}
      {snoozingDose && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            elevation: 10,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700" }}>
            Snooze missed dose
          </Text>

          <Pressable
            onPress={() => confirmSnooze(30)}
            style={{
              marginTop: 16,
              backgroundColor: "#F59E0B",
              padding: 14,
              borderRadius: 12,
            }}
          >
            <Text
              style={{ color: "white", textAlign: "center", fontWeight: "600" }}
            >
              ⏰ Snooze 30 minutes
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSnoozingDose(null)}
            style={{ marginTop: 12 }}
          >
            <Text style={{ textAlign: "center", color: "#64748B" }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      )}
    </>
  );
}
