import { userShippingAddressService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import * as validators from "./userShippingAddressValidator";
import { GraphQLError } from "graphql";
import { verifyUser, validateInput, verifyMobileUser } from "../../middlewares";
import { Types } from "mongoose";




export const userShippingAddressResolver: Resolvers = {

    Mutation: {

        createUserShippingAddress: async (parent, { input }, { req }, info) => {

            await verifyUser(req);
            await validateInput(validators.userShippingAddressCreateValidator, req);

            const userId = req.authAccount._id;

            const isExists = await userShippingAddressService.getShippingAddressWithFilters({ userId: userId }, { _id: 1 }, { lean: true });

            let userShippingAddress: userShippingAddressService.IShippingAddress = {
                userId: userId,
                firstname: input.firstname,
                mobile: input.mobile,
                email: input.email || "",
                country: "India",
                houseNumber: input.houseNumber,
                streetName: input.streetName,
                apartment: input.apartment || "",
                suite: input.suite || "",
                unit: input.unit || "",
                city: input.city,
                postCode: input.postCode,
                governorate:input.governorate,
                village:input.village,
                isDefault: input.isDefault || (isExists ? false : true) // Set isDefault from input if provided, otherwise check if address exists
            };


            const result = await userShippingAddressService.createShippingAddress(userShippingAddress);


            let response = {
                _id: result._id
            }

            return response;

        },
        createMobileUserShippingAddress: async (parent, { input }, { req }, info) => {

            await verifyMobileUser(req);
            await validateInput(validators.userShippingAddressCreateValidator, req);

            const userId = req.authAccount._id;

            const isExists = await userShippingAddressService.getShippingAddressWithFilters({ userId: userId }, { _id: 1 }, { lean: true });

            let userShippingAddress: userShippingAddressService.IShippingAddress = {
                userId: userId,
                firstname: input.firstname,
                mobile: input.mobile,
                email: input.email || "",
                country: "India",
                houseNumber: input.houseNumber,
                streetName: input.streetName,
                apartment: input.apartment || "",
                suite: input.suite || "",
                unit: input.unit || "",
                city: input.city,
                postCode: input.postCode,
                isDefault: input.isDefault || (isExists ? false : true) // Set isDefault from input if provided, otherwise check if address exists
            };


            const result = await userShippingAddressService.createShippingAddress(userShippingAddress);


            let response = {
                _id: result._id
            }

            return response;

        },
        editUserShippingAddress: async (parent, { input }, { req }, info) => {

            await verifyUser(req);
            await validateInput(validators.userShippingAddressUpdateValidator, req);

            const filters = {
                _id: new Types.ObjectId(input._id),
                userId: req.authAccount._id
            }

            const shippingAddress = await userShippingAddressService.getShippingAddressWithFilters(filters, {}, {});

            if (!shippingAddress) {
                throw new GraphQLError("Record not found", {
                    extensions: {
                        code: "BAD_REQUEST",
                        errors: [],
                    },
                });
            }

            if (input.firstname) {
                shippingAddress.firstname = input.firstname;
            }
            if (input.email) {
                shippingAddress.email = input.email;
            }
            if (input.mobile) {
                shippingAddress.mobile = input.mobile;
            }
            if (input.streetName) {
                shippingAddress.streetName = input.streetName;
            }
            if (input.city) {
                shippingAddress.city = input.city;
            }
            if (input.country) {
                shippingAddress.country = input.country;
            }
            if (input.houseNumber) {
                shippingAddress.houseNumber = input.houseNumber;
            }
            if (input.postCode) {
                shippingAddress.postCode = input.postCode;
            }
            if (input.apartment) {
                shippingAddress.apartment = input.apartment;
            }
            if (input.suite) {
                shippingAddress.suite = input.suite;
            }
            
            if(input.governorate){
                shippingAddress.governorate=input.governorate;
            }
            
            if(input.village){
                shippingAddress.village=input.village;
            }

            await shippingAddress.save();

            let response = {
                _id: shippingAddress._id
            }

            return response;

        },
        editMobileUserShippingAddress: async (parent, { input }, { req }, info) => {

            await verifyMobileUser(req);
            await validateInput(validators.userShippingAddressUpdateValidator, req);

            const filters = {
                _id: new Types.ObjectId(input._id),
                userId: req.authAccount._id
            }

            const shippingAddress = await userShippingAddressService.getShippingAddressWithFilters(filters, {}, {});

            if (!shippingAddress) {
                throw new GraphQLError("Record not found", {
                    extensions: {
                        code: "BAD_REQUEST",
                        errors: [],
                    },
                });
            }

            if (input.firstname) {
                shippingAddress.firstname = input.firstname;
            }
            if (input.email) {
                shippingAddress.email = input.email;
            }
            if (input.mobile) {
                shippingAddress.mobile = input.mobile;
            }
            if (input.streetName) {
                shippingAddress.streetName = input.streetName;
            }
            if (input.city) {
                shippingAddress.city = input.city;
            }
            if (input.country) {
                shippingAddress.country = input.country;
            }
            if (input.houseNumber) {
                shippingAddress.houseNumber = input.houseNumber;
            }
            if (input.postCode) {
                shippingAddress.postCode = input.postCode;
            }
            if (input.apartment) {
                shippingAddress.apartment = input.apartment;
            }
            if (input.suite) {
                shippingAddress.suite = input.suite;
            }

            await shippingAddress.save();

            let response = {
                _id: shippingAddress._id
            }

            return response;

        },

        removeUserShippingAddress: async (parent, { input }, { req }, info) => {

            await verifyUser(req);
            await validateInput(validators.userShippingAddressUpdateValidator, req);

            const filters = {
                _id: new Types.ObjectId(input._id),
                userId: req.authAccount._id
            }

            const shippingAddress = await userShippingAddressService.getShippingAddressWithFilters(filters, {}, {});

            if (!shippingAddress) {
                throw new GraphQLError("Record not found", {
                    extensions: {
                        code: "BAD_REQUEST",
                        errors: [],
                    },
                });
            }

            const result = await userShippingAddressService.deleteShipingAddress(filters);


            let response = {
                _id: result?._id?.toString(),
                message: "Shipping address deleted"
            }

            return response;

        },


        removeMobileUserShippingAddress: async (parent, { input }, { req }, info) => {

            await verifyMobileUser(req);
            await validateInput(validators.userShippingAddressUpdateValidator, req);

            const filters = {
                _id: new Types.ObjectId(input._id),
                userId: req.authAccount._id
            }

            const shippingAddress = await userShippingAddressService.getShippingAddressWithFilters(filters, {}, {});

            if (!shippingAddress) {
                throw new GraphQLError("Record not found", {
                    extensions: {
                        code: "BAD_REQUEST",
                        errors: [],
                    },
                });
            }

            const result = await userShippingAddressService.deleteShipingAddress(filters);


            let response = {
                _id: result?._id?.toString(),
                message: "Shipping address deleted"
            }

            return response;

        },

        updateUserShippingAddressAsDefault: async (parent, { input }, { req }, info) => {
            try {
                // Verify user authentication
                await verifyUser(req);

                await validateInput(validators.userDeafultShippingAddressUpdateValidator, req);

                const userId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);
                const addressId: Types.ObjectId = new Types.ObjectId(input.addressId);

                // Update all addresses to non-default
                await userShippingAddressService.updateManyShippingAddresses({ userId }, { isDefault: false });

                // Update the specified address to default
                const updatedAddress = await userShippingAddressService.updateShipingAddress(
                    addressId,
                    { isDefault: true },
                    { new: true }
                );

                if (!updatedAddress) {
                    throw new Error('Shipping address not found');
                }

                let response = {
                    _id: updatedAddress?._id?.toString(),
                    message: "Default shipping address updated"
                }

                return response;

            } catch (error) {
                console.error('Error updating shipping address:', error);
                throw new Error('Failed to update shipping address');
            }
        },
        updateMobileUserShippingAddressAsDefault: async (parent, { input }, { req }, info) => {
            try {
                // Verify user authentication
                await verifyMobileUser(req);

                await validateInput(validators.userDeafultShippingAddressUpdateValidator, req);

                const userId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);
                const addressId: Types.ObjectId = new Types.ObjectId(input.addressId);

                // Update all addresses to non-default
                await userShippingAddressService.updateManyShippingAddresses({ userId }, { isDefault: false });

                // Update the specified address to default
                const updatedAddress = await userShippingAddressService.updateShipingAddress(
                    addressId,
                    { isDefault: true },
                    { new: true }
                );

                if (!updatedAddress) {
                    throw new Error('Shipping address not found');
                }

                let response = {
                    _id: updatedAddress?._id?.toString(),
                    message: "Default shipping address updated"
                }

                return response;

            } catch (error) {
                console.error('Error updating shipping address:', error);
                throw new Error('Failed to update shipping address');
            }
        }

    },

    Query: {
        async getUserShippingAddress(parent, { input }, { req }, info) {
            try {
                await verifyUser(req);
                await validateInput(validators.userShippingAddressQueryValidator, req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const filters = {
                    _id: _id,
                    userId: req.authAccount._id
                }

                const record = await userShippingAddressService.getShippingAddressWithFilters(filters, {}, { lean: true });

                if (!record) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    ...record
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },
        async getMobileUserShippingAddress(parent, { input }, { req }, info) {
            try {
                await verifyMobileUser(req);
                await validateInput(validators.userShippingAddressQueryValidator, req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const filters = {
                    _id: _id,
                    userId: req.authAccount._id
                }

                const record = await userShippingAddressService.getShippingAddressWithFilters(filters, {}, { lean: true });

                if (!record) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    ...record
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },
        async getUserShippingAddresses(parent, { }, { req }, info) {
            try {
                await verifyUser(req);

                const filters = {
                    userId: req.authAccount._id
                }

                const records = await userShippingAddressService.getAllShippingAddressWithFilters(filters, {}, { lean: true });

                const response = {
                    address: records
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },
        async getMobileUserShippingAddresses(parent, { }, { req }, info) {
            try {
                await verifyMobileUser(req);

                const filters = {
                    userId: req.authAccount._id
                }

                const records = await userShippingAddressService.getAllShippingAddressWithFilters(filters, {}, { lean: true });

                const response = {
                    address: records
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },
        async getUserDefaultShippingAddress(parent, { }, { req }, info) {
            try {
                await verifyUser(req);

                const filters = {
                    userId: req.authAccount._id,
                    isDefault: true
                }

                const record = await userShippingAddressService.getShippingAddressWithFilters(filters, {}, { lean: true });

                if (!record) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    ...record
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },
        async getMobileUserDefaultShippingAddress(parent, { }, { req }, info) {
            try {
                await verifyMobileUser(req);

                const filters = {
                    userId: req.authAccount._id,
                    isDefault: true
                }

                const record = await userShippingAddressService.getShippingAddressWithFilters(filters, {}, { lean: true });

                if (!record) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    ...record
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },

    },
};

