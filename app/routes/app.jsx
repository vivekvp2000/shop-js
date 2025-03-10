import '../../public/css/app.css'

import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import { Link, Outlet, useLoaderData, useRouteError, useSearchParams } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { useEffect, useState } from "react";



export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {

  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const [sessionToken, setSessionToken] = useState(null);
  const [searchParams] = useSearchParams();

  const appConfig = {
    apiKey: "c8ddc871048e1cd52e1f2bb49c8defbb",
    host: searchParams.get("host"),
  };
  useEffect(() => {
    const app = createApp(appConfig);

    async function fetchSessionToken() {
      try {
        const token = await getSessionToken(app);
        setSessionToken(token);
      } catch (error) {
        console.error("Error fetching session token:", error);
      }
    }
    fetchSessionToken();
  }, []);

  useEffect(() => {
    if (!sessionToken) return;
    async function postSessionToken() {
      try {
        const response = await fetch("https://dummyjson.com/todos/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            todo: 'Use DummyJSON in the project',
            completed: false,
            userId: 10,
          }),
        });

        if (!response.ok) throw new Error("API request failed");

        const result = await response.json();
        console.log(result);
      } catch (error) {
        console.error("Error posting session token:", error);
      }
    }
    postSessionToken();
  }, [sessionToken]);

  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">Home</Link>
        <Link to="/app/identify">Identify</Link>
        <Link to="/app/confirm">Confirm</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
