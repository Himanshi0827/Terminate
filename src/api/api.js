// src/api/api.js
import { UserManager, Log } from "oidc-client-ts";

const API_URL =
  "https://preview-rls09.congacloud.com/api/data/v1/objects/AgreementLineItem";

const userManager = new UserManager({
  authority: "https://login-rlspreview.congacloud.com/api/v1/auth",
  //client_id:import.meta.env.client_id,
  client_id:"e77fc3cf-b8d0-4c60-a5e0-e0cbf614247f",
  //client_id: "05d7c408-393e-42c1-bc4a-3741caa0e131",
  redirect_uri: `${window.location.origin}/callback`,
  response_type: "code",
  scope: "openid",
});

Log.setLogger(console);

Log.setLevel(Log.DEBUG);

/* ---------------- AUTH ---------------- */

// Login
export function login() {
  userManager.signinRedirect();
}

// Handle callback & store user in session
export async function handleCallback() {
  console.log("Handle callback");
  const user = await userManager.signinRedirectCallback();
  sessionStorage.setItem("user", JSON.stringify(user));
  return user;
}

export function getAccessToken() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user || !user.access_token) {
    login();
  }
  return user.access_token;
}



export async function updateAgreement(id, payload) {
  try {
    const CONTRACT_URL =
      "https://preview-rls09.congacloud.com/api/data/v1/objects/Agreement";

    const accessToken = getAccessToken();
    const response = await fetch(`${CONTRACT_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // "user-id": "6cfff136-e62b-d435-133d-455fb809c836",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
      // const errorText = await response.text();
      //throw new Error(errorText || "Failed to update agreement");
    }
    const result = await response.json();
    return result;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}



//head
export async function getAgreementById(id) {
  try {
    const CONTRACT_URL =
      "https://preview-rls09.congacloud.com/api/data/v1/objects/Agreement";

    const accessToken = getAccessToken();
    const response = await fetch(`${CONTRACT_URL}/${id}`, {
      method: "Get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // "user-id": "6cfff136-e62b-d435-133d-455fb809c836",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    const result = await response.json();
    return result.Data;
  } catch (err) {
    console.error(err.message);
  }
}

