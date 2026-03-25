import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import {
  firestoreAddDoc,
  firestoreGetDocs,
} from "@/services/firebaseCompat";

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

interface Post {
  id: string;
  uid: string;
  user: string;
  avatar: string;
  distance: string;
  location: string;
  holiday: string;
  title: string;
  description: string;
  participants: number;
  shares: number;
  howToJoin: string;
  tags: string[];
  timeAgo: string;
  createdAtMs: number;
  imageUri?: string;
}

interface PostCardProps {
  post: Post;
  onJoin: (post: Post) => void;
}

interface NewPostForm {
  user: string;
  location: string;
  holiday: string;
  title: string;
  description: string;
  howToJoin: string;
  tags: string;
  imageUri: string;
}

interface CreatePostModalProps {
  uid: string;
  onSubmit: (draft: Omit<Post, "id">) => Promise<void>;
  onClose: () => void;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const HOLIDAY_OPTIONS = [
  "Christmas", "Hanukkah", "Lunar New Year", "Diwali",
  "Kwanzaa", "Easter", "Halloween", "Thanksgiving", "Other",
];

const AVATAR_MAP: Record<string, string> = {
  Christmas: "🎄", Hanukkah: "🕎", "Lunar New Year": "🏮",
  Diwali: "🪔", Kwanzaa: "🕯️", Easter: "🐣",
  Halloween: "🎃", Thanksgiving: "🦃", Other: "🌟",
};

const EMPTY_FORM: NewPostForm = {
  user: "", location: "", holiday: "Christmas",
  title: "", description: "", howToJoin: "", tags: "", imageUri: "",
};

const TABS = ["📍 Nearby", "🔥 Trending", "🌍 All"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function getTimeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function docToPost(doc: Record<string, any>): Post {
  return {
    id: doc.id,
    uid: doc.uid ?? "",
    user: doc.user ?? "Unknown",
    avatar: doc.avatar ?? "🌟",
    distance: doc.distance ?? "Nearby",
    location: doc.location ?? "",
    holiday: doc.holiday ?? "Other",
    title: doc.title ?? "",
    description: doc.description ?? "",
    participants: doc.participants ?? 1,
    shares: doc.shares ?? 0,
    howToJoin: doc.howToJoin ?? "",
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    timeAgo: getTimeAgo(doc.createdAtMs ?? Date.now()),
    createdAtMs: doc.createdAtMs ?? Date.now(),
    imageUri: doc.imageUri || undefined,
  };
}

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── PostCard ───────────────────────────────────────────────────────────────────

function PostCard({ post, onJoin }: PostCardProps) {
  const [joined, setJoined]     = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [shared, setShared]     = useState(false);

  return (
    <View style={{ backgroundColor: C.white, borderRadius: 20, overflow: "hidden", borderWidth: 1.5, borderColor: C.border, marginBottom: 20 }}>

      <View style={{ padding: 16 }}>
        {/* User row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <LinearGradient
            colors={[C.main, C.secondary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center", flexShrink: 0 }}
          >
            <Text style={{ fontSize: 22 }}>{post.avatar}</Text>
          </LinearGradient>

          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700", fontSize: 15, color: C.text }}>{post.user}</Text>
            <Text style={{ fontSize: 12, color: C.subtext }}>
              📍 {post.location} · <Text style={{ color: C.main }}>{post.distance}</Text>
            </Text>
          </View>

          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <View style={{ backgroundColor: C.background, borderWidth: 1, borderColor: C.border, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
              <Text style={{ color: C.main, fontSize: 11, fontWeight: "700" }}>{post.holiday}</Text>
            </View>
            <Text style={{ fontSize: 11, color: C.subtext }}>{post.timeAgo}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={{ fontWeight: "800", fontSize: 17, color: C.text, marginBottom: 6, lineHeight: 24 }}>
          {post.title}
        </Text>

        {/* Description */}
        <Text style={{ fontSize: 14, color: C.subtext, lineHeight: 22, marginBottom: 10 }}>
          {post.description}
        </Text>

        {/* Tags */}
        {post.tags.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
            {post.tags.map((tag) => (
              <View key={tag} style={{ backgroundColor: C.background, paddingHorizontal: 9, paddingVertical: 2, borderRadius: 20 }}>
                <Text style={{ color: C.main, fontSize: 12, fontWeight: "600" }}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Post image */}
      {post.imageUri ? (
        <Image
          source={{ uri: post.imageUri }}
          style={{ width: "100%", height: 220 }}
          resizeMode="cover"
        />
      ) : null}

      {/* How to Join */}
      <View style={{ marginHorizontal: 16, marginVertical: 14, backgroundColor: C.background, borderWidth: 1.5, borderColor: C.secondary, borderStyle: "dashed", borderRadius: 12, overflow: "hidden" }}>
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={{ paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Text style={{ fontWeight: "700", fontSize: 13, color: C.main }}>📋 How to Get Involved</Text>
          <Text style={{ color: C.subtext, fontSize: 12 }}>{expanded ? "▲" : "▼"}</Text>
        </TouchableOpacity>
        {expanded && (
          <Text style={{ paddingHorizontal: 14, paddingBottom: 12, fontSize: 13, color: C.subtext, lineHeight: 20 }}>
            {post.howToJoin}
          </Text>
        )}
      </View>

      {/* Stats + Actions */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.background }}>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <Text style={{ fontSize: 13, color: C.subtext }}>
            <Text style={{ fontWeight: "700", color: C.text }}>{post.participants + (joined ? 1 : 0)}</Text> joining
          </Text>
          <Text style={{ fontSize: 13, color: C.subtext }}>
            <Text style={{ fontWeight: "700", color: C.text }}>{post.shares + (shared ? 1 : 0)}</Text> shares
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setShared(!shared)}
            style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: shared ? C.background : C.white }}
          >
            <Text style={{ fontWeight: "700", fontSize: 13, color: shared ? C.main : C.subtext }}>
              {shared ? "✓ Shared" : "↗ Share"}
            </Text>
          </TouchableOpacity>

          <LinearGradient
            colors={joined ? [C.accent, C.main] : [C.main, C.secondary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20 }}
          >
            <TouchableOpacity
              onPress={() => { setJoined(!joined); if (!joined) onJoin(post); }}
              style={{ paddingHorizontal: 18, paddingVertical: 7 }}
            >
              <Text style={{ color: C.white, fontWeight: "800", fontSize: 13 }}>
                {joined ? "✓ I'm In!" : "🙋 Join"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

// ── Create Post Modal ──────────────────────────────────────────────────────────

function CreatePostModal({ uid, onSubmit, onClose }: CreatePostModalProps) {
  const [form, setForm]       = useState<NewPostForm>(EMPTY_FORM);
  const [error, setError]     = useState("");
  const [holidayOpen, setHolidayOpen] = useState(false);
  const [saving, setSaving]   = useState(false);

  const set = (field: keyof NewPostForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setForm((prev) => ({ ...prev, imageUri: result.assets[0].uri }));
    }
  };

  const handleSubmit = async () => {
    if (!form.user || !form.location || !form.title || !form.description || !form.howToJoin) {
      setError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    const now = Date.now();
    const draft: Omit<Post, "id"> = {
      uid,
      user: form.user,
      avatar: AVATAR_MAP[form.holiday] ?? "🌟",
      distance: "Your area",
      location: form.location,
      holiday: form.holiday,
      title: form.title,
      description: form.description,
      participants: 1,
      shares: 0,
      howToJoin: form.howToJoin,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => t.startsWith("#") ? t : `#${t}`),
      timeAgo: "Just now",
      createdAtMs: now,
      imageUri: form.imageUri || undefined,
    };
    try {
      await onSubmit(draft);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
    backgroundColor: C.background, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: C.text,
  };

  const labelStyle = {
    fontSize: 11, fontWeight: "700" as const, color: C.subtext,
    marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: 0.5,
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
        <View style={{ backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "900", color: C.text }}>🎉 Create a Post</Text>
            <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.background, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: C.subtext }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={{ gap: 14 }}>

              <View>
                <Text style={labelStyle}>Your Name *</Text>
                <TextInput style={inputStyle} placeholder="e.g. Sarah M." value={form.user} onChangeText={set("user")} placeholderTextColor={C.border} />
              </View>

              <View>
                <Text style={labelStyle}>Location / Street *</Text>
                <TextInput style={inputStyle} placeholder="e.g. Oak Street & 5th Ave" value={form.location} onChangeText={set("location")} placeholderTextColor={C.border} />
              </View>

              {/* Holiday picker */}
              <View>
                <Text style={labelStyle}>Holiday *</Text>
                <TouchableOpacity onPress={() => setHolidayOpen(!holidayOpen)} style={{ ...inputStyle, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 14, color: C.text }}>{form.holiday}</Text>
                  <Text style={{ color: C.subtext }}>{holidayOpen ? "▲" : "▼"}</Text>
                </TouchableOpacity>
                {holidayOpen && (
                  <View style={{ borderWidth: 1.5, borderColor: C.border, borderRadius: 12, backgroundColor: C.white, marginTop: 4, overflow: "hidden" }}>
                    {HOLIDAY_OPTIONS.map((h) => (
                      <TouchableOpacity key={h} onPress={() => { set("holiday")(h); setHolidayOpen(false); }} style={{ paddingHorizontal: 14, paddingVertical: 11, backgroundColor: form.holiday === h ? C.background : C.white, borderBottomWidth: 1, borderBottomColor: C.background }}>
                        <Text style={{ fontSize: 14, color: form.holiday === h ? C.main : C.text, fontWeight: form.holiday === h ? "700" : "400" }}>{h}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View>
                <Text style={labelStyle}>Post Title *</Text>
                <TextInput style={inputStyle} placeholder="e.g. Bringing Back the Lights!" value={form.title} onChangeText={set("title")} placeholderTextColor={C.border} />
              </View>

              <View>
                <Text style={labelStyle}>Description *</Text>
                <TextInput style={{ ...inputStyle, minHeight: 90, textAlignVertical: "top" }} placeholder="Tell the neighborhood what you're planning..." value={form.description} onChangeText={set("description")} multiline placeholderTextColor={C.border} />
              </View>

              <View>
                <Text style={labelStyle}>How to Get Involved *</Text>
                <TextInput style={{ ...inputStyle, minHeight: 72, textAlignVertical: "top" }} placeholder="Contact info, meeting spot, time, etc." value={form.howToJoin} onChangeText={set("howToJoin")} multiline placeholderTextColor={C.border} />
              </View>

              <View>
                <Text style={labelStyle}>Tags (comma separated)</Text>
                <TextInput style={inputStyle} placeholder="ChristmasLights, OakStreet" value={form.tags} onChangeText={set("tags")} placeholderTextColor={C.border} />
              </View>

              {/* Image picker */}
              <View>
                <Text style={labelStyle}>Photo (optional)</Text>
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    borderWidth: 1.5,
                    borderColor: form.imageUri ? C.main : C.border,
                    borderRadius: 12,
                    borderStyle: "dashed",
                    backgroundColor: C.background,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    minHeight: form.imageUri ? 160 : 64,
                  }}
                >
                  {form.imageUri ? (
                    <Image source={{ uri: form.imageUri }} style={{ width: "100%", height: 160 }} resizeMode="cover" />
                  ) : (
                    <Text style={{ color: C.subtext, fontSize: 14, paddingVertical: 18 }}>📷 Tap to add a photo</Text>
                  )}
                </TouchableOpacity>
                {form.imageUri ? (
                  <TouchableOpacity onPress={() => setForm((prev) => ({ ...prev, imageUri: "" }))} style={{ marginTop: 6, alignSelf: "flex-end" }}>
                    <Text style={{ color: C.accent, fontSize: 12, fontWeight: "600" }}>✕ Remove photo</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {error !== "" && (
                <Text style={{ color: C.accent, fontSize: 13, fontWeight: "600" }}>⚠️ {error}</Text>
              )}

              <LinearGradient colors={saving ? [C.border, C.border] : [C.main, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, marginTop: 4 }}>
                <TouchableOpacity onPress={handleSubmit} disabled={saving} style={{ paddingVertical: 14, alignItems: "center" }}>
                  {saving
                    ? <ActivityIndicator color={C.white} />
                    : <Text style={{ color: C.white, fontWeight: "800", fontSize: 16 }}>🚀 Post to the Neighborhood</Text>
                  }
                </TouchableOpacity>
              </LinearGradient>

            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Feed Screen ────────────────────────────────────────────────────────────────

export default function HolidayHeroFeed() {
  const { user }                  = useAuth();
  const [posts, setPosts]         = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("📍 Nearby");
  const [loading, setLoading]     = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadPosts = async () => {
    try {
      const docs = await firestoreGetDocs("posts");
      const loaded = docs.map(docToPost);
      setPosts(shuffled(loaded));
    } catch (e) {
      console.error("Failed to load posts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleNewPost = async (draft: Omit<Post, "id">) => {
    const docId = await firestoreAddDoc("posts", draft);
    const post: Post = { ...draft, id: docId };
    setPosts((prev) => [post, ...prev]);
    setShowModal(false);
    showToast("Your post is live! 🎉");
  };

  const handleJoin = (post: Post) => showToast(`You joined "${post.title}"! 🙋`);

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>

      {/* Toast */}
      {toast && (
        <View style={{ position: "absolute", top: 60, alignSelf: "center", zIndex: 9999 }}>
          <LinearGradient colors={[C.main, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 30, paddingHorizontal: 24, paddingVertical: 12 }}>
            <Text style={{ color: C.white, fontWeight: "700", fontSize: 14 }}>{toast}</Text>
          </LinearGradient>
        </View>
      )}

      {/* Header */}
      <LinearGradient colors={[C.main, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <View>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" }}>📍 Maplewood, NJ</Text>
            <Text style={{ fontSize: 30, fontWeight: "900", color: C.white, letterSpacing: -0.5 }}>Holiday Hero 🦸</Text>
          </View>
          {user && (
            <TouchableOpacity onPress={() => setShowModal(true)} style={{ marginTop: 8, backgroundColor: C.white, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 }}>
              <Text style={{ color: C.main, fontWeight: "800", fontSize: 14 }}>+ Post</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search */}
        <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput placeholder="Search nearby decorations..." placeholderTextColor="rgba(255,255,255,0.7)" style={{ flex: 1, fontSize: 14, color: C.white }} />
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{ paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: activeTab === tab ? C.white : "rgba(255,255,255,0.2)" }}
            >
              <Text style={{ fontWeight: "700", fontSize: 13, color: activeTab === tab ? C.main : C.white }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Feed */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={C.main} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          {posts.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 60, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 52, marginBottom: 12 }}>🏡</Text>
              <Text style={{ fontWeight: "800", fontSize: 18, color: C.text, marginBottom: 8 }}>No posts yet!</Text>
              <Text style={{ fontSize: 14, color: C.subtext, lineHeight: 22, textAlign: "center", marginBottom: 24 }}>
                Be the first to bring holiday spirit to your neighborhood.
              </Text>
              {user && (
                <LinearGradient colors={[C.main, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20 }}>
                  <TouchableOpacity onPress={() => setShowModal(true)} style={{ paddingHorizontal: 28, paddingVertical: 12 }}>
                    <Text style={{ color: C.white, fontWeight: "800", fontSize: 15 }}>🎄 Start the Tradition</Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </View>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} onJoin={handleJoin} />)
          )}
        </ScrollView>
      )}

      {/* Create Post Modal */}
      {showModal && user && (
        <CreatePostModal
          uid={user.uid}
          onSubmit={handleNewPost}
          onClose={() => setShowModal(false)}
        />
      )}

    </View>
  );
}
