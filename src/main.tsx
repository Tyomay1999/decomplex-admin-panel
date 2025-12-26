import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { store } from "./store";
import "antd/dist/reset.css";
import "./index.css";
import "./i18n";

const params = new URLSearchParams(window.location.search);
const p = params.get("p");

if (p) {
  try {
    const url = p.startsWith("http") ? new URL(p) : null;
    const nextPath = url ? `${url.pathname}${url.search}${url.hash}` : p;

    if (nextPath.startsWith("/")) {
      window.history.replaceState(null, "", nextPath);
    } else {
      window.history.replaceState(null, "", "/");
    }
  } catch {
    window.history.replaceState(null, "", "/");
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
