import * as queryString from "querystring";
import SmartlingAuthApi from "../auth";
import SmartlingBaseApi from "../base";
import {PropertyMappingParameters} from "./parameters/property-mapping-parameters";
import {PropertyMappingDto} from "./dto/property-mapping-dto";
import {HTTPResponse} from "../http/response";

export class SmartlingPropertyMappingsApi extends SmartlingBaseApi {
	private readonly authApi: SmartlingAuthApi;
	private readonly entrypoint: string;

	constructor(authApi: SmartlingAuthApi, logger: any, smartlingApiBaseUrl: string) {
		super(logger);

		this.authApi = authApi;
		this.entrypoint = `${smartlingApiBaseUrl}/connectors-property-mappings-api/v2`;
	}

	public async createProjectPropertyMapping<TProperty, TMapping>(
		projectId: string,
		integrationId: string,
		params: PropertyMappingParameters
	): Promise<PropertyMappingDto<TProperty, TMapping>> {
		return this.mapItemToDto<TProperty, TMapping>(await this.makeRequest(
			"post",
			this.getProjectPropertyMappingsApiUrl(projectId, integrationId),
			JSON.stringify(params.export())
		));
	}

	public async createAccountPropertyMapping<TProperty, TMapping>(
		accountUid: string,
		integrationId: string,
		params: PropertyMappingParameters
	): Promise<PropertyMappingDto<TProperty, TMapping>> {
		return this.mapItemToDto<TProperty, TMapping>(await this.makeRequest(
			"post",
			this.getAccountPropertyMappingsApiUrl(accountUid, integrationId),
			JSON.stringify(params.export())
		));
	}

	public async updateProjectPropertyMapping<TProperty, TMapping>(
		projectId: string,
		integrationId: string,
		propertyMappingUid: string,
		params: PropertyMappingParameters
	): Promise<PropertyMappingDto<TProperty, TMapping>> {
		return this.mapItemToDto<TProperty, TMapping>(await this.makeRequest(
			"put",
			`${this.getProjectPropertyMappingsApiUrl(projectId, integrationId)}/${propertyMappingUid}`,
			JSON.stringify(params.export())
		));
	}

	public async updateAccountPropertyMapping<TProperty, TMapping>(
		accountUid: string,
		integrationId: string,
		propertyMappingUid: string,
		params: PropertyMappingParameters
	): Promise<PropertyMappingDto<TProperty, TMapping>> {
		return this.mapItemToDto<TProperty, TMapping>(await this.makeRequest(
			"put",
			`${this.getAccountPropertyMappingsApiUrl(accountUid, integrationId)}/${propertyMappingUid}`,
			JSON.stringify(params.export())
		));
	}

	public async getAccountPropertyMappings<TProperty, TMapping>(
		accountUid: string,
		integrationId: string
	): Promise<HTTPResponse<PropertyMappingDto<TProperty, TMapping>>> {
		return this.mapItemsToDtos<TProperty, TMapping>(await this.makeRequest(
			"get",
			this.getAccountPropertyMappingsApiUrl(accountUid, integrationId)
		));
	}

	public async getProjectPropertyMappings<TProperty, TMapping>(
		projectId: string,
		integrationId: string
	): Promise<HTTPResponse<PropertyMappingDto<TProperty, TMapping>>> {
		return this.mapItemsToDtos<TProperty, TMapping>(await this.makeRequest(
			"get",
			this.getProjectPropertyMappingsApiUrl(projectId, integrationId),
		));
	}

	public async searchAccountPropertyMappings<TProperty, TMapping>(
		accountUid: string,
		integrationId: string,
		params: PropertyMappingParameters
	): Promise<HTTPResponse<PropertyMappingDto<TProperty, TMapping>>> {
		return this.mapItemsToDtos<TProperty, TMapping>(await this.makeRequest(
			"get",
			`${this.getAccountPropertyMappingsApiUrl(accountUid, integrationId)}?${queryString.stringify(params.export())}`
		));
	}

	public async searchProjectPropertyMappings<TProperty, TMapping>(
		projectId: string,
		integrationId: string,
		params: PropertyMappingParameters
	): Promise<HTTPResponse<PropertyMappingDto<TProperty, TMapping>>> {
		return this.mapItemsToDtos<TProperty, TMapping>(await this.makeRequest(
			"get",
			`${this.getProjectPropertyMappingsApiUrl(projectId, integrationId)}?${queryString.stringify(params.export())}`
		));
	}

	private getProjectPropertyMappingsApiUrl(projectId: string, integrationId: string): string {
		return `${this.entrypoint}/projects/${projectId}/integrations/${integrationId}/property-mappings`;
	}

	private getAccountPropertyMappingsApiUrl(accountUid: string, integrationId: string): string {
		return `${this.entrypoint}/accounts/${accountUid}/integrations/${integrationId}/property-mappings`;
	}

	private mapItemToDto<TProperty, TMapping>(propertyMapping: PropertyMappingDto<TProperty, TMapping>): PropertyMappingDto<TProperty, TMapping> {
		["created", "modified"].forEach(function (field) {
			if (propertyMapping[field]) {
				propertyMapping[field] = new Date(propertyMapping[field]);
			}
		});

		return propertyMapping as PropertyMappingDto<TProperty, TMapping>;
	}

	private mapItemsToDtos<TProperty, TMapping>(response: HTTPResponse<PropertyMappingDto<TProperty, TMapping>>): HTTPResponse<PropertyMappingDto<TProperty, TMapping>> {
		const retrievedItems = response.items || [];
		const items: Array<PropertyMappingDto<TProperty, TMapping>> = retrievedItems.map(item => {
			return this.mapItemToDto(item);
		});

		return {
			items,
			totalCount: response.totalCount
		};
	}
}