export type GoogleCredentials = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  scope?: string;
  idToken?: string;
};

type GoogleAccount = { name?: string; accountName?: string; type?: string };
type GoogleLocation = {
  name?: string;
  title?: string;
  storeCode?: string;
  storefrontAddress?: unknown;
};
type GoogleReview = {
  name?: string;
  reviewer?: { displayName?: string; profilePhotoUrl?: string };
  starRating?: string;
  comment?: string;
  createTime?: string;
  updateTime?: string;
  reviewReply?: unknown;
};

const ACCOUNT_API = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_API = "https://mybusinessbusinessinformation.googleapis.com/v1";
const REVIEWS_API = "https://mybusiness.googleapis.com/v4";

async function googleGet<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json() as { error?: { message?: string; status?: string } };
      detail = body.error?.message ?? body.error?.status ?? "";
    } catch {
      // Keep the HTTP status when Google returns a non-JSON error response.
    }
    const safeDetail = detail.replace(/[\r\n]+/g, " ").slice(0, 160);
    throw new Error(`GOOGLE_API_${response.status}${safeDetail ? `:${safeDetail}` : ""}`);
  }
  return response.json() as Promise<T>;
}

export async function listGoogleAccounts(credentials: GoogleCredentials) {
  const response = await googleGet<{ accounts?: GoogleAccount[] }>(
    `${ACCOUNT_API}/accounts`,
    credentials.accessToken,
  );
  return response.accounts ?? [];
}

export async function listGoogleLocations(
  credentials: GoogleCredentials,
  accountName: string,
) {
  const params = new URLSearchParams({
    readMask: "name,title,storeCode,storefrontAddress",
  });
  const response = await googleGet<{ locations?: GoogleLocation[] }>(
    `${BUSINESS_API}/${accountName}/locations?${params}`,
    credentials.accessToken,
  );
  return response.locations ?? [];
}

export async function listGoogleReviews(
  credentials: GoogleCredentials,
  locationName: string,
  accountName?: string,
) {
  // Reviews API v4 requires accounts/{accountId}/locations/{locationId}.
  // Business Information can return location names as locations/{id}, so
  // rebuild the full resource name from the account stored with each source.
  const reviewParent = locationName.startsWith("accounts/")
    ? locationName
    : accountName && locationName.startsWith("locations/")
      ? `${accountName}/${locationName}`
      : locationName;
  const params = new URLSearchParams({ pageSize: "50" });
  const reviews: GoogleReview[] = [];
  let pageToken: string | undefined;

  do {
    if (pageToken) params.set("pageToken", pageToken);
    else params.delete("pageToken");
    const response = await googleGet<{
      reviews?: GoogleReview[];
      nextPageToken?: string;
    }>(`${REVIEWS_API}/${reviewParent}/reviews?${params}`, credentials.accessToken);
    reviews.push(...(response.reviews ?? []));
    pageToken = response.nextPageToken;
  } while (pageToken);

  return reviews;
}

export function normalizeGoogleRating(starRating?: string) {
  const values: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return values[starRating ?? ""] ?? 0;
}
