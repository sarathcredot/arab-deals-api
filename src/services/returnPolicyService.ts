import { returnPolicyModel } from "../models/returnPolicyModel";

export interface IReturnPolicy {
    name: string;
    description?: string |undefined|null;
    conditions?: string[];
    duration:number;
}


export const createReturnPolicyBySuperAdmin = async(newReturnPolicyData:IReturnPolicy):Promise<any> =>{
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