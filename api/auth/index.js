const SmartlingBaseApi = require("../base");
const SmartlingException = require("../exception");

/*
    eslint class-methods-use-this: [
        "error", {
            "exceptMethods": [
                "time"
            ]
        }
    ]
 */

class SmartlingAuthApi extends SmartlingBaseApi {
    constructor(userIdentifier, tokenSecret, logger, smartlingApiBaseUrl) {
        super(logger);
        this.ttlCorrectionSec = 10;
        this.userIdentifier = userIdentifier;
        this.tokenSecret = tokenSecret;
        this.entrypoint = `${smartlingApiBaseUrl}/auth-api/v2`;
        this.requestTimestamp = 0;
    }

    async authenticate() {
        this.resetRequestTimeStamp();

        return await this.makeRequest(
            "post",
            `${this.entrypoint}/authenticate`,
            JSON.stringify({
                userIdentifier: this.userIdentifier,
                userSecret: this.tokenSecret
            })
        );
    }

    async refreshToken() {
        if (this.tokenExists() && this.tokenCanBeRenewed()) {
            this.resetRequestTimeStamp();

            return await this.makeRequest(
                "post",
                `${this.entrypoint}/authenticate/refresh`,
                JSON.stringify({
                    refreshToken: this.response.refreshToken
                })
            );
        }

        return await this.authenticate();
    }

    resetRequestTimeStamp() {
        this.requestTimestamp = this.time();
    }

    tokenExists() {
        /* eslint-disable-next-line no-prototype-builtins */
        return this.response && this.response.hasOwnProperty("accessToken");
    }

    tokenExpired() {
        const tokenExpirationTime = (this.requestTimestamp + this.response.expiresIn)
            - this.ttlCorrectionSec;

        return this.tokenExists() && this.time() > tokenExpirationTime;
    }

    tokenCanBeRenewed() {
        return this.tokenExists()
            && (this.time() < (this.requestTimestamp + this.response.refreshExpiresIn));
    }

    async getAccessToken() {
        try {
            if (this.tokenExpired()) {
                this.logger.debug("Token expired. Refreshing...");

                this.response = await this.refreshToken();
            }

            if (!this.tokenExists()) {
                this.logger.debug("No token available. Authenticating...");

                this.response = await this.authenticate();
            }

            return this.response.accessToken;
        } catch (e) {
            this.logger.debug(`Request failed. Got: ${e.payload}`);

            throw new SmartlingException("Failed to get access token", e.payload, e);
        }
    }

    async getTokenType() {
        try {
            if (!this.tokenExists()) {
                this.logger.debug("Requested tokenType but no successful authenticate response received yet. Authenticating...");

                this.response = await this.authenticate();
            }

            return this.response.tokenType;
        } catch (e) {
            this.logger.debug(`Request failed. Got: ${e.payload}`);

            throw new SmartlingException("Failed to get token type", e.payload, e);
        }
    }

    resetToken() {
        this.requestTimestamp = 0;
        this.response = {};
    }

    /**
     * Returns current timestamp
     * @returns {number}
     */
    time() {
        return Math.floor(Date.now() / 1000);
    }
}

module.exports = SmartlingAuthApi;
