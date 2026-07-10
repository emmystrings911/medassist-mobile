import { ActionCard } from "@/components/ActionCard";
import { DoseCard } from "@/components/DoseCard";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import StreakBadge from "@/components/StreakBadge";

import { getAdherenceStats } from "@/services/adherence.service";
import { getTodayDoses, markDoseTaken } from "@/services/dose.service";
import { getProfile } from "@/services/user.service";

import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

export default function Dashboard() {
  const { theme } = useTheme();

  const [user, setUser] = useState<any>(null);
  const [doses, setDoses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const [userRes, doseRes, statsRes] = await Promise.all([
        getProfile(),
        getTodayDoses(),
        getAdherenceStats(),
      ]);

      setUser(userRes.data);
      setDoses(doseRes);
      setStats(statsRes);
    } finally {
      setLoading(false);
    }
  };

  const handleTake = async (doseId: string) => {
    setDoses((prev) =>
      prev.map((d) => (d._id === doseId ? { ...d, status: "taken" } : d)),
    );

    try {
      await markDoseTaken(doseId);
      const statsRes = await getAdherenceStats();
      setStats(statsRes);
    } catch {
      loadData();
    }
  };

  const taken = stats?.taken ?? 0;
  const missed = stats?.missed ?? 0;
  const streak = stats?.streak ?? 0;
  const adherenceRate = stats?.adherenceRate ?? 0;
  const avgDelay = stats?.avgDelayMinutes ?? 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 20 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadData} />
      }
    >
      {/* HEADER */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: theme.text, fontSize: 26, fontWeight: "bold" }}>
          MedAssist 💊
        </Text>
        <Text style={{ color: theme.subText }}>
          Hello, {user?.name || "User"}
        </Text>
      </View>

      {/* ACTIONS */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <ActionCard
          title="Add Medication"
          icon="add-circle"
          onPress={() => router.push("/patient/medication/add")}
        />
        <ActionCard
          title="My Medications"
          icon="list"
          onPress={() => router.push("/patient/(tabs)/medications")}
        />
      </View>

      {/* STATS */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <StatCard label="Taken" value={taken} color={theme.accent} />
        <StatCard label="Missed" value={missed} color={theme.danger} />
        <StreakBadge streak={streak} />
      </View>

      {/* ADHERENCE */}
      <View
        style={{
          backgroundColor: theme.surface,
          padding: 16,
          borderRadius: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Text style={{ color: theme.subText, marginBottom: 8 }}>
          Adherence Overview
        </Text>

        <Text
          style={{ fontSize: 28, fontWeight: "bold", color: theme.primary }}
        >
          {adherenceRate}%
        </Text>

        <Text style={{ color: theme.subText }}>Avg Delay: {avgDelay} mins</Text>
      </View>

      {/* DOSES */}
      <Text style={{ color: theme.text, fontSize: 18, marginBottom: 10 }}>
        Today’s Schedule
      </Text>

      {loading ? (
        <Text style={{ color: theme.subText }}>Loading...</Text>
      ) : doses.length === 0 ? (
        <EmptyState />
      ) : (
        doses.map((dose) => (
          <DoseCard key={dose._id} dose={dose} onTake={handleTake} />
        ))
      )}
    </ScrollView>
  );
}
