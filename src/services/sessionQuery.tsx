import apiClient from "../utils/http-common";

const authenticate = async () => {
  const response = await apiClient.get<any>("/session");
  return response.data;
};

const deleteSession = async () => {
  const response = await apiClient.delete("/session");
  return response.data;
};

const SessionQuery = {
  authenticate,
  deleteSession,
};

export default SessionQuery;
