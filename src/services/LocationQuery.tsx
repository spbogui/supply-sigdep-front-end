import { Location } from "../models/shared";
import apiClient from "../utils/http-common";

const getOne = async (uuid: string, params: string) => {
  const response = await apiClient.get<any>(`/location/${uuid}?${params}`);
  return response.data;
};

const getAll = async (params: string): Promise<Location[]> => {
  const response = await apiClient.get<any>(`/location?${params}`);
  return response.data.results;
};

const getAttributes = async (uuid: string, params: string): Promise<any[]> => {
  const response = await apiClient.get<any>(
    `/location/${uuid}/attribute?${params}`
  );
  return response.data.results;
};

const getProviders = async (params: string): Promise<any[]> => {
  const response = await apiClient.get<any>(`/provider?${params}`);
  return response.data.results;
};

const saveAttribute = async (
  data: any,
  uuid: string,
  attributeUuid: string = ""
) => {
  const response = await apiClient.post<any>(
    `/location/${uuid}/attribute${attributeUuid}`,
    data
  );
  return response.data.results;
};

const LocationQuery = {
  getOne,
  getAll,
  getProviders,
  getAttributes,
  saveAttribute,
};

export default LocationQuery;
