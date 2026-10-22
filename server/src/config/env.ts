const THIRD_PARTY_BASE_URL = process.env.THIRD_PARTY_BASE_URL;

if (!THIRD_PARTY_BASE_URL) {
  throw new Error('Missing required env var: THIRD_PARTY_BASE_URL');
}

export { THIRD_PARTY_BASE_URL };
