export default {
  expo: {
    name: "Contractor Report",
    slug: "contractor-report-mobile",
    version: "1.0.0",
    orientation: "portrait",
    jsEngine: "hermes", // 👈 agregado aquí
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.contractor.report"
    },
    android: {
      usesCleartextTraffic: true,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.contractor.report"
    },
    extra: {
      eas: {
        projectId: "8c707645-4115-494f-9109-7f8138bdd15e"
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL
    }
  }
};