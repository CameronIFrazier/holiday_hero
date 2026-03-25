import { LinearGradient } from "expo-linear-gradient";
import { signInWithGoogle, getGoogleSignInError } from '@/services/googleAuthService';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { router } from 'expo-router';
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { signUp } from "@/services/authService";

// ── Theme tokens (mirrors global.css) ─────────────────────────────────────────
const C = {
  main:       "#f97316",
  secondary:  "#ffb74d",
  accent:     "#ff3d00",
  background: "#fff3e0",
  text:       "#212121",
  subtext:    "#757575",
  border:     "#ffcc80",
  white:      "#ffffff",
  error:      "#ff3d00",
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface SignUpForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface FieldError {
  [key: string]: string;
}

interface SignUpPageProps {
  onComplete?: () => void; // called after successful sign-up (e.g. navigate to feed)
}

// ── Constants ──────────────────────────────────────────────────────────────────

const EMPTY_FORM: SignUpForm = {
  firstName: "", lastName: "", username: "",
  email: "", phone: "", password: "", confirmPassword: "",
  street: "", city: "", state: "", zip: "",
};

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const STEP_META = [
  { icon: "👤", title: "Who are you?",        subtitle: "Set up your identity on Holiday Hero." },
  { icon: "🔐", title: "Secure your account", subtitle: "Your info stays private and protected."  },
  { icon: "📍", title: "Where do you live?",  subtitle: "We use this to show you nearby events."  },
];

// ── Validation ─────────────────────────────────────────────────────────────────

function validateStep(step: number, form: SignUpForm): FieldError {
  const e: FieldError = {};
  if (step === 1) {
    if (!form.firstName.trim())   e.firstName = "First name is required.";
    if (!form.lastName.trim())    e.lastName  = "Last name is required.";
    if (!form.username.trim())    e.username  = "Username is required.";
    else if (form.username.includes(" ")) e.username = "No spaces allowed.";
    else if (form.username.length < 3)    e.username = "At least 3 characters.";
  }
  if (step === 2) {
    if (!form.email.trim())  e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.phone.trim())  e.phone = "Phone number is required.";
    else if (!/^\+?[\d\s\-().]{7,}$/.test(form.phone)) e.phone = "Enter a valid phone number.";
    if (!form.password)      e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "At least 8 characters.";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match.";
  }
  if (step === 3) {
    if (!form.street.trim()) e.street = "Street address is required.";
    if (!form.city.trim())   e.city   = "City is required.";
    if (!form.state)         e.state  = "State is required.";
    if (!form.zip.trim())    e.zip    = "ZIP code is required.";
    else if (!/^\d{5}(-\d{4})?$/.test(form.zip)) e.zip = "Enter a valid ZIP.";
  }
  return e;
}

// ── InputField ─────────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  hint?: string;
  prefix?: string;
}

function InputField({
  label, value, onChange, placeholder,
  secureTextEntry = false, keyboardType = "default",
  autoCapitalize = "sentences", error, hint, prefix,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: error ? C.error : C.subtext, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.8 }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 2, borderColor: error ? C.error : focused ? C.main : C.border, backgroundColor: C.white }}>
        {prefix && <Text style={{ paddingLeft: 14, fontSize: 14, color: C.subtext }}>{prefix}</Text>}
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={C.border}
          secureTextEntry={secureTextEntry && !visible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: C.text }}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setVisible(!visible)} style={{ paddingHorizontal: 14 }}>
            <Text style={{ fontSize: 16 }}>{visible ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        )}
      </View>
      {(error || hint) && (
        <Text style={{ marginTop: 4, fontSize: 12, color: error ? C.error : C.subtext }}>{error ?? hint}</Text>
      )}
    </View>
  );
}

// ── StatePickerField ───────────────────────────────────────────────────────────

