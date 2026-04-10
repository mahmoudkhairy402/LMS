const { OAuth2Client } = require("google-auth-library");

const AppError = require("./appError");

let client;

function getClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new AppError("GOOGLE_CLIENT_ID is not configured", 500);
  }

  if (!client) {
    client = new OAuth2Client(clientId);
  }

  return client;
}

async function verifyGoogleIdToken(idToken) {
  try {
    const ticket = await getClient().verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  } catch (error) {
    throw new AppError("Invalid Google token", 401);
  }
}

module.exports = verifyGoogleIdToken;
