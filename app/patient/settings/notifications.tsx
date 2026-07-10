import { NOTIFICATION_SOUNDS, SOUND_MAP } from "@/constants/notificationSounds";
import { useTheme } from "@/hooks/useTheme";
import { getSettings, updateSettings } from "@/services/settings.service";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificationSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const { theme } = useTheme();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await getSettings();

      // ✅ ensure structure always exists
      setSettings({
        ...res.data.data,
        quietHours: res.data.data.quietHours || {
          enabled: false,
          start: "22:00",
          end: "07:00",
        },
      });
    } catch (err) {
      console.log("Failed to load settings", err);
    }
  };

  const playSound = async (value: string) => {
    try {
      const soundFile = SOUND_MAP[value];
      if (!soundFile) return;

      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
    } catch (error) {
      console.log("Sound error", error);
    }
  };

  const updateField = async (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    try {
      setSaving(true);
      await updateSettings(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleQuietHours = async (field: string, value: any) => {
    const updated = {
      ...settings,
      quietHours: {
        ...settings.quietHours,
        [field]: value,
      },
    };

    setSettings(updated);

    try {
      setSaving(true);
      await updateSettings(updated);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: theme.background,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 20,
          color: theme.text,
        }}
      >
        Notification Settings 🔔
      </Text>

      {/* PUSH */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: theme.text }}>Push Notifications</Text>
        <Switch
          value={settings.push}
          onValueChange={(v) => updateField("push", v)}
          trackColor={{ true: theme.primary }}
        />
      </View>

      {/* EMAIL */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: theme.text }}>Email Notifications</Text>
        <Switch
          value={settings.email}
          onValueChange={(v) => updateField("email", v)}
          trackColor={{ true: theme.primary }}
        />
      </View>

      {/* SMS */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: theme.text }}>SMS Alerts</Text>
        <Switch
          value={settings.sms}
          onValueChange={(v) => updateField("sms", v)}
          trackColor={{ true: theme.primary }}
        />
      </View>

      {/* SOUND */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontWeight: "600",
            marginBottom: 10,
            color: theme.text,
          }}
        >
          Notification Sound 🔊
        </Text>

        {NOTIFICATION_SOUNDS.map((s) => (
          <TouchableOpacity
            key={s.value}
            onPress={async () => {
              await playSound(s.value);
              await updateField("sound", s.value);
            }}
            style={{
              padding: 12,
              backgroundColor:
                settings.sound === s.value ? theme.primarySoft : theme.surface,
              borderRadius: 10,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: theme.text }}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* QUIET HOURS */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: "600", color: theme.text }}>
          Quiet Hours 🌙
        </Text>

        <Switch
          value={settings.quietHours.enabled}
          onValueChange={(v) => handleQuietHours("enabled", v)}
          trackColor={{ true: theme.primary }}
        />

        <Text style={{ color: theme.text, marginTop: 10 }}>Start (HH:mm)</Text>
        <TextInput
          value={settings.quietHours.start}
          onChangeText={(v) => handleQuietHours("start", v)}
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.inputBg,
            color: theme.text,
            padding: 10,
            borderRadius: 8,
            marginBottom: 10,
          }}
        />

        <Text style={{ color: theme.text }}>End (HH:mm)</Text>
        <TextInput
          value={settings.quietHours.end}
          onChangeText={(v) => handleQuietHours("end", v)}
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.inputBg,
            color: theme.text,
            padding: 10,
            borderRadius: 8,
          }}
        />
      </View>

      {saving && (
        <Text style={{ color: theme.subText, textAlign: "center" }}>
          Saving...
        </Text>
      )}
    </ScrollView>
  );
}
