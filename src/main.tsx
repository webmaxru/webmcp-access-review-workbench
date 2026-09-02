import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { AccessReviewService } from "./domain";
import { registerAccessReviewTools } from "./webmcp";
import "./styles.css";

export const accessReviewService = new AccessReviewService();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App service={accessReviewService} />
  </StrictMode>,
);

const registration = registerAccessReviewTools(accessReviewService);
void registration.ready;
window.addEventListener("pagehide", () => registration.dispose(), { once: true });

if (import.meta.hot) {
  import.meta.hot.dispose(() => registration.dispose());
}
