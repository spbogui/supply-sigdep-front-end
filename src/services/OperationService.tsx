import {
    ProductAttributeStock,
    ProductDispensation,
    ProductOperation,
    ProductOperationFlux,
    ProductOperationFluxAttribute,
    ProductOperationFluxSave,
    ProductOperationType,
} from "../models/ProductOperation";
import apiClient from "../utils/http-common";

const getAllInventories = async (
    params: string
): Promise<ProductOperation[]> => {
    const response = await apiClient.get<any>(
        `/productOperation?type=INVENTORYOOOOOOOOOOOOOOOOOOOOOOOOOOOOO&${params}`
    );
    return response.data.results;
};

const getAllOperations = async (
    type: string,
    params: string
): Promise<ProductOperation[]> => {
    const response = await apiClient.get<any>(
        `/productOperation?type=${type}&${params}`
    );
    return response.data.results;
};

const getAllDispensations = async (
    params: string
): Promise<ProductDispensation[]> => {
    const response = await apiClient.get<any>(
        `/productDispensation?${params}`
    );
    return response.data.results;
};

const getOne = async (
    uuid: string | undefined,
    params: string
): Promise<ProductOperation> => {
    const response = await apiClient.get<any>(
        `/productOperation/${uuid}?${params}`
    );
    return response.data;
};

const getOneDispensation = async (
    uuid: string | undefined,
    params: string
): Promise<ProductDispensation> => {
    const response = await apiClient.get<ProductDispensation>(
        `/productDispensation/${uuid}?${params}`
    );
    return response.data;
};

const getOneFluxes = async (
    uuid: string,
    params: string
): Promise<ProductOperationFlux[]> => {
    const response = await apiClient.get<any>(
        `/productOperation/${uuid}/flux?${params}`
    );
    return response.data.results;
};

const getOneFlux = async (
    uuid: string,
    flux: string,
    params: string
): Promise<ProductOperationFlux> => {
    const response = await apiClient.get<ProductOperationFlux>(
        `/productOperation/${uuid}/flux/${flux}?${params}`
    );
    return response.data;
};

const getOperationType = async (
    type: string,
    params: string
): Promise<ProductOperationType> => {
    const response = await apiClient.get(
        `/productOperationType/${type}?${params}`
    );
    return response.data;
};

const getAllStock = async (
    params: string
): Promise<ProductAttributeStock[]> => {
    const response = await apiClient.get(`/productAttributeStock?${params}`);
    return response.data.results;
};

const save = async (data: any) => {
    const uuid = data.uuid;
    const response = await apiClient.post(
        `/productOperation${uuid ? "/" + uuid : ""}`,
        data
    );
    return response.data;
};

const saveDispensation = async (data: any) => {
    const uuid = data.uuid;
    const response = await apiClient.post(
        `/productDispensation${uuid ? "/" + uuid : ""}`,
        data
    );
    return response.data;
};

const addAttribute = async (data: any, uuid: string) => {
    const response = await apiClient.post(
        `/productOperation${uuid}/attribute`,
        data
    );
    return response.data;
};

const updateAttribute = async (data: any, uuid: string) => {
    const response = await apiClient.post(
        `/productOperation${uuid}/attribute${data.uuid}`,
        data
    );
    return response.data;
};

const remove = async (uuid: any) => {
    const response = await apiClient.delete(
        `/productOperation/${uuid}?purge=true`
    );
    return response.data;
};

const removeDispensation = async (uuid: any) => {
    const response = await apiClient.delete(
        `/productDispensation/${uuid}?purge=true`
    );
    return response.data;
};

const updateDispensation = async (data: any, uuid: string) => {
    const response = await apiClient.post(`/productDispensation/${uuid}`, data);
    return response.data;
};

const update = async (data: any, uuid: string) => {
    const response = await apiClient.post(`/productOperation/${uuid}`, data);
    return response.data;
};

const createFlux = async (
    data: ProductOperationFluxSave,
    uuid: string
): Promise<ProductOperationFlux> => {
    const response = await apiClient.post<ProductOperationFlux>(
        `/productOperation/${uuid}/flux`,
        data
    );
    return response.data;
};

const updateFlux = async (
    data: any,
    uuid: string,
    flux: string
): Promise<ProductOperationFlux> => {
    const response = await apiClient.post<ProductOperationFlux>(
        `/productOperation/${uuid}/flux/${flux}`,
        data
    );
    return response.data;
};

const updateFluxAttribute = async (
    data: any,
    uuid: string
): Promise<ProductOperationFluxAttribute> => {
    const response = await apiClient.post<ProductOperationFluxAttribute>(
        `/productOperationFluxAttribute/${uuid}`,
        data
    );
    return response.data;
};

const removeFlux = async (
    uuid: string,
    fluxUuid: string
): Promise<ProductOperationFlux> => {
    const response = await apiClient.delete<any>(
        `/productOperation/${uuid}/flux/${fluxUuid}?purge=true`
    );
    return response.data;
};

const OperationService = {
    getAllInventories,
    getAllOperations,
    getOperationType,
    save,
    update,
    remove,
    getOne,
    createFlux,
    getOneFluxes,
    removeFlux,
    updateFluxAttribute,
    updateFlux,
    getOneFlux,
    getAllStock,
    updateAttribute,
    addAttribute,
    saveDispensation,
    removeDispensation,
    updateDispensation,
    getOneDispensation,
    getAllDispensations
};

export default OperationService;
