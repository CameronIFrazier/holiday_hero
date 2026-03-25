import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/hooks/useAuth";

// ── Theme tokens ───────────────────────────────────────────────────────────────
const C = {
  main:       "#f97316",
  secondary:  "#ffb74d",
  accent:     "#ff3d00",
  background: "#fff3e0",
  text:       "#212121",
  subtext:    "#757575",
  border:     "#ffcc80",
  white:      "#ffffff",
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface StatBlockProps {
  value: string;
  label: string;
}

// ── StatBlock ──────────────────────────────────────────────────────────────────

function StatBlock({ value, label }: StatBlockProps) {
  return (
    <View style={{ alignItems: "center", paddingHorizontal: 16 }}>
      <Text style={{ color: C.text, fontWeight: "800", fontSize: 22 }}>{value}</Text>
      <Text style={{ color: C.subtext, fontSize: 11, marginTop: 2, textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </Text>
    </View>
  );
}

// ── Profile Screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user } = useAuth();

  const initialName = user?.displayName ?? (user?.email?.split("@")[0] ?? "User");
  const [displayName, setDisplayName] = useState(initialName);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(initialName);

  const avatarLetter = (displayName?.[0] ?? "U").toUpperCase();

  const handleSave = () => {
    setDisplayName(nameInput.trim() || initialName);
    setEditingName(false);
  };

  const handleEdit = () => {
    setNameInput(displayName);
    setEditingName(true);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ paddingBottom: 48 }}
    >
      {/* ── Gradient banner ── */}
      <LinearGradient
        colors={[C.main, C.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: 56, paddingBottom: 64, paddingHorizontal: 24, overflow: "hidden" }}
      >
        {/* Decorative circles */}
        <View
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: "rgba(255,255,255,0.07)",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />

        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
          Holiday Hero 🦸
        </Text>
        <Text style={{ color: C.white, fontSize: 26, fontWeight: "900", letterSpacing: -0.5 }}>
          My Profile
        </Text>
      </LinearGradient>

      {/* ── Avatar card — overlaps banner ── */}
      <View style={{ marginTop: -48, paddingHorizontal: 20 }}>
        <View
          style={{
            backgroundColor: C.white,
            borderRadius: 24,
            alignItems: "center",
            paddingVertical: 24,
            paddingHorizontal: 16,
            borderWidth: 1.5,
            borderColor: C.border,
          }}
        >
          {/* Avatar */}
          <LinearGradient
            colors={[C.main, C.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 14,
              borderWidth: 4,
              borderColor: C.white,
            }}
          >
            <Text style={{ color: C.white, fontWeight: "900", fontSize: 32 }}>{avatarLetter}</Text>
          </LinearGradient>

          {/* Name — editable */}
          {editingName ? (
            <View style={{ width: "100%", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                style={{
                  borderWidth: 1.5,
                  borderColor: C.main,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  fontSize: 18,
                  fontWeight: "800",
                  color: C.text,
                  textAlign: "center",
                  width: "80%",
                  backgroundColor: C.background,
                }}
              />
              <LinearGradient
                colors={[C.main, C.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 30 }}
              >
                <TouchableOpacity onPress={handleSave} style={{ paddingHorizontal: 28, paddingVertical: 10 }}>
                  <Text style={{ color: C.white, fontWeight: "800", fontSize: 14 }}>✓ Save</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            <>
              <Text style={{ color: C.text, fontWeight: "800", fontSize: 22, letterSpacing: -0.3, marginBottom: 3 }}>
                {displayName}
              </Text>

              {/* Handle */}
              <Text style={{ color: C.main, fontWeight: "600", fontSize: 13, marginBottom: 18 }}>
                {user?.email ? `@${user.email.split("@")[0]}` : "@user"}
              </Text>

              {/* Edit Profile button */}
              <LinearGradient
                colors={[C.main, C.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 30 }}
              >
                <TouchableOpacity onPress={handleEdit} style={{ paddingHorizontal: 28, paddingVertical: 10 }}>
                  <Text style={{ color: C.white, fontWeight: "800", fontSize: 14 }}>✏️ Edit Profile</Text>
                </TouchableOpacity>
              </LinearGradient>
            </>
          )}
        </View>
      </View>

      {/* ── Stats row ── */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 14,
          backgroundColor: C.white,
          borderRadius: 20,
          paddingVertical: 18,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          borderWidth: 1.5,
          borderColor: C.border,
        }}
      >
        <StatBlock value="0" label="Posts" />
        <View style={{ width: 1, height: 36, backgroundColor: C.border }} />
        <StatBlock value="0" label="Followers" />
        <View style={{ width: 1, height: 36, backgroundColor: C.border }} />
        <StatBlock value="0" label="Following" />
      </View>

      {/* ── Recent Posts ── */}
      <View style={{ marginHorizontal: 20, marginTop: 24 }}>
        <Text style={{ color: C.text, fontWeight: "700", fontSize: 17, marginBottom: 14 }}>Recent Posts</Text>

        <View
          style={{
            backgroundColor: C.white,
            borderRadius: 20,
            alignItems: "center",
            paddingVertical: 40,
            borderWidth: 1.5,
            borderColor: C.border,
          }}
        >
          <Text style={{ fontSize: 40, marginBottom: 10 }}>🏡</Text>
          <Text style={{ color: C.text, fontWeight: "700", fontSize: 16, marginBottom: 4 }}>No posts yet</Text>
          <Text style={{ color: C.subtext, fontSize: 13, textAlign: "center", maxWidth: 220 }}>
            Share your first holiday decoration to get started!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
