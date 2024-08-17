// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

// import globals from "globals";

export default tseslint.config(
  { ignores: ["dist"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      // globals: {
      //   ...globals.builtin,
      //   ...globals.browser,
      //   ...globals.es2024,
      //   ...globals.node,
      // },
      parserOptions: {
        // projectService: {
        //   allowDefaultProject: ["*.config.*"],
        //   defaultProject: "tsconfig.json",
        // },
        project: true,
        tsconfigRootDir: import.meta.dirname,
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
  },
  {
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },
);
