import { warrantyPolicyModel } from "../models/warrantyPolicyModel";

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