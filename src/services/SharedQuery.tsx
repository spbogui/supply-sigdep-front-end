import {Encounter, Obs, Settings} from "../models/shared";
import apiClient from "../utils/http-common";

const findPatient = async (identifier: string, params: string = "v=full") => {
    const response = await apiClient.get<any>(
        `/patient?identification=${identifier}&${params}`
    );
    return response.data.results;
};

const createProvider = async (provider: any) => {
    const response = await apiClient.post<any>(`/provider`);
    return response.data.results;
};

const createPerson = async (person: any) => {
    const response = await apiClient.post<any>(`/person`);
    return response.data.results;
};

const findProviders = async (identifier: string, params: string = "v=full") => {
    const response = await apiClient.get<any>(`/provider?${params}`);
    return response.data.results;
};

const findEncounter = async (
    uuid: string,
    params: string
): Promise<Encounter> => {
    const response = await apiClient.get<Encounter>(
        `/encounter/${uuid}?${params}`
    );
    return response.data;
};

const findFilteredEncounter = async (
    patient: string,
    encounterType: string,
    params: string,
    limit: string = "1"
): Promise<Encounter[]> => {
    const response = await apiClient.get<any>(
        `/encounter?patient=${patient}&encounterType=${encounterType}&${params}&limit=${limit}`
    );
    return response.data.results;
};

const findFilteredObs = async (patient: string, concept: string, params: string = "", limit: string = "1"): Promise<Obs[]> => {
    const response = await apiClient.get<any>(
        `/obs?patient=${patient}&concept=${concept}&${params}&limit=${limit}`
    );
    return response.data.results;
}

const findSupplySettings = async (): Promise<Settings[]> => {
    const response = await apiClient.get<any>(
        "/systemsetting?v=custom:(property,value)&q=supplyInfo"
    );
    return response.data.results;
};

const evaluateDataSet = async (uuid: string, params: any) => {
    const response = await apiClient.post<any>(
        `/reportingrest/dataSet/${uuid}?v=custom:(rows,metadata:(column),definition:(name))`, params
    );
    return response.data;
}

const evaluatePatientActiveFile = async (params: any) => {
    const response = await apiClient.post<any>(
        `/reportingrest/dataSet/338d665c-4486-471c-a62a-ddb1a1307a10?v=custom:(rows,metadata:(column),definition:(name))`, params
    );
    return response.data;
}

const SharedQuery = {
    findPatient,
    findEncounter,
    findProviders,
    createProvider,
    createPerson,
    findSupplySettings,
    findFilteredObs,
    findFilteredEncounter,
    evaluateDataSet,
    evaluatePatientActiveFile
};

export default SharedQuery;
