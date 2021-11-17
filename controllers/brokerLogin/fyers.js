const { default: axios } = require("axios");
const crypto = require("crypto");

async function getCredentials(broker, user) {
  const { firebase } = require("../../config/connectFirebase");
  const brokerCredentialsCollection = firebase.brokerCredentialsCollection;
  const brokerDocName = [broker, user].join("_");
  const brokerSnapshot = await brokerCredentialsCollection.doc(brokerDocName);
  const brokerCredentials = (await brokerSnapshot.get())._fieldsProto;
  Object.keys(brokerCredentials).map((key) => {
    brokerCredentials[key] = brokerCredentials[key].stringValue;
  });
  return brokerCredentials;
}

function getGenerateAuthcodeUrl(credentials) {
  const url = new URL("https://api.fyers.in/api/v2/generate-authcode");
  url.searchParams.set("client_id", credentials.clientId);
  url.searchParams.set("redirect_uri", credentials.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", credentials.state);
  return url.href;
}

async function openGenerateAuthcodeUrl(driver, url) {
  driver.get(url);
  await driver.sleep(5000);
}

async function enterCredentialsAndSubmit(driver, webdriver, credentials) {
  const user_name = await driver.findElement(webdriver.By.id("fyers_id"));
  const password = await driver.findElement(webdriver.By.id("password"));
  const pan_card = await driver.findElement(webdriver.By.id("pancard"));
  const submit_button = await driver.findElement(webdriver.By.id("btn_id"));
  await user_name.sendKeys(credentials.fyersId);
  await password.sendKeys(credentials.password);
  await pan_card.sendKeys(credentials.pancard);
  await submit_button.click();
  await driver.sleep(5000);
}

function getAuthcodeFromUrl(url) {
  return new URL(url).searchParams.get("auth_code");
}

async function getAccessToken(authCode, credentials) {
  const appIdHash = crypto
    .createHash("sha256")
    .update(`${credentials.clientId}:${credentials.secretId}`)
    .digest("hex");
  const response = await axios.post(
    "https://api.fyers.in/api/v2/validate-authcode",
    {
      grant_type: "authorization_code",
      appIdHash: appIdHash,
      code: authCode,
    }
  );
  return response.data.access_token;
}

function updateToCredentials(broker, user, authCode, accessToken) {
  const { firebase } = require("../../config/connectFirebase");
  const brokerCredentialsCollection = firebase.brokerCredentialsCollection;
  const brokerLogin = [broker, user].join("_");
  brokerCredentialsCollection.doc(brokerLogin).update({
    authCode: authCode,
    accessToken: accessToken,
  });
}

module.exports = async function (broker, user) {
  const webdriver = require("selenium-webdriver");
  const chrome = require("selenium-webdriver/chrome");
  const screen = {
    width: 640,
    height: 480,
  };
  const driver = new webdriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(new chrome.Options().headless().windowSize(screen))
    .build();
  const credentials = await getCredentials(broker, user);
  const generateAuthcodeUrl = getGenerateAuthcodeUrl(credentials);
  await openGenerateAuthcodeUrl(driver, generateAuthcodeUrl);
  await enterCredentialsAndSubmit(driver, webdriver, credentials);
  const authCode = getAuthcodeFromUrl(await driver.getCurrentUrl());
  const accessToken = await getAccessToken(authCode, credentials);
  driver.quit();
  if (authCode && accessToken) {
    updateToCredentials(broker, user, authCode, accessToken);
  } else {
    throw "No authcode or access token";
  }
};
