import {EditableCell} from "../components/tables/EditableCell";
import {ProductAttribute, ProductQuantity} from "../models/Product";
import {
    ProductOperation,
    ProductOperationAttribute,
    ProductOperationFlux,
    ProductOperationFluxAttribute,
} from "../models/ProductOperation";
import {DataSetPatientActiveFile, Encounter, LocationAttribute, Settings} from "../models/shared";
import {LocationAttributeType} from "./constants";

const getAttributeValue = (
    attributes: ProductOperationAttribute[],
    attribute: string
): string | undefined => {
    const operationAttribute = attributes.find(
        (a) => a.operationAttributeType?.uuid === attribute
    );
    if (operationAttribute) {
        return operationAttribute.value;
    }

    return undefined;
};

const extractInformation = (
    productAttributes: ProductOperationFluxAttribute[] | undefined,
    productUuid: string | undefined,
    field: string
): any => {
    // console.log(productAttributes);
    if (productAttributes && productAttributes.length > 0 && productUuid) {
        // console.log(productAttributes);
        const productAttribute = productAttributes.find(
            (a) => a.attribute.product.uuid === productUuid
        );
        if (productAttribute) {
            for (const [key, value] of Object.entries(productAttribute)) {
                if (key === field) return value;
            }
        }
    }
    return "";
};

const extractOperationAttribute = (
    productOperation: ProductOperation,
    attribute: string
): ProductOperationAttribute | undefined => {
    if (productOperation.attributes) {
        return extractAttribute(productOperation.attributes, attribute);
    }
    return undefined;
};

const extractOperationAttributeValue = (
    productOperation: ProductOperation,
    attribute: string
): any => {
    if (productOperation.attributes) {
        const attr = extractAttribute(productOperation.attributes, attribute);
        if (attr) {
            return attr.value;
        }
    }
    return undefined;
};

const extractAttribute = (
    attributes: ProductOperationAttribute[],
    uuid: string
): ProductOperationAttribute | undefined => {
    if (attributes.length === 0) {
        for (const operationAttribute of attributes) {
            if (operationAttribute.operationAttributeType.uuid === uuid) {
                return operationAttribute;
            }
        }
    }
    return undefined;
};

type ColumnInfo = {
    replacePosition: number;
    header: string;
    accessor: string;
    columId: string;
    columIdOther?: string;
    updateData: (id: any, id2: any, value: any) => void;
    width: number;
};
const transform = (header: any, columns: ColumnInfo[]) => {
    columns.forEach((column) => {
        header.splice(column.replacePosition, 1, {
            header: column.header,
            accessor: (data: any) => data[column.accessor],
            with: column.width,
            Cell: (data: any) => {
                const value = data.row.values[header] ? data.row.values[header] : "";
                return (
                    <EditableCell
                        value={value}
                        column={{
                            id: data.row.values[column.columId],
                            attribute: column.columIdOther
                                ? data.row.values[column.columIdOther]
                                : "",
                        }}
                        updateData={column.updateData}
                    />
                );
            },
        });
    });

    return header;
};

export const extractProductAttributes = (
    fluxes: ProductOperationFlux[]
): ProductAttribute[] => {
    return fluxes.reduce((acc: ProductAttribute[], flux) => {
        if (flux.attributes) {
            const attributes = flux.attributes.map(
                (attribute) => attribute.attribute
            );
            acc.push(...attributes);
        }
        return acc;
    }, []);
};

const extractLocationAttributes = (attributes: LocationAttribute[]) => {
    const directClientAttribute: LocationAttribute | undefined = findAttribute(
        attributes,
        LocationAttributeType.DIRECT_CLIENT
    );
    const programAttribute: LocationAttribute | undefined = findAttribute(
        attributes,
        LocationAttributeType.LOCATION_PROGRAMS
    );
    const code: LocationAttribute | undefined = findAttribute(
        attributes,
        LocationAttributeType.LOCATION_CODE
    );
    return {
        directClientAttribute,
        programAttribute,
        code,
    };
};

const findAttribute = (
    attributes: LocationAttribute[],
    attributeUuid: string
) => {
    return attributes.find(
        (a: LocationAttribute) => a.attributeType.uuid === attributeUuid
    );
};

const getProductStock = (
    stocks: ProductQuantity[],
    program: string
): number | null => {
    // console.log(stocks);
    const programStock = stocks.find((s) => s.program === program);
    return programStock ? programStock.quantity : null;
};

const extractEncounterObsValue = (encounter: Encounter, concept: string) => {
    const obs = encounter.obs.find((o) => o.concept.uuid === concept);
    return obs ? obs.value : undefined;
};

const extractSettingValue = (encounter: Settings[], propertySearch: string) => {
    const setting = encounter.find((o) => o.property.includes(propertySearch));
    return setting ? setting.value : "";
};


const transformDataSet = (data: { rows: any[], metadata: any }): DataSetPatientActiveFile[] => {
    return data.rows.map(row => {
        return {
            identifier: row.Identifiant,
            dispensationDate: row.DateDerniereDispensation,
            regime: row.DernierRegimeDispense,
            treatmentDuration: row.NbreJourTraitement,
            treatmentEndDate: row.DateFinTraitement,
            gender: row.Sexe,
            age: row.Age
        }
    })
}

export const Fn = {
    getAttributeValue,
    extractInformation,
    transform,
    extractProductAttributes,
    extractOperationAttribute,
    extractAttribute,
    extractLocationAttributes,
    getProductStock,
    extractEncounterObsValue,
    extractSettingValue,
    extractOperationAttributeValue,
    transformDataSet
};
