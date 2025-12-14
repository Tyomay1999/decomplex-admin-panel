import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { store } from "./store";
import "antd/dist/reset.css";
import "./index.css";
import "./i18n";

// GitHub Pages SPA fallback: if we came from /404.html redirect
const params = new URLSearchParams(window.location.search);
const p = params.get("p");
if (p) {
    window.history.replaceState(null, "", p);
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
