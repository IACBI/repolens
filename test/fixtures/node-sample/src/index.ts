import fg from "fast-glob";
import { add } from "./lib/math";

export { add };
export const files = fg.sync(["src/**/*.ts"]);
