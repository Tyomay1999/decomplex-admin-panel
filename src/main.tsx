import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/store";
import App from "@/App";
import { hydrateAccessTokenFromUrl } from "@/services";
import "antd/dist/reset.css";
import "@/index.css";
import "@/i18n";

const normalizeRedirectParam = (value: string): string => {
  try {
    if (value.startsWith("/")) return value;

    const url = value.startsWith("http://") || value.startsWith("https://") ? new URL(value) : null;
    if (!url) return "/";

    const nextPath = `${url.pathname}${url.search}${url.hash}`;
    return nextPath.startsWith("/") ? nextPath : "/";
  } catch {
    return "/";
  }
};

const applyRedirectFromQuery = (): void => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("p");
  if (!raw) return;

  const nextPath = normalizeRedirectParam(raw);
  window.history.replaceState(null, "", nextPath);
};

hydrateAccessTokenFromUrl();
applyRedirectFromQuery();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error('Root element "#root" not found');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
