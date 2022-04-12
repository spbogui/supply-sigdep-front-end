export interface ProductQuantity {
    program: string;
    quantity: number;
}

export interface Product {
    code: string;
    conversionUnit: number;
    programs?: ProductProgram[];
    regimes?: ProductRegime[];
    names: ProductName[];
    prices?: ProductPrice[];
    currentPrice?: ProductPrice;
    dispensationName?: string;
    packagingName?: string;
    stock: ProductQuantity[];
    stockAll: ProductQuantity[];
    uuid: string;
}

export interface ProductSave {
    code: string;
    conversionUnit: number;
    programs: string[];
    regimes?: string[];
    names: ProductNameSave[];
    prices: ProductPriceSave[];
    uuid: string;
}

export interface ProductAttribute {
    product: Product;
    batchNumber: string;
    expiryDate: Date;
    quantityInStock?: number;
    location: any;
    uuid: string;
}

export interface ProductAttributeSave {
    product: string;
    batchNumber: string;
    expiryDate: Date;
    location: any;
    uuid?: string;
}

export interface ProductName {
    productNameType: string;
    name: string;
    unit: ProductUnit;
    uuid?: string;
}

export interface ProductNameSave {
    productNameType: string;
    name: string;
    unit: string;
    uuid?: string;
}

export interface ProductUnit {
    name: string;
    description?: string;
    uuid: string;
}

export interface ProductRegime {
    concept: any;
    uuid: string;
}

export interface ProductProgram {
    name: string;
    description?: string;
    uuid: string;
}

export interface ProductPrice {
    program: ProductProgram;
    salePrice: number;
    purchasePrice?: number;
    active?: boolean;
    location?: any;
}

export interface ProductPriceSave {
    program: string;
    salePrice: number;
    purchasePrice?: number;
    active?: boolean;
    location?: any;
}
