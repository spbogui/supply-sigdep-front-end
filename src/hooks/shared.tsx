import {SelectItem} from "@mantine/core";
import {useMutation, useQuery} from "react-query";
import SharedQuery from "../services/SharedQuery";
import {Fn} from "../utils/Fn";

export const useFindPatient = (
    identifier: string | undefined,
    params: string = "v=full"
) => {
    const {
        data,
        refetch: findPatient,
        isLoading,
    } = useQuery(
        ["patient", identifier, params],
        async () =>
            await SharedQuery.findPatient(identifier ? identifier : "", params),
        {enabled: identifier !== undefined}
    );

    const patient = data && data.length > 0 ? data[0] : undefined;
    return {
        patient,
        findPatient,
        isLoading,
    };
};

export const useFindProvider = (
    params: string = "v=full",
    enabled: boolean = true
) => {
    const {
        data,
        refetch: findProviders,
        isLoading,
    } = useQuery(
        ["patient", params],
        async () => await SharedQuery.findProviders(params),
        {enabled}
    );

    const providers = data ? data : [];
    const providerSelectList: SelectItem[] = data
        ? data.map((p: any) => {
            return {label: p.display, value: p.uuid};
        })
        : [];
    return {
        providers,
        findProviders,
        providerSelectList,
        isLoading,
    };
};

export const useFindEncounter = (
    uuid: string,
    params: string = "v=full",
    enabled: boolean = true
) => {
    const {
        data,
        refetch: findEncounter,
        isLoading,
    } = useQuery(
        ["encounter", uuid],
        async () => await SharedQuery.findEncounter(uuid, params),
        {enabled}
    );

    const encounter = data ? data : undefined;
    return {
        encounter,
        findEncounter,
        isLoading,
    };
};

export const useFindFilteredObs = (patientUuid: string, concept: string, params: string = "v=default", limit: string = "1") => {
    const {
        data,
        refetch: getObs,
    } = useQuery(
        ["patient", "obs", "encounter", "information", patientUuid, concept, ""],
        async () => await SharedQuery.findFilteredObs(patientUuid, concept, params, limit)
        , {enabled: patientUuid !== ""});
    const obsList = data ? data : [];
    return {
        obsList,
        getObs
    }
}

