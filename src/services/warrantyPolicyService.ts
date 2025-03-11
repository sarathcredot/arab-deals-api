import { warrantyPolicyModel } from "../models/warrantyPolicyModel";
import { categoryModel, brandModel, orderProductModel, productModel } from "../models"
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, Number, } from "mongoose";

export interface IWarrantyPolicy {
    name: string;
    description?: string | undefined | null;
    warrantyType: string[];
    duration: number;
}


export const createWarrantyPolicyBySuperAdmin = async (newWarrantyPolicyData: IWarrantyPolicy): Promise<any> => {
    try {
        console.log(":mag: Saving policy to DB:", newWarrantyPolicyData);
        let warrantyPolicy = new warrantyPolicyModel(newWarrantyPolicyData);
        const savedPolicy = await warrantyPolicy.save();
        console.log(":white_check_mark: Saved policy:", savedPolicy);
        return savedPolicy;
    } catch (error) {
        console.error("Error saving return policy:", error);
        throw new Error("Failed to save return policy");
    }
}







export const updateWarrantyPolicyByAdmin = async (warrantyPolicyId: Types.ObjectId, updatePolicyData: IWarrantyPolicy): Promise<any> => {
    const updatePolicy = await warrantyPolicyModel.findByIdAndUpdate(warrantyPolicyId, updatePolicyData, { new: true });
    return updatePolicy;
}

export const deleteWarrantyPolicyByAdmin = async (warrantyPolicyId: Types.ObjectId): Promise<any> => {
    const deletePolicy = await warrantyPolicyModel.findByIdAndUpdate(warrantyPolicyId, { isDeleted: true }, { new: true });
    return deletePolicy;
}

export const updateStatusWarrantyPolicyByAdmin = async (warrantyPolicyId: Types.ObjectId, isEnable: boolean): Promise<any> => {
    const updateStatus = await warrantyPolicyModel.findByIdAndUpdate(warrantyPolicyId, { isEnable: isEnable }, { new: true });
    return updateStatus;
}


export const getAllWarrantyPoliciesBySuperAdmin = async (options: any, matchQuery: any): Promise<any> => {
    try {
        //  console.log(matchQuery,options)
        let count = await warrantyPolicyModel.aggregate([
            {
                $match: matchQuery
            },
            {
                $count: "count"
            }
        ])
        console.log("count", count)
        const result = await warrantyPolicyModel.aggregate([
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $match: matchQuery
            },
            {
                $skip: options.page * options.size
            },
            {
                $limit: options.size
            }
        ])
        //  console.log("result",result)
        let response: any = {
            records: [],
            maxRecords: 0,
        };
        if (result.length) {
            response.records = result || [];
            response.maxRecords = count[0].count || 0
        }
        return response
    } catch (error) {
        throw error
    }
}



export const getDefaultWarrantyPolicyInCategory = async (id: Types.ObjectId): Promise<any> => {



    return new Promise(async (resolver, reject) => {

        try {


            if (id) {



                const result: any = await categoryModel.findOne({ _id: id })

                if (!result.warrantyPolicy) {


                    const allCategories = result.path.split("#")

                    for (let i = allCategories.length - 1; i >= 0; i--) {

                        if (allCategories[i]) {

                            const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                            if (categorie.warrantyPolicy) {

                                const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categorie.returnPolicy })

                                if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                                    resolver(warrantyPolicyData)
                                    return;

                                }
                            }
                        }
                    }

                    resolver(null)

                    return;



                } else {

                    const warrantyPolicyData: any = await warrantyPolicyModel.find({ _id: result.warrantyPolicy })

                    if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                        resolver(warrantyPolicyData)
                        return;

                    } else {


                        const allCategories = result.path.split("#")

                        for (let i = allCategories.length - 1; i >= 0; i--) {

                            if (allCategories[i]) {

                                const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                if (categorie.warrantyPolicy) {

                                    const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categorie.returnPolicy })

                                    if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                                        resolver(warrantyPolicyData)
                                        return;

                                    }
                                }
                            }
                        }

                        resolver(null)
                        return;


                    }


                }


            }




        } catch (error) {

            reject()
        }

    })
}




