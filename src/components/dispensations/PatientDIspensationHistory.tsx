import React from 'react';
import PatientDispensationList from "./PatientDispensationList";

type PatientDispensationHistoryProps = {
    identifier: string;
    dispensationUuid: string;
};

const PatientDispensationHistory = (props: PatientDispensationHistoryProps) => {
    const {identifier, dispensationUuid} = props;
    return (
        <>
            <PatientDispensationList
                title="Historique des dispensations"
                identifier={identifier}
                operationSelected={dispensationUuid}
                validated={true}
            />
            <PatientDispensationList
                title="Dispensations en cours de saisie"
                identifier={identifier}
                operationSelected={dispensationUuid}
                validated={false}
            />
        </>
    );
};

export default PatientDispensationHistory;
