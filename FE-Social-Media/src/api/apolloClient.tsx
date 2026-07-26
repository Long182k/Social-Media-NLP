import { createClient } from "graphql-ws";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { ApolloClient, InMemoryCache, split, HttpLink, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from "@apollo/client/utilities";
import { getActiveAccessToken } from "./axiosConfig";

// Build WebSocket URL automatically from server URL (http -> ws, https -> wss)
const serverUrl =
  import.meta.env.VITE_SERVER_URL || "https://social-media-nlp-be.vercel.app";
const overrideWsUrl = import.meta.env.VITE_WS_URL;
const baseForWs = overrideWsUrl || serverUrl;

// http(s) -> ws(s)
const wsBase = baseForWs.replace(/^http(s?):\/\//, "ws$1://");
const wsUrl = `${wsBase}/graphql`;

const isProductionServerless =
  serverUrl.includes("vercel.app") || serverUrl.includes("render.com");

const wsLink = isProductionServerless
  ? null
  : new GraphQLWsLink(
      createClient({
        url: wsUrl,
        retryAttempts: 2,
        connectionParams: () => {
          const activeToken = getActiveAccessToken();
          return {
            Authorization: activeToken ? `Bearer ${activeToken}` : "",
          };
        },
        on: {
          connected: () => console.log("✅ GraphQL WebSocket connected"),
          closed: () => {},
          error: () => {},
        },
      })
    );

const httpLink = new HttpLink({
  uri: (import.meta.env.VITE_SERVER_URL || "https://social-media-nlp-be.vercel.app") + "/graphql",
});

const authLink = setContext((_, { headers }) => {
  const activeToken = getActiveAccessToken();
  return {
    headers: {
      ...headers,
      authorization: activeToken ? `Bearer ${activeToken}` : "",
    },
  };
});

const splitLink = wsLink
  ? split(
      ({ query }) => {
        const def = getMainDefinition(query);
        return (
          def.kind === "OperationDefinition" && def.operation === "subscription"
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