export const getDefaultWarrantyPolicyInProduct = async (brandId: Types.ObjectId, categoryId: Types.ObjectId): Promise<any> => {


    return new Promise(async (resolve, reject) => {

        console.log("cat id", categoryId)

        try {


            const brandData = await brandModel.findOne({ _id: brandId })

            if (!brandData) {

                reject()
                return
            } else {

                if (!brandData.warrantyPolicy) {

                    // check Category returnPolicy

                    const categoryData: any = await categoryModel.findOne({ _id: categoryId })

                    if (!categoryData.warrantyPolicy) {

                        const allCategories = categoryData.path.split("#")

                        for (let i = allCategories.length - 1; i >= 0; i--) {

                            if (allCategories[i]) {

                                const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                if (categorie.warrantyPolicy) {

                                    const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categorie.warrantyPolicy })

                                    if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                                        resolve(warrantyPolicyData)
                                        return
                                    }
                                }
                            }
                        }

                        resolve(null)
                        return;


                    } else {

                        const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categoryData.warrantyPolicy })


                        if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                            resolve(warrantyPolicyData)
                            return;
                        } else {


                            const allCategories = categoryData.path.split("#")

                            for (let i = allCategories.length - 1; i >= 0; i--) {

                                if (allCategories[i]) {

                                    const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                    if (categorie.returnPolicy) {

                                        const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categorie.warrantyPolicy })

                                        if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                                            resolve(warrantyPolicyData)
                                            return
                                        }
                                    }
                                }
                            }

                            reject(null)
                            return;



                        }


                    }


                } else {


                    const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: brandData.warrantyPolicy })

                    console.log("cat plo", warrantyPolicyData)

                    if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                        resolve(warrantyPolicyData)
                        return;

                    } else {

                        // check Category returnPolicy

                        const categoryData: any = await categoryModel.findOne({ _id: categoryId })
                        if (!categoryData.warrantyPolicy) {

                            const allCategories = categoryData.path.split("#")

                            for (let i = allCategories.length - 1; i >= 0; i--) {

                                if (allCategories[i]) {

                                    const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                    if (categorie.warrantyPolicy) {

                                        const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categorie.warrantyPolicy })

                                        if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                                            resolve(warrantyPolicyData)
                                            return
                                        }
                                    }
                                }
                            }

                            resolve(null)
                            return;

                        } else {


                            const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categoryData.warrantyPolicy })


                            if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                                resolve(warrantyPolicyData)
                                return;
                            } else {


                                const allCategories = categoryData.path.split("#")

                                for (let i = allCategories.length - 1; i >= 0; i--) {

                                    if (allCategories[i]) {

                                        const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                        if (categorie.returnPolicy) {

                                            const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categorie.warrantyPolicy })

                                            if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                                                resolve(warrantyPolicyData)
                                                return
                                            }
                                        }
                                    }
                                }

                                resolve(null)
                                return;


                            }


                        }



                    }


                }


            }



        } catch (error) {


            reject()
        }
    })

}



export const getWarrantyPolicyOfOrderProduct = async (orderProductId: Types.ObjectId): Promise<any> => {
    const result = await orderProductModel.aggregate([
        {
            $match: { _id: orderProductId }
        },
        {
            $project: {
                "warranty.name": 1,
                "warranty.duration": 1,
                "warranty.warrantyType": 1,
                "warranty.description": 1,
                "warranty.warrantyRegister": 1
            }
        }
    ]);
    console.log("result", result)
    return result.length > 0 ? result[0] : null;
};


