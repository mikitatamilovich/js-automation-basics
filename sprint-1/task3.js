const rawConfig = {
  apiBase: "https://shop.com/api",
  // retries: 3, - этого поля нет
  headers: {
    auth: { token: "x-token-123" },
  },
};

function normalizeConfig(rawConfig) {
  const { apiBase, retries = 3, headers } = rawConfig;
  const token = headers?.auth?.token ?? "guest_token";

  return {
    url: apiBase,
    retries,
    token,
  };
}

console.log(normalizeConfig(rawConfig));
