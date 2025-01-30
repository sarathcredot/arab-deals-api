import { roleModel } from "../models/roleModel";

export interface IRole {
    name: string;
    description?: string |undefined|null;
    permissions?: string[];
}



export const createRoleBySuperAdmin = async (newRoleData: IRole): Promise<any> => {
    let Role=new roleModel(newRoleData);
    return await Role.save();
};