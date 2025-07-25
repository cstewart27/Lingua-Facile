// Expo app.config.js for environment variables and config
export default ({ config }) => ({
  ...config,
  extra: {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL",
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY",
    EXPO_PUBLIC_SUPABASE_CALL_ANALYZE_VERBS_URL: process.env.EXPO_PUBLIC_SUPABASE_CALL_ANALYZE_VERBS_URL || "YOUR_ANALYZE_VERBS_URL",
    EXPO_PUBLIC_SUPABASE_CALL_OPENAI_URL: process.env.EXPO_PUBLIC_SUPABASE_CALL_OPENAI_URL || "YOUR_OPENAI_URL",
    EXPO_PUBLIC_SUPABASE_CONJUGATE_VERB_URL: process.env.EXPO_PUBLIC_SUPABASE_CONJUGATE_VERB_URL || "YOUR_CONJUGATE_VERB_URL",
    EXPO_PUBLIC_SUPABASE_CALL_DETECT_LANGUAGE_URL: process.env.EXPO_PUBLIC_SUPABASE_CALL_DETECT_LANGUAGE_URL || "YOUR_DETECT_LANGUAGE_URL",
    EXPO_PUBLIC_DEEPL_API_KEY: process.env.EXPO_PUBLIC_DEEPL_API_KEY || "YOUR_DEEPL_API_KEY",
    eas: {
      projectId: "781087b3-9f82-4895-b7db-bf9405b7d605"
    }
  },
});