function StatePickerField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 14, flex: 1 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: error ? C.error : C.subtext, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.8 }}>
        State
      </Text>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={{ borderRadius: 14, borderWidth: 2, borderColor: error ? C.error : C.border, backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 13, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <Text style={{ fontSize: 15, color: value ? C.text : C.border }}>{value || "State"}</Text>
        <Text style={{ color: C.subtext, fontSize: 12 }}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {error && <Text style={{ marginTop: 4, fontSize: 12, color: C.error }}>{error}</Text>}
      {open && (
        <View style={{ borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, maxHeight: 180, marginTop: 4, overflow: "hidden" }}>
          <ScrollView nestedScrollEnabled>
            {US_STATES.map((s) => (
              <TouchableOpacity key={s} onPress={() => { onChange(s); setOpen(false); }} style={{ paddingHorizontal: 16, paddingVertical: 11, backgroundColor: value === s ? C.background : C.white, borderBottomWidth: 1, borderBottomColor: C.background }}>
                <Text style={{ fontSize: 14, color: value === s ? C.main : C.text, fontWeight: value === s ? "700" : "400" }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ── StepIndicator ──────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i + 1 < current;
        const active = i + 1 === current;
        return (
          <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
            {active ? (
              <LinearGradient colors={[C.main, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: C.white, fontWeight: "800", fontSize: 14 }}>{i + 1}</Text>
              </LinearGradient>
            ) : (
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: done ? C.main : C.border, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: done ? C.white : C.subtext, fontWeight: "700", fontSize: 13 }}>{done ? "✓" : i + 1}</Text>
              </View>
            )}
            {i < total - 1 && <View style={{ width: 32, height: 2, backgroundColor: done ? C.main : C.border, marginHorizontal: 4 }} />}
          </View>
        );
      })}
    </View>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SignUpPage({ onComplete }: SignUpPageProps) {
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState<SignUpForm>(EMPTY_FORM);
  const [errors, setErrors]     = useState<FieldError>({});
  const [loading, setLoading]   = useState(false);
  const [firebaseError, setFirebaseError] = useState("");
  const [done, setDone]         = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);
const [googleError, setGoogleError] = useState("");

const handleGoogleSignIn = async () => {
  setGoogleLoading(true);
  setGoogleError("");
  try {
    await signInWithGoogle();
  } catch (err: any) {
    setGoogleError(getGoogleSignInError(err));
    console.log("GOOGLE ERROR CODE:", err?.code);
    console.log("GOOGLE ERROR MESSAGE:", err?.message);
    console.log("GOOGLE ERROR FULL:", JSON.stringify(err));
    setGoogleError(getGoogleSignInError(err));
  } finally {
    setGoogleLoading(false);
  }
};
  const set = (field: keyof SignUpForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setFirebaseError("");
  };

  const handleNext = async () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }
    setErrors({});

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // ── Final step: create account in Firebase ──
    setLoading(true);
    try {
      await signUp(form.email, form.password, {
        firstName: form.firstName,
        lastName:  form.lastName,
        username:  form.username,
        email:     form.email,
        phone:     form.phone,
        address: {
          street: form.street,
          city:   form.city,
          state:  form.state,
          zip:    form.zip,
        },
      });
      setDone(true);
      router.replace('/(tabs)/index' as any);
      onComplete?.();
    } catch (err: any) {
      // Map Firebase error codes to friendly messages
      const code: string = err?.code ?? "";
      if (code === "auth/email-already-in-use") {
        setFirebaseError("That email is already registered. Try signing in instead.");
      } else if (code === "auth/invalid-email") {
        setFirebaseError("That email address doesn't look right.");
      } else if (code === "auth/weak-password") {
        setFirebaseError("Password is too weak. Use at least 8 characters.");
      } else {
        setFirebaseError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const meta = STEP_META[step - 1];

  // ── Success ────────────────────────────────────────────────────────────────

  if (done) {
    return (
      <LinearGradient colors={[C.main, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <Text style={{ fontSize: 72, marginBottom: 16 }}>🎄</Text>
        <Text style={{ fontSize: 28, fontWeight: "900", color: C.white, marginBottom: 10, letterSpacing: -0.5 }}>
          Welcome, {form.firstName}!
        </Text>
        <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 24, marginBottom: 28, maxWidth: 280 }}>
          You're officially a Holiday Hero. Time to bring the spirit back to {form.city}!
        </Text>
        <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text style={{ color: C.white, fontWeight: "700", fontSize: 14 }}>@{form.username}</Text>
        </View>
      </LinearGradient>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Banner */}
        <LinearGradient colors={[C.main, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 56, paddingBottom: 64, paddingHorizontal: 24, overflow: "hidden" }}>
          <View style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.08)" }} />
          <View style={{ position: "absolute", bottom: -20, left: -20, width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.06)" }} />
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Holiday Hero 🦸</Text>
          <Text style={{ fontSize: 28, fontWeight: "900", color: C.white, marginBottom: 4, letterSpacing: -0.5 }}>Create Account</Text>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>Step {step} of 3 — {meta.subtitle}</Text>
        </LinearGradient>

        {/* Card */}
        <View style={{ backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40, flex: 1 }}>
          <StepIndicator current={step} total={3} />

          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Text style={{ fontSize: 34, marginBottom: 6 }}>{meta.icon}</Text>
            <Text style={{ fontSize: 20, fontWeight: "900", color: C.text, marginBottom: 4 }}>{meta.title}</Text>
            <Text style={{ fontSize: 13, color: C.subtext }}>{meta.subtitle}</Text>
          </View>

          {/* Step 1 */}
          {step === 1 && (
            <>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}><InputField label="First Name" value={form.firstName} onChange={set("firstName")} placeholder="Jane" autoCapitalize="words" error={errors.firstName} /></View>
                <View style={{ flex: 1 }}><InputField label="Last Name" value={form.lastName} onChange={set("lastName")} placeholder="Smith" autoCapitalize="words" error={errors.lastName} /></View>
              </View>
              <InputField label="Username" value={form.username} onChange={set("username")} placeholder="holiday_jane" autoCapitalize="none" prefix="@" error={errors.username} hint="This is how others will find you." />
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <InputField label="Email Address" value={form.email} onChange={set("email")} placeholder="jane@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
              <InputField label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="(555) 000-0000" keyboardType="phone-pad" error={errors.phone} hint="So neighbors can reach you about your posts." />
              <InputField label="Password" value={form.password} onChange={set("password")} placeholder="Min. 8 characters" secureTextEntry autoCapitalize="none" error={errors.password} />
              <InputField label="Confirm Password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Re-enter your password" secureTextEntry autoCapitalize="none" error={errors.confirmPassword} />
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <View style={{ backgroundColor: C.background, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 16 }}>
                <Text style={{ fontSize: 13, color: C.subtext, lineHeight: 20 }}>
                  🔒 Your address is only used to show you{" "}
                  <Text style={{ color: C.text, fontWeight: "700" }}>nearby holiday events</Text>. It is never shown publicly.
                </Text>
              </View>
              <InputField label="Street Address" value={form.street} onChange={set("street")} placeholder="123 Maple Ave" error={errors.street} />
              <InputField label="City" value={form.city} onChange={set("city")} placeholder="Maplewood" autoCapitalize="words" error={errors.city} />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <StatePickerField value={form.state} onChange={set("state")} error={errors.state} />
                <View style={{ flex: 1 }}><InputField label="ZIP Code" value={form.zip} onChange={set("zip")} placeholder="07040" keyboardType="numeric" error={errors.zip} /></View>
              </View>
            </>
          )}

          {/* Firebase error */}
          {firebaseError !== "" && (
            <View style={{ backgroundColor: "#fff0f0", borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: C.error }}>
              <Text style={{ color: C.error, fontSize: 13, fontWeight: "600" }}>⚠️ {firebaseError}</Text>
            </View>
          )}

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            {step > 1 && (
              <TouchableOpacity onPress={() => { setErrors({}); setFirebaseError(""); setStep(step - 1); }} style={{ flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 2, borderColor: C.border, alignItems: "center" }}>
                <Text style={{ color: C.text, fontWeight: "700", fontSize: 15 }}>← Back</Text>
              </TouchableOpacity>
            )}
            <LinearGradient colors={[C.main, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: step > 1 ? 2 : 1, borderRadius: 16 }}>
              <TouchableOpacity onPress={handleNext} disabled={loading} style={{ paddingVertical: 14, alignItems: "center" }}>
                {loading ? (
                  <ActivityIndicator color={C.white} />
                ) : (
                  <Text style={{ color: C.white, fontWeight: "800", fontSize: 15, letterSpacing: 0.2 }}>
                    {step === 3 ? "🎄 Create My Account" : "Continue →"}
                  </Text>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {step === 1 && (
  <>
    <GoogleSignInButton onPress={handleGoogleSignIn} loading={googleLoading} error={googleError} />
    <Text style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.subtext }}>
      Already have an account?{" "}
      <Text style={{ color: C.main, fontWeight: "700" }}>Sign In</Text>
    </Text>
  </>
)}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}