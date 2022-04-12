import {Incidence, OperationStatus, QuantityType} from "./enums";
import {Product, ProductAttribute, ProductProgram, ProductRegime} from "./Product";
import {Encounter} from "./shared";

export interface ProductOperationAttributeSave {
    operationAttributeType: string;
    value: any;
    location: string;
    uuid?: string;
}

export interface ProductOperationAttributeType {
    name: string;
    description?: string;
    format?: string;
    foreignKey?: number;
    sortWeight?: number;
    searchable?: boolean;
    uuid: string;
}

export interface ProductOperationAttribute {
    operationAttributeType: ProductOperationAttributeType;
    value: any;
    location: any;
    uuid: string;
    display: string;
}

export const productOperationAttributeToSave = (
    data: ProductOperationAttribute
): ProductOperationAttributeSave => {
    return {
        value: data.value,
        operationAttributeType: data.operationAttributeType.uuid,
        location: data.location.uuid,
    };
};

export interface ProductOperation {
    operationNumber?: string;
    productProgram: ProductProgram;
    operationDate: Date;
    operationType: ProductOperationType;
    parentOperation?: ProductOperation;
    operationStatus: OperationStatus;
    incidence: Incidence;
    quantityType: QuantityType;
    observation?: string;
    fluxes: ProductOperationFlux[];
    otherFluxes?: ProductOperationOtherFlux[];
    attributes?: ProductOperationAttribute[];
    fluxAttributes?: ProductOperationFluxAttribute[];
    childrenOperation?: ProductOperation[];
    exchangeLocation?: any;
    location: any;
    uuid: string;
}

export interface ProductOperationSave {
    operationNumber?: string;
    productProgram: string;
    operationDate: Date;
    operationType: string;
    parentOperation?: string;
    operationStatus?: OperationStatus;
    incidence?: Incidence;
    quantityType?: QuantityType;
    observation?: string;
    fluxes?: ProductOperationFluxSave[];
    otherFluxes?: ProductOperationOtherFluxSave[];
    attributes?: ProductOperationAttributeSave[];
    exchangeLocation?: string;
    location: any;
    uuid?: string;
}

export interface ProductDispensationUpdate {
    age?: number;
    gender?: string;
    treatmentDuration?: number;
    treatmentEndDate?: Date;
    productRegime?: string;
    regimeLine?: number;
    encounter?: string;
    goal?: string;
    provider?: string;
    prescriptionDate?: Date;
    operationStatus: OperationStatus;
}

export interface ProductDispensation extends ProductOperation {
    age?: number;
    gender?: string;
    treatmentDuration?: number;
    treatmentEndDate?: Date;
    productRegime?: ProductRegime;
    regimeLine?: number;
    encounter?: Encounter;
    goal?: string;
    provider?: any;
    prescriptionDate?: Date;
}

export interface ProductDispensationSave extends ProductOperationSave {
    age?: number;
    gender?: string;
    treatmentDuration?: number;
    treatmentEndDate?: Date;
    productRegime?: string;
    regimeLine?: number;
    encounter?: string;
    goal?: string;
    provider?: string;
    prescriptionDate?: Date;
}

export interface ProductOperationType {
    name: string;
    defaultIncidence?: Incidence;
    description?: string;
    operationAttributeTypes?: ProductOperationAttributeType[];
    uuid: string;
}

export interface ProductOperationFlux {
    product: Product;
    quantity: number;
    relatedQuantity: number;
    relatedQuantityLabel: string;
    observation?: string;
    location?: any;
    attributes?: ProductOperationFluxAttribute[];
    uuid?: string;
}

export interface ProductOperationFluxSave {
    product: string;
    quantity: number;
    relatedQuantity?: number;
    relatedQuantityLabel?: string;
    location: string;
    observation?: string;
    attributes?: ProductOperationFluxAttributeSave[];
    uuid?: string;
}

export interface ProductOperationFluxAttribute {
    quantity: number;
    attribute: ProductAttribute;
    location: any;
    uuid: string;
}

export interface ProductOperationFluxAttributeSave {
    quantity: number;
    attribute: string;
    location: string;
    uuid?: string;
}

export interface ProductOperationOtherFlux {
    product: Product | string;
    productAttribute?: ProductAttribute | string;
    label: string;
    quantity: number;
    location?: any;
    uuid?: string;
}

export interface ProductOperationOtherFluxSave {
    product: string;
    productAttribute?: string;
    label: string;
    quantity: number;
    location: any;
    uuid?: string;
}

export interface ProductAttributeStock {
    attribute: ProductAttribute;
    operation: ProductOperation;
    quantityInStock: number;
    location?: any;
    uuid?: string;
}

export interface ProductAttributeStockSave {
    attribute: string;
    operation: string;
    quantityInStock: number;
    location: any;
    uuid?: string;
}
