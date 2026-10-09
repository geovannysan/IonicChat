import type { ReactDoctorConfig } from "react-doctor/api";

export default {
  ignore: {
    files: [
      "android/**",
      "ios/**",
      "dist/**",
      "node_modules/**",
      "cypress/**",
      "src/components/ui/map.tsx",
      "public/**"
    ],
  },
} satisfies ReactDoctorConfig;
