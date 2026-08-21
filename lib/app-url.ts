const PRODUCTION_ORIGIN = "https://anuncio.top";

export function getAppOrigin(requestUrl?: string) {
  if (process.env.NODE_ENV === "production") return PRODUCTION_ORIGIN;

  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Em desenvolvimento, continua usando a origem da requisição.
    }
  }

  return requestUrl ? new URL(requestUrl).origin : PRODUCTION_ORIGIN;
}
