import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/auth.tsx"),
  route(":username", "routes/$username.tsx"),
] satisfies RouteConfig;
