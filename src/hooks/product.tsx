import {useMutation, useQuery} from "react-query";
import {ProductRegime, ProductSave} from "../models/Product";
import ProductService from "../services/ProductService";

export const useFindProgram = (program: string, params: string = "v=full") => {
    const {data, refetch: getProgram} = useQuery(
        ["productProgram", program],
        async () => await ProductService.findProgram(program, params)
    );

    const productProgram = data ? data : undefined;
    return {
        productProgram,
        getProgram,
    };
};

export const useFindAllProducts = (params: string = "") => {
    const {
        data,
        refetch: getProducts,
        isLoading,
    } = useQuery(
        ["products", "all", params],
        async () => await ProductService.findAll(params)
    );

    const products = data ? data : [];
    return {
        products,
        getProducts,
        isLoading,
    };
};

export const useLocationPrograms = () => {
    const {data, refetch: getLocationPrograms} = useQuery(
        ["productProgram", "all", "location"],
        async () => {
            return await ProductService.findAllPrograms("filter=location");
        }
    );

    const programs = data ? data : [];
    const programSelectList = data
        ? data.map((p) => {
            return {value: p.uuid, label: p.name};
        })
        : [];
    return {
        programs,
        getLocationPrograms,
        programSelectList,
    };
};

export const useFindPrograms = () => {
    const {data, refetch: getPrograms} = useQuery(
        ["productProgram", "all"],
        async () => {
            return await ProductService.findAllPrograms("");
        }
    );

    const programs = data ? data : [];
    const programSelectList = data
        ? data.map((p) => {
            return {value: p.uuid, label: p.name};
        })
        : [];
    const programSelectListName = data
        ? data.map((p) => {
            return {value: p.name, label: p.name};
        })
        : [];
    return {
        programs,
        getPrograms,
        programSelectList,
        programSelectListName,
    };
};

export const useProgramProducts = (program: string, filter: string = "") => {
    const {data, refetch: getProgramProducts} = useQuery(
        ["products-program", program, filter],
        async () => await ProductService.findAllByProgram(program, filter)
    );

    const products = data ? data : [];

    const productSelectList = data
        ? data.map((p) => {
            const name = p.names.find((n) => n.productNameType === "DISPENSATION");
            return {
                value: p.uuid,
                label: `${p.code} - ${p.dispensationName} (${
                    name ? name.unit.name : ""
                })`,
            };
        })
        : [];

    // console.log("productSelectList", productSelectList, "filter", filter);

    return {
        products,
        getProgramProducts,
        productSelectList,
    };
};

export const useFindProduct = (uuid: string) => {
    const {data: product, refetch: getProduct} = useQuery(
        ["products", uuid],
        async () => await ProductService.findById(uuid, "v=full"),
        {enabled: false}
    );

    return {
        product,
        getProduct,
    };
};

export const useFindUnits = (params: string = "v=full") => {
    const {data, refetch: getUnits} = useQuery(
        ["products", "units", "all"],
        async () => await ProductService.findAllUnits(params),
        {enabled: true}
    );

    const units = data ? data : []

    return {
        units,
        getUnits,
    };
};

export const useGetRegimes = (params: string = "") => {
    const {data, refetch: getProductRegime} = useQuery(
        ["product-regimes", params],
        async () => await ProductService.findAllRegimes(params),
        {enabled: true}
    );

    const productRegimes = data ? data : [];
    const productRegimeSelectList = data
        ? data.map((p: ProductRegime) => {
            return {label: p.concept.display, value: p.uuid};
        })
        : [];

    const productRegimeSelectName = data
        ? data.map((p: ProductRegime) => {
            return {label: p.concept.display, value: p.concept.display};
        })
        : [];

    return {
        productRegimes,
        getProductRegime,
        productRegimeSelectList,
        productRegimeSelectName,
    };
};

export const useFindProductAttributeBatchNumber = (
    batchNumber: string,
    product: string
) => {
    const {data: attribute, refetch: getAttribute} = useQuery(
        ["inventory-product-attribute", batchNumber + "-" + product],
        async () => await ProductService.findAttribute(product, batchNumber),
        {enabled: false}
    );
    return {
        attribute,
        getAttribute,
    };
};

export const useProductAttributeMutation = () => {
    const {mutate: createAttribute} = useMutation(
        ProductService.createProductAttribute
    );

    const {mutate: updateAttribute} = useMutation(
        async (data: { attribute: any; attributeUuid: string }) => {
            return await ProductService.updateProductAttribute(
                data.attribute,
                data.attributeUuid
            );
        }
    );

    return {
        createAttribute,
        updateAttribute,
    };
};

export const useProductMutation = (uuid: string = "") => {
    const {mutate: createProduct} = useMutation(ProductService.createProduct);
    const {mutate: createProgram} = useMutation(ProductService.createProgram);
    const {mutate: createUnit} = useMutation(ProductService.createUnit);

    const {mutate: updateProduct} = useMutation(
        async (product: ProductSave) => {
            return await ProductService.updateProduct(product, product.uuid);
        }
    );

    const {mutate: updateProductProgram} = useMutation(
        async (data: any) => {
            return await ProductService.updateProductProgram({uuid: data.program}, data.product);
        }
    );

    const {mutate: updateProductRegime} = useMutation(
        async (data: any) => {
            return await ProductService.updateProductRegime({uuid: data.regime}, data.product);
        }
    );

    return {
        createProduct,
        updateProduct,
        updateProductRegime,
        updateProductProgram,
        createProgram,
        createUnit
    };
};