export const useFindPatientInfo = (patientUuid: string) => {

    const {treatmentEndDateConcept, regimeConcept} = useFindSettings();
    const {encounters} = useFindFilteredEncounter(patientUuid, "8d5b27bc-c2cc-11de-8d13-0010c6dffd0f", "v=full");
    const {obsList: obtainedTransfer} = useFindFilteredObs(patientUuid, "164595AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    const {obsList: obtainedTreatmentEndDate} = useFindFilteredObs(patientUuid, treatmentEndDateConcept);
    const {obsList: regimes} = useFindFilteredObs(patientUuid, regimeConcept, "v=default", '');

    // console.log(regimeConcept)

    const transferInfo = obtainedTransfer.length > 0 ? obtainedTransfer[0] : undefined;
    const treatmentEndDateInfo = obtainedTreatmentEndDate.length > 0 ? obtainedTreatmentEndDate[0] : undefined;
    const patientInitiationEncounter = encounters.length > 0 ? encounters[0] : undefined;
    const initialTreatmentInfo =
        patientInitiationEncounter &&
        patientInitiationEncounter.obs ?
            patientInitiationEncounter.obs.find(o => o.concept.uuid === "159599AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA") : undefined
    return {
        transferInfo,
        treatmentEndDateInfo,
        patientInitiationEncounter,
        regimes,
        initialTreatmentInfo
    }
}

export const useFindFilteredEncounter = (patient: string, encounterType: string, params: string = "v=default", limit: string = "1") => {
    const {
        data,
        refetch: findEncounters,
        isLoading,
    } = useQuery(
        ["encounter", "filtered", patient, encounterType, params, limit],
        async () => await SharedQuery.findFilteredEncounter(patient, encounterType, params, limit),
        {enabled: patient !== ""}
    );

    const encounters = data && data.length > 0 ? data : [];
    return {
        encounters,
        findEncounters,
        isLoading,
    };
}

export const useFindPatientActiveFile = () => {
    const {mutate: getPatientActiveFile} = useMutation(SharedQuery.evaluatePatientActiveFile)
    return {
        getPatientActiveFile
    };
}

export const useFindSettings = () => {
    const {
        data,
        isLoading,
        refetch: getSettings,
    } = useQuery(
        ["settings", "supply"],
        async () => await SharedQuery.findSupplySettings()
    );

    const dispensationDateConcept = data
        ? Fn.extractSettingValue(data, "DispensationDate") +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        : "";

    const dispensationGoalConcept = data
        ? Fn.extractSettingValue(data, "dispensationGoalConcept") +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        : "";

    const dispensationRegimenConcept = data
        ? Fn.extractSettingValue(data, "dispensationRegimenConcept") +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        : "";

    const dispensationRegimenLineConcept = data
        ? Fn.extractSettingValue(data, "dispensationRegimenLineConcept") +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        : "";

    const dispensationTreatmentDaysConcept = data
        ? Fn.extractSettingValue(data, "dispensationTreatmentDaysConcept") +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        : "";

    const dispensationTreatmentEndDateConcept = data
        ? Fn.extractSettingValue(data, "dispensationTreatmentEndDateConcept") +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        : "";
    const emergencyControlPointCenterAndNGOs = data
        ? Fn.extractSettingValue(data, "emergencyControlPointCenterAndNGOs")
        : "";

    const emergencyControlPointDirectClient = data
        ? Fn.extractSettingValue(data, "emergencyControlPointDirectClient")
        : "";

    const emergencyControlPointDistrict = data
        ? Fn.extractSettingValue(data, "emergencyControlPointDistrict")
        : "";

    const emergencyControlPointPointOfServiceDelivery = data
        ? Fn.extractSettingValue(
            data,
            "emergencyControlPointPointOfServiceDelivery"
        )
        : "";

    const monthsForCMM = data ? Fn.extractSettingValue(data, "monthsForCMM") : "";

    const stockMaxCenterAndOrganisations = data
        ? Fn.extractSettingValue(data, "stockMaxCenterAndOrganisations")
        : "";
    const stockMaxDirectClient = data
        ? Fn.extractSettingValue(data, "stockMaxDirectClient")
        : "";

    const stockMaxDistrict = data
        ? Fn.extractSettingValue(data, "stockMaxDistrict")
        : "";

    const stockMaxPointOfServiceDelivery = data
        ? Fn.extractSettingValue(data, "stockMaxDistrict")
        : "";

    return {
        dispensationDateConcept,
        goalConcept: dispensationGoalConcept,
        regimeConcept: dispensationRegimenConcept,
        regimeLineConcept: dispensationRegimenLineConcept,
        treatmentDaysConcept: dispensationTreatmentDaysConcept,
        treatmentEndDateConcept: dispensationTreatmentEndDateConcept,
        emergencyControlPointCenterAndNGOs,
        emergencyControlPointDirectClient,
        emergencyControlPointDistrict,
        emergencyControlPointPointOfServiceDelivery,
        stockMaxCenterAndOrganisations,
        stockMaxDirectClient,
        stockMaxDistrict,
        stockMaxPointOfServiceDelivery,
        monthsForCMM,
        getSettings,
        isLoading,
    };
};

// Mutations

export const useMutateProvider = () => {
    const {mutate: saveProvider} = useMutation(async (data: any) => {
        return await SharedQuery.createProvider(data);
    });

    return {
        saveProvider,
    };
};

export const useMutatePerson = () => {
    const {mutate: savePerson} = useMutation(async (data: any) => {
        return await SharedQuery.createPerson(data);
    });

    return {
        savePerson,
    };
};
