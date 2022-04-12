import axios from "axios";

export default axios.create({
  baseURL: "/openmrs/ws/rest/v1",
  headers: {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    Authorization: "Basic " + window.btoa("admin:Dppeis@pnls_16"),
  },
});
