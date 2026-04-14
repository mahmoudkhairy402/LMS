const AppError = require("./appError");

async function verifyGoogleAccessToken(accessToken) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new AppError("Invalid Google token", 401);
    }

    const payload = await response.json();

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Google authentication failed", 401);
  }
}

module.exports = verifyGoogleAccessToken;
