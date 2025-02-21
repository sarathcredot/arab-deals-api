import { returnPolicyModel } from "../models/returnPolicyModel";
import { categoryModel } from "../models/categoryModel"
import { brandModel } from "../models/brandModel"
import { shippingConfigModel } from "../models/shippingConfigModel"

import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, Number, } from "mongoose";
import { orderProductModel } from "../models/orderProductModel";


export interface IReturnPolicy {
    name: string;
    description?: string | undefined | null;
    // conditions?: string[];
    duration: number;
    returnCharge?: number | undefined | null
}

export const createReturnPolicyBySuperAdmin = async (newReturnPolicyData: IReturnPolicy): Promise<any> => {
    try {
        console.log(":mag: Saving policy to DB:", newReturnPolicyData);
        let returnPolicy = new returnPolicyModel(newReturnPolicyData);
        const savedPolicy = await returnPolicy.save();  
        console.log(":white_check_mark: Saved policy:", savedPolicy);
        return savedPolicy;
    } catch (error) {
        console.error("Error saving return policy:", error);
        throw new Error("Failed to save return policy");
    }
}
export const getAllPoliciesBySuperAdmin = async (options: any, matchQuery: any): Promise<any> => {
    try {
        //  console.log(matchQuery,options)
        let count = await returnPolicyModel.aggregate([
            {
                $match: matchQuery
            },
            {
                $count: "count"
            }
        ])
        console.log("count", count)
        const result = await returnPolicyModel.aggregate([
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
export const updateReturnPolicyByAdmin = async (returnPolicyId: Types.ObjectId, updatePolicyData: IReturnPolicy): Promise<any> => {
    const updateRole = await returnPolicyModel.findByIdAndUpdate(returnPolicyId, updatePolicyData, { new: true });
    return updateRole;
}
export const deleteReturnPolicyByAdmin = async (returnPolicyId: Types.ObjectId): Promise<any> => {
    const deletePolicy = await returnPolicyModel.findByIdAndUpdate(returnPolicyId, { isDeleted: true }, { new: true });
    return deletePolicy;
}
export const updateStatusReturnPolicyByAdmin = async (returnPolicyId: Types.ObjectId, isEnable: boolean): Promise<any> => {
    const updateRole = await returnPolicyModel.findByIdAndUpdate(returnPolicyId, { isEnable: isEnable }, { new: true });
    return updateRole;
}

export const getReturnPolicyOfOrderProduct = async (orderProductId: Types.ObjectId): Promise<any> => {
    const result = await orderProductModel.aggregate([
        {
            $match: { _id: orderProductId }
        },
        {
            $project: {
                returnPolicyName: 1,
                returnCharge: 1,
                returnPolicyDescription: 1,
                returnPeriod: 1,
            }
        }
    ]);

    return result.length > 0 ? result[0] : null;
};


export const getDefaultReturnPolicyInCategory = async (id: Types.ObjectId): Promise<any> => {


    return new Promise(async (resolve, reject) => {

        try {

            if (!id) {

                const defaultreturnPolicy = await shippingConfigModel.aggregate([

                    {
                        "$lookup": {
                            "from": "return_policies",
                            "localField": "defaultReturnPolicy",
                            "foreignField": "_id",
                            "as": "result"
                        }
                    }
                ])

                const defaultreturnPolicyFinal = defaultreturnPolicy[0]?.result[0]

                resolve(defaultreturnPolicyFinal)
                return;


            }

            const result: any = await categoryModel.findOne({ _id: id })

            if (!result.returnPolicy) {

                const allCategories = result.path.split("#")

                for (let i = allCategories.length - 1; i >= 0; i--) {

                    if (allCategories[i]) {

                        const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                        if (categorie.returnPolicy) {

                            const returnPolicy: any = await returnPolicyModel.findOne({ _id: categorie.returnPolicy })

                            if (!returnPolicy.delete) {

                                resolve(returnPolicy)
                                return
                            }
                        }
                    }
                }

                const defaultreturnPolicy = await shippingConfigModel.aggregate([

                    {
                        "$lookup": {
                            "from": "return_policies",
                            "localField": "defaultReturnPolicy",
                            "foreignField": "_id",
                            "as": "result"
                        }
                    }
                ])

                const defaultreturnPolicyFinal = defaultreturnPolicy[0]?.result[0]

                resolve(defaultreturnPolicyFinal)

            } else {

                const returnPolicy: any = await returnPolicyModel.findOne({ _id: result.returnPolicy })

                if (returnPolicy.isdeleted) {

                    const allCategories = result.path.split("#")

                    for (let i = allCategories.length - 1; i >= 0; i--) {

                        if (allCategories[i]) {

                            const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                            if (categorie.returnPolicy) {

                                const returnPolicy: any = await returnPolicyModel.findOne({ _id: categorie.returnPolicy })

                                if (!returnPolicy.delete) {

                                    resolve(returnPolicy)
                                    return
                                }
                            }
                        }
                    }

                    const defaultreturnPolicy = await shippingConfigModel.aggregate([

                        {
                            "$lookup": {
                                "from": "return_policies",
                                "localField": "defaultReturnPolicy",
                                "foreignField": "_id",
                                "as": "result"
                            }
                        }
                    ])

                    const defaultreturnPolicyFinal = defaultreturnPolicy[0]?.result[0]

                    resolve(defaultreturnPolicyFinal)

                } else {

                    resolve(returnPolicy)
                    return;
                }
            }


        } catch (error) {

            console.log("error", error)

            reject()

        }
    })

}


export const getDefaultReturnPolicyInProduct = async (brandId: Types.ObjectId, categoryId: Types.ObjectId): Promise<any> => {


    return new Promise(async (resolve, reject) => {

        console.log("cat id", categoryId)

        try {


            const brandData = await brandModel.findOne({ _id: brandId })

            if (!brandData) {

                reject()
                return
            } else {

                if (!brandData.returnPolicy) {

                    // check Category returnPolicy

                    const categoryData: any = await categoryModel.findOne({ _id: categoryId })

                    if (!categoryData.returnPolicy) {

                        const allCategories = categoryData.path.split("#")

                        for (let i = allCategories.length - 1; i >= 0; i--) {

                            if (allCategories[i]) {

                                const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                if (categorie.returnPolicy) {

                                    const returnPolicy: any = await returnPolicyModel.findOne({ _id: categorie.returnPolicy })

                                    if (!returnPolicy.delete) {

                                        resolve(returnPolicy)
                                        return
                                    }
                                }
                            }
                        }

                        const defaultreturnPolicy = await shippingConfigModel.aggregate([

                            {
                                "$lookup": {
                                    "from": "return_policies",
                                    "localField": "defaultReturnPolicy",
                                    "foreignField": "_id",
                                    "as": "result"
                                }
                            }
                        ])

                        const defaultreturnPolicyFinal = defaultreturnPolicy[0]?.result[0]

                        resolve(defaultreturnPolicyFinal)


                    } else {

                        const returnPolicy: any = await returnPolicyModel.findOne({ _id: categoryData.returnPolicy })


                        if (!returnPolicy.delete) {

                            resolve(returnPolicy)
                            return
                        } else {


                            const allCategories = categoryData.path.split("#")

                            for (let i = allCategories.length - 1; i >= 0; i--) {

                                if (allCategories[i]) {

                                    const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                    if (categorie.returnPolicy) {

                                        const returnPolicy: any = await returnPolicyModel.findOne({ _id: categorie.returnPolicy })

                                        if (!returnPolicy.delete) {

                                            resolve(returnPolicy)
                                            return
                                        }
                                    }
                                }
                            }

                            const defaultreturnPolicy = await shippingConfigModel.aggregate([

                                {
                                    "$lookup": {
                                        "from": "return_policies",
                                        "localField": "defaultReturnPolicy",
                                        "foreignField": "_id",
                                        "as": "result"
                                    }
                                }
                            ])

                            const defaultreturnPolicyFinal = defaultreturnPolicy[0]?.result[0]

                            resolve(defaultreturnPolicyFinal)



                        }


                    }


                } else {


                    const returnPolicy: any = await returnPolicyModel.findOne({ _id: brandData.returnPolicy })

                    console.log("cat plo", returnPolicy)

                    if (!returnPolicy.isDeleted) {

                        resolve(returnPolicy)
                        return;

                    } else {

                        // check Category returnPolicy

                        const categoryData: any = await categoryModel.findOne({ _id: categoryId })
                        if (!categoryData.returnPolicy) {

                            const allCategories = categoryData.path.split("#")

                            for (let i = allCategories.length - 1; i >= 0; i--) {

                                if (allCategories[i]) {

                                    const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                    if (categorie.returnPolicy) {

                                        const returnPolicy: any = await returnPolicyModel.findOne({ _id: categorie.returnPolicy })

                                        if (!returnPolicy.delete) {

                                            resolve(returnPolicy)
                                            return
                                        }
                                    }
                                }
                            }

                            const defaultreturnPolicy = await shippingConfigModel.aggregate([

                                {
                                    "$lookup": {
                                        "from": "return_policies",
                                        "localField": "defaultReturnPolicy",
                                        "foreignField": "_id",
                                        "as": "result"
                                    }
                                }
                            ])

                            const defaultreturnPolicyFinal = defaultreturnPolicy[0]?.result[0]

                            resolve(defaultreturnPolicyFinal)
                        } else {

                            const returnPolicy: any = await returnPolicyModel.findOne({ _id: categoryData.returnPolicy })


                            if (!returnPolicy.delete) {

                                resolve(returnPolicy)
                                return
                            } else {


                                const allCategories = categoryData.path.split("#")

                                for (let i = allCategories.length - 1; i >= 0; i--) {

                                    if (allCategories[i]) {

                                        const categorie: any = await categoryModel.findOne({ _id: allCategories[i] })

                                        if (categorie.returnPolicy) {

                                            const returnPolicy: any = await returnPolicyModel.findOne({ _id: categorie.returnPolicy })

                                            if (!returnPolicy.delete) {

                                                resolve(returnPolicy)
                                                return
                                            }
                                        }
                                    }
                                }

                                const defaultreturnPolicy = await shippingConfigModel.aggregate([

                                    {
                                        "$lookup": {
                                            "from": "return_policies",
                                            "localField": "defaultReturnPolicy",
                                            "foreignField": "_id",
                                            "as": "result"
                                        }
                                    }
                                ])

                                const defaultreturnPolicyFinal = defaultreturnPolicy[0]?.result[0]

                                resolve(defaultreturnPolicyFinal)



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
