import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only auto-cleans when afterEach is a global, and Vitest
// globals are off, so unmount rendered components between tests here.
afterEach(() => {
  cleanup();
});
