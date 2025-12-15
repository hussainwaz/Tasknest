import React from "react";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function ErrorBoundary() {
  const error = useRouteError();

  const isRouteResponse = isRouteErrorResponse(error);
  const status = isRouteResponse ? error.status : (error?.status ?? null);

  let errorTitle = "Application error";
  let errorMessage = "Something went wrong. Please try again.";
  let showRefresh = true;

  if (status === 404) {
    errorTitle = "Page not found";
    errorMessage = "The page you're looking for doesn't exist or has been moved.";
    showRefresh = false;
  } else if (status === 401) {
    errorTitle = "Unauthorized";
    errorMessage = "You need to be logged in to access this page.";
  } else if (status === 403) {
    errorTitle = "Forbidden";
    errorMessage = "You don't have permission to access this resource.";
  } else if (status === 500) {
    errorTitle = "Server error";
  }

  const detail = isRouteResponse
    ? (typeof error.data === "string" ? error.data : error.statusText)
    : (error?.message ?? null);

  return (
    <section className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_15%,rgba(109,141,255,0.16),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(87,214,255,0.12),transparent_60%)]" />
      </div>

      <div className="relative h-full w-full overflow-y-auto custom-scrollbar px-[10px] py-4">
        <div className="surface-blur flex min-h-[70vh] flex-col items-center justify-center rounded-[28px] border border-[rgba(255,255,255,0.04)] px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(255,107,107,0.12)] text-[rgba(255,107,107,0.92)]">
            <AlertCircle className="h-7 w-7" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">{errorTitle}</h1>
          <p className="mt-3 max-w-[560px] text-sm text-[rgba(197,208,245,0.72)]">{errorMessage}</p>

          {detail && (
            <div className="mt-5 max-w-[700px] rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-left text-xs text-[rgba(197,208,245,0.78)]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(197,208,245,0.55)]">Details</p>
              <p className="mt-2 break-words">{detail}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[rgba(109,141,255,0.85)] to-[rgba(87,214,255,0.85)] px-6 py-2 text-sm font-semibold text-[rgba(4,7,13,0.85)] transition hover:opacity-95"
            >
              <Home className="h-4 w-4" />
              Go home
            </Link>

            {showRefresh && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(109,141,255,0.28)] bg-[rgba(255,255,255,0.06)] px-6 py-2 text-sm font-medium text-white transition hover:border-[rgba(109,141,255,0.5)]"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
