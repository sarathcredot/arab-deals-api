import { returnPolicyModel } from "../models/returnPolicyModel";
import { categoryModel } from "../models/categoryModel"
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, Number, } from "mongoose";


export interface IReturnPolicy {
    name: string;
<<<<<<< HEAD
    description?: string | undefined | null;
    conditions?: string[];
    duration: number;
=======
    description?: string |undefined|null;
    // conditions?: string[];
    duration:number;
    returnCharge?:number |undefined|null
>>>>>>> 7a4580d37cba3ea542f53f2c056ebab1f7b0b667
}


export const createReturnPolicyBySuperAdmin = async (newReturnPolicyData: IReturnPolicy): Promise<any> => {
    try {
        console.log("🔍 Saving policy to DB:", newReturnPolicyData);

        let returnPolicy = new returnPolicyModel(newReturnPolicyData);
        const savedPolicy = await returnPolicy.save();  // Ensure 'await' is used

        console.log("✅ Saved policy:", savedPolicy);
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


<<<<<<< HEAD
export const deleteReturnPolicyByAdmin = async (returnPolicyId: Types.ObjectId): Promise<any> => {
    const deletePolicy = await returnPolicyModel.findByIdAndDelete(returnPolicyId);
=======
export const deleteReturnPolicyByAdmin=async (returnPolicyId:Types.ObjectId): Promise<any> => {
    const deletePolicy=await returnPolicyModel.findByIdAndUpdate(returnPolicyId,{isDeleted:true},{new:true});
>>>>>>> 7a4580d37cba3ea542f53f2c056ebab1f7b0b667
    return deletePolicy;
}


export const updateStatusReturnPolicyByAdmin = async (returnPolicyId: Types.ObjectId, isEnable: boolean): Promise<any> => {
    const updateRole = await returnPolicyModel.findByIdAndUpdate(returnPolicyId, { isEnable: isEnable }, { new: true });
    return updateRole;
}



export const getDefaultReturnPolicyInCategory = async (id: Types.ObjectId) => {


    return new Promise(async (resolve, reject) => {

        try {

            if (!id) {

                console.log("get default policy")
                resolve(true)
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

                console.log("get default policy")
                resolve(true)

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

                    console.log("get default policy")
                    resolve(true)


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


export const getDefaultReturnPolicyInProduct = async (id: Types.ObjectId,categoryId:Types.ObjectId) => {


    return new Promise(async (resolve, reject) => {

        try {


  


        } catch (error) {



        }
    })

}
