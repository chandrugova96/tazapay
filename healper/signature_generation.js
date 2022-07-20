const https = require("https");
const crypto = require("crypto");

const accessKey = process.env.TAZAPAY_ACCESS_KEY;
const secretKey = process.env.TAZAPAY_SECRET_KEY;
const log = false;

async function makeRequest(method, urlPath, body = null) {
  try {
    httpMethod = method;
    httpBaseURL = "api-sandbox.tazapay.com";
    httpURLPathforSign = urlPath.split("?")[0]; // use only path without params.
    salt = generateRandomString(6);
    timestamp = Math.round(new Date().getTime() / 1000);
    signature = sign(
      httpMethod,
      httpURLPathforSign,
      salt,
      timestamp,
      accessKey,
      secretKey
    );

    const options = {
      hostname: httpBaseURL,
      port: 443,
      path: urlPath,
      method: httpMethod,
      headers: {
        "Content-Type": "application/json",
        salt,
        timestamp,
        signature,
        accessKey,
      },
    };

    return await httpRequest(options, body, log);
  } catch (error) {
    console.error("Error generating request options");
    throw error;
  }
}

function sign(method, urlPath, salt, timestamp) {
  try {
    let toSign =
      method.toUpperCase() + urlPath + salt + timestamp + accessKey + secretKey;
    log && console.log(`toSign: ${toSign}`);

    let hash = crypto.createHmac("sha256", secretKey);
    hash.update(toSign);
    const signature = Buffer.from(hash.digest("hex")).toString("base64");
    log && console.log(`signature: ${signature}`);

    return signature;
  } catch (error) {
    console.error("Error generating signature");
    throw error;
  }
}

function generateRandomString(size) {
  try {
    return crypto.randomBytes(size).toString("hex");
  } catch (error) {
    console.error("Error generating salt");
    throw error;
  }
}

async function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    try {
      let bodyString = "";
      if (body) {
        bodyString = JSON.stringify(body);
        bodyString = bodyString == "{}" ? "" : bodyString;
      }

      log && console.log(`httpRequest options: ${JSON.stringify(options)}`);
      const req = https.request(options, (res) => {
        let response = {
          statusCode: res.statusCode,
          headers: res.headers,
          body: "",
        };

        res.on("data", (data) => {
          response.body += data;
        });

        res.on("end", () => {
          response.body = response.body ? JSON.parse(response.body) : {};
          log &&
            console.log(`httpRequest response: ${JSON.stringify(response)}`);

          if (response.statusCode !== 200) {
            return reject(response);
          }

          return resolve(response);
        });
      });

      req.on("error", (error) => {
        return reject(error);
      });

      req.write(bodyString);
      req.end();
    } catch (err) {
      return reject(err);
    }
  });
}

async function getBuyerDetails(email) {
  let buyerDetails = {};
  try {
    buyerDetails = await makeRequest("GET", `/v1/user/${email}`);
    return buyerDetails;
  } catch (error) {
    return error;
  }
}

async function createBuyerDetails(email, name, country) {
  let buyerDetails = {};
  try {
    const body = {
      "email": email,
      "country": country,
      "ind_bus_type": "Business",
      "business_name": name
    };
    buyerDetails = await makeRequest("POST", "/v1/user", body);
    return buyerDetails;
  } catch (error) {
    return error;
  }
}

module.exports = { makeRequest, getBuyerDetails, createBuyerDetails };