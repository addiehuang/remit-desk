// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

// Design system guard rails.
//
// Note on `no-restricted-syntax`: when two flat config objects match the same
// file, the later one REPLACES the rule options rather than merging them. Every
// selector that should also apply to pages is therefore repeated in the page
// block below. Dropping that repetition would silently disable the colour check
// inside src/app.
const noHardCodedColour = [
  {
    selector:
      "Literal[value=/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\\b/]",
    message:
      "Hard coded colour. Use a token utility, or var(--color-*) from tokens.css.",
  },
  {
    selector:
      "TemplateElement[value.raw=/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\\b/]",
    message:
      "Hard coded colour in a template literal. Use a token utility, or var(--color-*) from tokens.css.",
  },
  {
    selector: "Literal[value=/\\b(?:rgb|rgba|hsl|hsla|oklch)\\(/]",
    message:
      "Hard coded colour function. Use a token utility, or var(--color-*) from tokens.css.",
  },
];

const noNativeControls = [
  {
    selector: "JSXOpeningElement[name.name='button']",
    message:
      "Use the Button component. A native button in a page bypasses the design system.",
  },
  {
    selector: "JSXOpeningElement[name.name='input']",
    message:
      "Use TextInput or MoneyInput. A native input in a page bypasses the design system.",
  },
  {
    selector: "JSXOpeningElement[name.name='select']",
    message: "Use a design system control instead of a native select.",
  },
  {
    selector: "JSXOpeningElement[name.name='textarea']",
    message: "Use a design system control instead of a native textarea.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...storybook.configs["flat/recommended"],
  // Full accessibility rule set. eslint-config-next bundles a subset of these as
  // warnings; strict promotes them to errors and adds the rest, which is the
  // point of having the gate at all. Placed after the Next config so it wins.
  //
  // Only the rules are taken, not the whole flat config. eslint-config-next has
  // already registered the jsx-a11y plugin, and flat config refuses to let a
  // plugin name be defined twice.
  {
    name: "remit-desk/accessibility-strict",
    files: ["src/**/*.{ts,tsx}"],
    rules: jsxA11y.flatConfigs.strict.rules,
  },
  {
    name: "remit-desk/no-hard-coded-colour",
    files: ["src/**/*.{ts,tsx}"],
    rules: { "no-restricted-syntax": ["error", ...noHardCodedColour] },
  },
  {
    name: "remit-desk/pages-use-design-system",
    files: ["src/app/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...noHardCodedColour,
        ...noNativeControls,
      ],
    },
  },
]);

export default eslintConfig;
