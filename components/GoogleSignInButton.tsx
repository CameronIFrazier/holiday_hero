// ── Add this state inside SignUpPage ──────────────────────────────────────────
// const [googleLoading, setGoogleLoading] = useState(false);
// const [googleError, setGoogleError] = useState("");

// ── Add this handler inside SignUpPage ────────────────────────────────────────
// const handleGoogleSignIn = async () => {
//   setGoogleLoading(true);
//   setGoogleError("");
//   try {
//     await signInWithGoogle();
//     // useAuth in _layout.tsx will detect the new user and redirect automatically
//   } catch (err: any) {
//     setGoogleError(getGoogleSignInError(err));
//   } finally {
//     setGoogleLoading(false);
//   }
// };

// ── Add this JSX in Step 1, just above the "Already have an account?" Text ───

import { ActivityIndicator, View, Text, TouchableOpacity } from "react-native";

const C = {
  main: "#f97316",
  accent: "#ff3d00",
  subtext: "#757575",
  border: "#ffcc80",
  white: "#ffffff",
  text: "#212121",
};

export function GoogleSignInButton({
  onPress,
  loading,
  error,
}: {
  onPress: () => void;
  loading: boolean;
  error: string;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      {/* Divider */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        <Text style={{ marginHorizontal: 10, fontSize: 12, color: C.subtext, fontWeight: "600" }}>
          or continue with
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
      </View>

      {/* Google button */}
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          paddingVertical: 13,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: C.border,
          backgroundColor: C.white,
        }}
      >
        {loading ? (
          <ActivityIndicator color={C.main} />
        ) : (
          <>
            {/* Google "G" logo rendered with colored text */}
            <Text style={{ fontSize: 20, fontWeight: "900", color: "#4285F4" }}>G</Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: C.text }}>
              Sign in with Google
            </Text>
          </>
        )}
      </TouchableOpacity>

      {error !== "" && (
        <Text style={{ marginTop: 6, fontSize: 12, color: C.accent, fontWeight: "600", textAlign: "center" }}>
          ⚠️ {error}
        </Text>
      )}
    </View>
  );
}