export const getDefaultWarrantyPolicyVariantCreate = (productCode: number): Promise<any> => {


    return new Promise(async (resolve, reject) => {

        try {

            const parentProduct: any = await productModel.findOne({ productCode: productCode })

            // check has parentProduct a warranty policy

            if (parentProduct.warrantyPolicy) {

                const obj = {

                    WarrantyPolicyData: parentProduct?.warrantyPolicy,
                    policyGet: true
                }

                resolve(obj)
            } else {

                const brandData = await brandModel.findOne({ _id: parentProduct?.brandId })

                if (!brandData) {

                    reject()
                    return
                } else {

                    if (!brandData.warrantyPolicy) {

                        // check Category returnPolicy

                        const categoryData: any = await categoryModel.findOne({ _id: parentProduct?.categoryId })

                        if (!categoryData.warrantyPolicy) {

                            const allCategories = categoryData.path.split("#")

                            for (let i = allCategories.length - 1; i >= 0; i--) {

                                if (allCategories[i]) {

                                    const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                    if (categorie.warrantyPolicy) {

                                        const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categorie.warrantyPolicy })

                                        if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                                            const obj = {

                                                WarrantyPolicyData: warrantyPolicyData,
                                                policyGet: false
                                            }

                                            resolve(obj)
                                            return
                                        }
                                    }
                                }
                            }

                            resolve(null)
                            return;


                        } else {

                            const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categoryData.warrantyPolicy })


                            if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                                const obj = {

                                    WarrantyPolicyData: warrantyPolicyData,
                                    policyGet: false
                                }

                                resolve(obj)
                                return;
                            } else {


                                const allCategories = categoryData.path.split("#")

                                for (let i = allCategories.length - 1; i >= 0; i--) {

                                    if (allCategories[i]) {

                                        const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                        if (categorie.returnPolicy) {

                                            const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categorie.warrantyPolicy })

                                            if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {
                                                const obj = {

                                                    WarrantyPolicyData: warrantyPolicyData,
                                                    policyGet: false
                                                }
                                                resolve(obj)
                                                return
                                            }
                                        }
                                    }
                                }

                                reject(null)
                                return;



                            }


                        }


                    } else {


                        const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: brandData.warrantyPolicy })

                        console.log("cat plo", warrantyPolicyData)

                        if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                            const obj = {

                                WarrantyPolicyData: warrantyPolicyData,
                                policyGet: false
                            }

                            resolve(obj)
                            return;

                        } else {



                            const categoryData: any = await categoryModel.findOne({ _id: parentProduct.categoryId })
                            if (!categoryData.warrantyPolicy) {

                                const allCategories = categoryData.path.split("#")

                                for (let i = allCategories.length - 1; i >= 0; i--) {

                                    if (allCategories[i]) {

                                        const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                        if (categorie.warrantyPolicy) {

                                            const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categorie.warrantyPolicy })

                                            if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                                                const obj = {

                                                    WarrantyPolicyData: warrantyPolicyData,
                                                    policyGet: false
                                                }
                                                resolve(obj)
                                                return
                                            }
                                        }
                                    }
                                }

                                resolve(null)
                                return;

                            } else {


                                const warrantyPolicyData : any = await warrantyPolicyModel.findOne({ _id: categoryData.warrantyPolicy })


                                if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                                    const obj = {

                                        WarrantyPolicyData: warrantyPolicyData,
                                        policyGet: false
                                    }

                                    resolve(obj)
                                    return;
                                } else {


                                    const allCategories = categoryData.path.split("#")

                                    for (let i = allCategories.length - 1; i >= 0; i--) {

                                        if (allCategories[i]) {

                                            const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                            if (categorie.returnPolicy) {

                                                const warrantyPolicyData: any = await warrantyPolicyModel.findOne({ _id: categorie.warrantyPolicy })

                                                if (warrantyPolicyData.isDeleted === false && warrantyPolicyData.isEnable === true) {

                                                    const obj = {

                                                        WarrantyPolicyData: warrantyPolicyData,
                                                        policyGet: false
                                                    }

                                                    resolve(obj)
                                                    return
                                                }
                                            }
                                        }
                                    }

                                    resolve(null)
                                    return;


                                }


                            }



                        }


                    }


                }




            }



        } catch (error) {

            reject(error)
        }
    })
}

