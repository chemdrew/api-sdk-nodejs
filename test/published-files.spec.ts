import sinon from "sinon";
import fs from "fs";
import assert from "assert";
import { PublishedFilesApi } from "../api/published-files";
import { RecentlyPublishedFilesParameters } from "../api/published-files/params/recently-published-files-parameters";

const { loggerMock, authMock, responseMock } = require("./mock");

describe("Published files class tests.", () => {
    let publishedFilesApi;
    let publishedFilesApiFetchStub;
    let publishedFilesApiUaStub;
    let responseMockJsonStub;

    beforeEach(() => {
        publishedFilesApi = new PublishedFilesApi(authMock, loggerMock, "https://test.com");
        publishedFilesApi.authApi = authMock;

        publishedFilesApiFetchStub = sinon.stub(publishedFilesApi, "fetch");
        publishedFilesApiUaStub = sinon.stub(publishedFilesApi, "ua");
        responseMockJsonStub = sinon.stub(responseMock, "json");

        publishedFilesApiUaStub.returns("test_user_agent");
        publishedFilesApiFetchStub.returns(responseMock);
        responseMockJsonStub.returns({
            response: {}
        });
    });

    afterEach(() => {
        publishedFilesApiFetchStub.restore();
        responseMockJsonStub.restore();
        publishedFilesApiUaStub.restore();
    });

    it("Get recently published files", async () => {
        const params: RecentlyPublishedFilesParameters = new RecentlyPublishedFilesParameters();

        params.setPublishedAfterDate(new Date("2020-09-24T00:00:00Z"));
        params.setFileUris(["test:_1.xml", "test/file&_2.xml"]);
        params.setLocaleIds(["fr", "de"]);
        params.setOffset(0);
        params.setLimit(100);

        await publishedFilesApi.getRecentlyPublishedFiles("test_project", params);

        sinon.assert.calledOnce(publishedFilesApiFetchStub);
        sinon.assert.calledWithExactly(
            publishedFilesApiFetchStub,
            "https://test.com/published-files-api/v2/projects/test_project/files/list/recently-published?publishedAfter=2020-09-24T00%3A00%3A00Z&fileUris%5B%5D=test%3A_1.xml&fileUris%5B%5D=test%2Ffile%26_2.xml&localeIds%5B%5D=fr&localeIds%5B%5D=de&offset=0&limit=100", {
                headers: {
                    Authorization: "test_token_type test_access_token",
                    "Content-Type": "application/json",
                    "User-Agent": "test_user_agent"
                },
                method: "get"
            }
        );
    });

    it("Invalid offset", async () => {
        try {
            new RecentlyPublishedFilesParameters().setOffset(-1);
        } catch (e) {
            assert.equal(e.constructor.name, "SmartlingException");
            assert.equal(e.message, "Offset must be >= 0");
        }
    });

    it("Invalid limit", async () => {
        try {
            new RecentlyPublishedFilesParameters().setLimit(0);
        } catch (e) {
            assert.equal(e.constructor.name, "SmartlingException");
            assert.equal(e.message, "Limit must be > 0");
        }
    });
});
