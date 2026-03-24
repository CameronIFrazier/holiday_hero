import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// ── Theme tokens (mirrors your global.css variables) ───────────────────────────
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

interface RecentPostCardProps {
  title: string;
  holiday: string;
  avatar: string;
  participants: number;
  timeAgo: string;
  location: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const RECENT_POSTS: RecentPostCardProps[] = [
  {
    title: "Bringing Back the Lights on Oak Street!",
    holiday: "Christmas",
    avatar: "🎄",
    participants: 14,
    timeAgo: "2h ago",
    location: "Oak Street & 5th Ave",
  },
  {
    title: "Front Yard Harvest Festival Display",
    holiday: "Thanksgiving",
    avatar: "🦃",
    participants: 7,
    timeAgo: "3d ago",
    location: "Maple Drive",
  },
];

const BADGES = [
  { emoji: "🎄", label: "Christmas" },
  { emoji: "🦃", label: "Thanksgiving" },
  { emoji: "🎃", label: "Halloween" },
];

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

// ── RecentPostCard ─────────────────────────────────────────────────────────────

function RecentPostCard({ title, holiday, avatar, participants, timeAgo, location }: RecentPostCardProps) {
  return (
    <View
      style={{
        backgroundColor: C.white,
        borderRadius: 20,
        marginBottom: 14,
        overflow: "hidden",
        borderWidth: 1.5,
        borderColor: C.border,
      }}
    >
      {/* Top strip */}
      <View
        style={{
          backgroundColor: "#fff3e0",
          paddingHorizontal: 14,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 18 }}>{avatar}</Text>
          <Text style={{ color: C.main, fontWeight: "700", fontSize: 13 }}>{holiday}</Text>
        </View>
        <Text style={{ color: C.subtext, fontSize: 12 }}>{timeAgo}</Text>
      </View>

      {/* Body */}
      <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
        <Text style={{ color: C.text, fontWeight: "700", fontSize: 15, lineHeight: 22, marginBottom: 8 }}>
          {title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: C.subtext, fontSize: 12 }}>📍 {location}</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff3e0",
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 12 }}>🙋</Text>
            <Text style={{ color: C.main, fontSize: 12, fontWeight: "700" }}>{participants} joining</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Profile Screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen() {
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
            <Text style={{ color: C.white, fontWeight: "900", fontSize: 32 }}>U</Text>
          </LinearGradient>

          {/* Name */}
          <Text style={{ color: C.text, fontWeight: "800", fontSize: 22, letterSpacing: -0.3, marginBottom: 3 }}>
            User Name
          </Text>

          {/* Handle */}
          <Text style={{ color: C.main, fontWeight: "600", fontSize: 13, marginBottom: 8 }}>
            @username
          </Text>

          {/* Bio */}
          <Text style={{ color: C.subtext, fontSize: 13, textAlign: "center", lineHeight: 20, maxWidth: 260, marginBottom: 18 }}>
            Loves decorating, coffee, and holiday spirit! 🎄
          </Text>

          {/* Edit Profile button */}
          <LinearGradient
            colors={[C.main, C.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 30 }}
          >
            <TouchableOpacity style={{ paddingHorizontal: 28, paddingVertical: 10 }}>
              <Text style={{ color: C.white, fontWeight: "800", fontSize: 14 }}>✏️ Edit Profile</Text>
            </TouchableOpacity>
          </LinearGradient>
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
        <StatBlock value="42" label="Posts" />
        <View style={{ width: 1, height: 36, backgroundColor: C.border }} />
        <StatBlock value="1.2k" label="Followers" />
        <View style={{ width: 1, height: 36, backgroundColor: C.border }} />
        <StatBlock value="256" label="Following" />
      </View>

      {/* ── Holidays Celebrated badges ── */}
      <View style={{ marginHorizontal: 20, marginTop: 18 }}>
        <Text style={{ color: C.text, fontWeight: "700", fontSize: 16, marginBottom: 10 }}>
          🏅 Holidays Celebrated
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {BADGES.map((badge) => (
            <View
              key={badge.label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#fff3e0",
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <Text style={{ fontSize: 16 }}>{badge.emoji}</Text>
              <Text style={{ color: C.main, fontWeight: "600", fontSize: 12 }}>{badge.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Recent Posts ── */}
      <View style={{ marginHorizontal: 20, marginTop: 24 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ color: C.text, fontWeight: "700", fontSize: 17 }}>Recent Posts</Text>
          <Text style={{ color: C.main, fontWeight: "600", fontSize: 13 }}>See all →</Text>
        </View>

        {RECENT_POSTS.length === 0 ? (
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
        ) : (
          RECENT_POSTS.map((post) => (
            <RecentPostCard key={post.title} {...post} />
          ))
        )}
      </View>
    </ScrollView>
  );
}