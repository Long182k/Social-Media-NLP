import { createClient } from "graphql-ws";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { useAppStore } from "../store";

const state = useAppStore.getState();
const token = state.userInfo.accessToken;

// Build WebSocket URL automatically from server URL (http -> ws, https -> wss)
const serverUrl =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000/api";
const overrideWsUrl = import.meta.env.VITE_WS_URL;
const baseForWs = overrideWsUrl || serverUrl;

// http(s) -> ws(s)
const wsBase = baseForWs.replace(/^http(s?):\/\//, "ws$1://");
console.log("🚀 ~ wsBase:", wsBase);
// Append GraphQL path
const wsUrl = `${wsBase}/graphql`;

console.log(`Check WebSocket URL: ${wsUrl}`);

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUrl,
    connectionParams: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    on: {
      connected: () => console.log("✅ GraphQL WebSocket connected"),
      closed: (event) => console.log("❌ GraphQL WebSocket closed:", event),
      error: (err) => console.error("⚠️ GraphQL WebSocket error:", err),
    },
  })
);

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_SERVER_URL + "/graphql",
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
});

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return (
      def.kind === "OperationDefinition" && def.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
