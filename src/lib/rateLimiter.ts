type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const rateLimitStore = new Map<string, RateLimitEntry>();

function now() {
  return Date.now();
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "anonymous";
  }

  const realIp = request.headers.get("x-real-ip");

  return realIp?.trim() || "anonymous";
}

export function consumeRateLimit(key: string): RateLimitResult {
  const currentTime = now();

  for (const [storedKey, storedEntry] of rateLimitStore.entries()) {
    if (storedEntry.resetAt <= currentTime) {
      rateLimitStore.delete(storedKey);
    }
  }

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= currentTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: currentTime + WINDOW_MS,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - currentTime) / 1000)),
    };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}
