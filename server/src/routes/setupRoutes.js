// Import necessary route modules
import entryRoutes from "./entry.js";
import authRoutes from "./auth.js";
/**
 * Mounts routes to the Express application.
 * @param {Object} app - Express application instance.
 */
export function mountRoutes(app) {
  // Mount routes under their respective base paths
  app.use("/auth", authRoutes);
  app.use("/entry", entryRoutes);
}
