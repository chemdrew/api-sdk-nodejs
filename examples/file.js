const SmartlingFileApi = require("../api/file");
const RetrievalTypes = require("../api/file/params/retrieval-types");
const DownloadFileParameters = require("../api/file/params/download-file-parameters");
// eslint-disable-next-line import/no-unresolved
const { SmartlingApiFactory } = require("../api/factory");

const logger = console;
const projectId = process.env.PROJECT_ID;
const userId = process.env.USER_ID;
const userSecret = process.env.USER_SECRET;

if (userId && userSecret) {
    const baseUrl = "https://api.smartling.com";
    const apiFactory = new SmartlingApiFactory(userId, userSecret, baseUrl, logger);
    const smartlingFileApi = apiFactory.createApiClient(SmartlingFileApi);

    smartlingFileApi.clientLibId = "testClientLibId";
    smartlingFileApi.clientLibVersion = "testClientLibVersion";

    (async () => {
        const fileUri = "test";

        smartlingFileApi.setOptions({ timeout: 1000 });

        try {
            let result = await smartlingFileApi.getStatusForAllLocales(projectId, fileUri);
            logger.debug("-------- Get status for all locales ---------");
            logger.debug(JSON.stringify(result));

            result = await smartlingFileApi.getLastModified(projectId, fileUri);
            logger.debug("-------- Get last modified for all locales ---------");
            logger.debug(JSON.stringify(result));

            const downloadFileParams = new DownloadFileParameters();

            downloadFileParams.setRetrievalType(RetrievalTypes.pseudo);

            result = await smartlingFileApi.downloadFile(projectId, fileUri, "fr-FR", downloadFileParams);
            logger.debug("-------- Download file ---------");
            logger.debug(result);
        } catch (e) {
            logger.error(e);
        }
    })();
}
