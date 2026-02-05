import { Text, View } from "react-native";

interface DayStat {
  day: string;
  taken: number;
  missed: number;
}

export default function WeeklyAdherenceChart({ data }: { data: DayStat[] }) {
  const max = Math.max(...data.map((d) => d.taken + d.missed), 1);

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 45 }}>
        Weekly Adherence
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          height: 160,
        }}
      >
        {data.map((d) => {
          const total = d.taken + d.missed;
          const heightPercent = (total / max) * 100;

          return (
            <View key={d.day} style={{ alignItems: "center", width: 36 }}>
              {/* Bar */}
              <View
                style={{
                  height: `${heightPercent}%`,
                  width: 18,
                  borderRadius: 6,
                  overflow: "hidden",
                  backgroundColor: "#E5E7EB",
                }}
              >
                {/* Taken */}
                <View
                  style={{
                    height: `${(d.taken / total) * 100 || 0}%`,
                    backgroundColor: "#16A34A",
                  }}
                />

                {/* Missed */}
                <View
                  style={{
                    height: `${(d.missed / total) * 100 || 0}%`,
                    backgroundColor: "#DC2626",
                  }}
                />
              </View>

              {/* Label */}
              <Text style={{ marginTop: 6, fontSize: 12 }}>{d.day}</Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
        <Text>🟩 Taken</Text>
        <Text>🟥 Missed</Text>
      </View>
    </View>
  );
}
