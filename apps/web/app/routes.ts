import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("dashboard", "routes/home.tsx"),
  route("login", "routes/auth.tsx"),
  route(":username", "routes/$username.tsx"),
] satisfies RouteConfig;
