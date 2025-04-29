/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activities from "../activities.js";
import type * as clerk from "../clerk.js";
import type * as feedbacks from "../feedbacks.js";
import type * as http from "../http.js";
import type * as lecturerDetails from "../lecturerDetails.js";
import type * as lecturers from "../lecturers.js";
import type * as studentFeedback from "../studentFeedback.js";
import type * as subjects from "../subjects.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  clerk: typeof clerk;
  feedbacks: typeof feedbacks;
  http: typeof http;
  lecturerDetails: typeof lecturerDetails;
  lecturers: typeof lecturers;
  studentFeedback: typeof studentFeedback;
  subjects: typeof subjects;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
