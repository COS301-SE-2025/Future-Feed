// src/main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryProvider } from "./providers/QueryProvider"
import App from "./App"
import "./index.css"
import { NotificationProvider } from "./context/NotificationContext"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <NotificationProvider>
        <App />
        </NotificationProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>
)