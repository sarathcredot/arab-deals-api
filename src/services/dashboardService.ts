import { userModel, orderModel, orderProductModel, vendorModel } from "../models";
import { Types, Document, QueryOptions, PipelineStage, ProjectionFields, FilterQuery, UpdateQuery, AnyObject } from "mongoose";
import { collections } from "../configs";
import moment, { unitOfTime } from "moment";


export interface IGetDashboardUsersGraphOptions {
    startDate?: Date;
    endDate?: Date;
    graphType?: string;
}


export interface IGetDashboardVendorsGraphOptions {
    startDate?: Date;
    endDate?: Date;
    graphType?: string;
}



export interface IGetDashboardUsersSummary {
    totalUsers?: number;
    activeUsers?: number;
    blockedUsers?: number;
    todayUsers?: number;
    weekUsers?: number;
    monthUsers?: number;
    yearUsers?: number;
}

export interface IGetDashboardVendorsSummary {
    totalVendors?: number;
    activeVendors?: number;
    blockedVendors?: number;
    todayVendors?: number;
    weekVendors?: number;
    monthVendors?: number;
    yearVendors?: number;
}



export interface IGetDashboardOrderSummary {
    pendingOrders?: number;
    progressOrders?: number;
    shippedOrders?: number;
    deliveredOrders?: number;
    cancelledOrders?: number;
    returnedOrders?: number;
}


export interface IGetDashboardOrdersGraphOptions {
    startDate?: Date;
    endDate?: Date;
    graphType?: string;
    vendorId?: Types.ObjectId;
}


export interface IGetDashboardOrderPiechartData {
    deliveredOrders?: number;
    returnedOrders?: number;
    cancelledOrders?: number;
}

export interface IGetDashboardOrdersPieChartDataOptions {
    startDate?: Date;
    endDate?: Date;
    vendorId?: Types.ObjectId;
}

export interface IGetDashboardReturnedOrdersPieChartDataOptions {
    startDate?: Date;
    endDate?: Date;
    vendorId?: Types.ObjectId;
}


export interface IGetDashboardReturnedOrderPiechartData {
    pending?: number;
    approved?: number;
    rejected?: number;
}


export interface IGetDashboardReturnedOrderSummary {
    pending?: number;
    approvedToday?: number;
    rejectedToday?: number;
}


export interface IGetDashboardRefundOrderSummary {
    pendingAmount?: number;
    paidToday?: number;
}


export interface IGetDashboardRefundOrdersPieChartDataOptions {
    startDate?: Date;
    endDate?: Date;
    vendorId?: Types.ObjectId;
}


export interface IGetDashboardRefundOrderPiechartData {
    pending?: number;
    paid?: number;
}

export interface IGetDashboardOrdersAmountPieChartDataOptions {
    startDate?: Date;
    endDate?: Date;
    vendorId?: Types.ObjectId;
}

export interface IGetDashboardShippingChargePieChartDataOptions {
    startDate?: Date;
    endDate?: Date;
    vendorId?: Types.ObjectId;
}

export interface IGetDashboardOrderAmountPiechartData {
    pending?: number;
    paid?: number;
}

export interface IGetDashboardShippingChargePiechartData {
    pending?: number;
    paid?: number;
}


export const getDashboardUsersSummary = async (): Promise<IGetDashboardUsersSummary[]> => {
    const today = new Date(moment().format("YYYY-MM-DD"));
    const week = new Date(moment().startOf("week").format("YYYY-MM-DD"));
    const month = new Date(moment().startOf("month").format("YYYY-MM-DD"));
    const year = new Date(moment().startOf("year").format("YYYY-MM-DD"));


    let pipeline: PipelineStage[] = [];
    pipeline.push(
        {
            $project: {
                _id: 1,
                isBlocked: 1,
                createdAt: 1
            }
        },
        {
            $facet: {
                totalUsers: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                activeUsers: [
                    {
                        $match: {
                            isBlocked: false
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                blockedUsers: [
                    {
                        $match: {
                            isBlocked: true
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                todayUsers: [
                    {
                        $match: {
                            createdAt: { $gte: today }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                weekUsers: [
                    {
                        $match: {
                            createdAt: { $gte: week }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                monthUsers: [
                    {
                        $match: {
                            createdAt: { $gte: month }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                yearUsers: [
                    {
                        $match: {
                            createdAt: { $gte: year }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ]
            }
        },
        {
            $project: {
                totalUsers: { $ifNull: [{ $arrayElemAt: ["$totalUsers.total", 0] }, 0] },
                activeUsers: { $ifNull: [{ $arrayElemAt: ["$activeUsers.total", 0] }, 0] },
                blockedUsers: { $ifNull: [{ $arrayElemAt: ["$blockedUsers.total", 0] }, 0] },
                todayUsers: { $ifNull: [{ $arrayElemAt: ["$todayUsers.total", 0] }, 0] },
                weekUsers: { $ifNull: [{ $arrayElemAt: ["$weekUsers.total", 0] }, 0] },
                monthUsers: { $ifNull: [{ $arrayElemAt: ["$monthUsers.total", 0] }, 0] },
                yearUsers: { $ifNull: [{ $arrayElemAt: ["$yearUsers.total", 0] }, 0] },
            }
        }
    )
    return await userModel.aggregate(pipeline);
}



export const getDashboardUsersGraph = async (options: IGetDashboardUsersGraphOptions): Promise<{ [key: string]: number }[]> => {
    let pipeline: PipelineStage[] = [], facet: any = {}, project: any = {}, format = "DD MMM";

    let unit: unitOfTime.StartOf = "day";

    switch (options.graphType) {
        case "DAY":
            format = "DD MMM";
            unit = "day";
            break;
        case "WEEK":
            format = "DD MMM";
            unit = "week";
            break;
        case "MONTH":
            format = "MMM YYYY";
            unit = "month";
            break;
        case "YEAR":
            format = "YYYY";
            unit = "year";
            break;
        default:
            format = "DD MMM";
            unit = "day";
            break;
    }

    const sDate = options.startDate ? moment(options.startDate).startOf("day") : moment().startOf(unit);
    const eDate = options.endDate ? moment(options.endDate).endOf("day") : moment().add(1, unit).endOf(unit);
    const startDate = options.startDate ? moment(options.startDate).startOf(unit) : moment().startOf(unit);
    const endDate = options.endDate ? moment(options.endDate).endOf(unit) : moment().add(1, unit).endOf(unit);
    const loopCounter = endDate.diff(startDate, unit);

    for (let i = 0; i <= loopCounter; i++) {
        let label = moment(startDate).endOf(unit).format(format);
        let dayStart = new Date(startDate.toISOString());
        let dayEnd = new Date(startDate.add(1, unit).toISOString());
        let match = {
            createdAt: {
                $gte: dayStart,
                $lt: dayEnd,
            },
        };
        facet[label] = [
            {
                $match: match,
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 }
                },
            },
        ];
        project[label] = {
            $ifNull: [{ $arrayElemAt: ["$" + label + ".total", 0] }, 0]
        };
    }
    pipeline.push(
        {
            $match: {
                $and: [
                    {
                        createdAt: {
                            $gte: new Date(sDate.toISOString())
                        },
                    },
                    {
                        createdAt: {
                            $lte: new Date(eDate.toISOString())
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 1,
                createdAt: 1,
            }
        },
        {
            $sort: {
                createdAt: 1
            }
        },
        {
            $facet: facet

        },
        {
            $project: project
        }
    );
    return await userModel.aggregate(pipeline);
}



export const getDashboardVendorsSummary = async (): Promise<IGetDashboardVendorsSummary[]> => {
    const today = new Date(moment().format("YYYY-MM-DD"));
    const week = new Date(moment().startOf("week").format("YYYY-MM-DD"));
    const month = new Date(moment().startOf("month").format("YYYY-MM-DD"));
    const year = new Date(moment().startOf("year").format("YYYY-MM-DD"));


    let pipeline: PipelineStage[] = [];
    pipeline.push(
        {
            $project: {
                _id: 1,
                isBlocked: 1,
                createdAt: 1
            }
        },
        {
            $facet: {
                totalVendors: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                activeVendors: [
                    {
                        $match: {
                            isBlocked: false
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                blockedVendors: [
                    {
                        $match: {
                            isBlocked: true
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                todayVendors: [
                    {
                        $match: {
                            createdAt: { $gte: today }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                weekVendors: [
                    {
                        $match: {
                            createdAt: { $gte: week }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                monthVendors: [
                    {
                        $match: {
                            createdAt: { $gte: month }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                yearVendors: [
                    {
                        $match: {
                            createdAt: { $gte: year }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ]
            }
        },
        {
            $project: {
                totalVendors: { $ifNull: [{ $arrayElemAt: ["$totalVendors.total", 0] }, 0] },
                activeVendors: { $ifNull: [{ $arrayElemAt: ["$activeVendors.total", 0] }, 0] },
                blockedVendors: { $ifNull: [{ $arrayElemAt: ["$blockedVendors.total", 0] }, 0] },
                todayVendors: { $ifNull: [{ $arrayElemAt: ["$todayVendors.total", 0] }, 0] },
                weekVendors: { $ifNull: [{ $arrayElemAt: ["$weekVendors.total", 0] }, 0] },
                monthVendors: { $ifNull: [{ $arrayElemAt: ["$monthVendors.total", 0] }, 0] },
                yearVendors: { $ifNull: [{ $arrayElemAt: ["$yearVendors.total", 0] }, 0] },
            }
        }
    )
    return await vendorModel.aggregate(pipeline);
}

export const getDashboardVendorsGraph = async (options: IGetDashboardUsersGraphOptions): Promise<{ [key: string]: number }[]> => {
    let pipeline: PipelineStage[] = [], facet: any = {}, project: any = {}, format = "DD MMM";

    let unit: unitOfTime.StartOf = "day";

    switch (options.graphType) {
        case "DAY":
            format = "DD MMM";
            unit = "day";
            break;
        case "WEEK":
            format = "DD MMM";
            unit = "week";
            break;
        case "MONTH":
            format = "MMM YYYY";
            unit = "month";
            break;
        case "YEAR":
            format = "YYYY";
            unit = "year";
            break;
        default:
            format = "DD MMM";
            unit = "day";
            break;
    }

    const sDate = options.startDate ? moment(options.startDate).startOf("day") : moment().startOf(unit);
    const eDate = options.endDate ? moment(options.endDate).endOf("day") : moment().add(1, unit).endOf(unit);
    const startDate = options.startDate ? moment(options.startDate).startOf(unit) : moment().startOf(unit);
    const endDate = options.endDate ? moment(options.endDate).endOf(unit) : moment().add(1, unit).endOf(unit);
    const loopCounter = endDate.diff(startDate, unit);

    for (let i = 0; i <= loopCounter; i++) {
        let label = moment(startDate).endOf(unit).format(format);
        let dayStart = new Date(startDate.toISOString());
        let dayEnd = new Date(startDate.add(1, unit).toISOString());
        let match = {
            createdAt: {
                $gte: dayStart,
                $lt: dayEnd,
            },
        };
        facet[label] = [
            {
                $match: match,
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 }
                },
            },
        ];
        project[label] = {
            $ifNull: [{ $arrayElemAt: ["$" + label + ".total", 0] }, 0]
        };
    }
    pipeline.push(
        {
            $match: {
                $and: [
                    {
                        createdAt: {
                            $gte: new Date(sDate.toISOString())
                        },
                    },
                    {
                        createdAt: {
                            $lte: new Date(eDate.toISOString())
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 1,
                createdAt: 1,
            }
        },
        {
            $sort: {
                createdAt: 1
            }
        },
        {
            $facet: facet

        },
        {
            $project: project
        }
    );
    return await vendorModel.aggregate(pipeline);
}



export const getDashboardOrderSummary = async (vendorId?: Types.ObjectId): Promise<IGetDashboardOrderSummary[]> => {

    const today = new Date(moment().startOf("day").toISOString());

    let pipeline: PipelineStage[] = [];


    if (vendorId) {
        pipeline.push(
            {
                $match: {
                    vendorId: vendorId
                }
            }
        )
    }

    pipeline.push(
        {
            $project: {
                _id: 1,
                orderDate: 1,
                shippingStatus: 1,
                returnStatus: 1,
                cancelledDate: 1,
                deliveryDate: 1,
                returnDate: 1
            }
        },
        {
            $facet: {
                pendingOrders: [
                    {
                        $match: {
                            shippingStatus: "PENDING"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                progressOrders: [
                    {
                        $match: {
                            shippingStatus: "PACKAGE_IN_PROGRESS"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                shippedOrders: [
                    {
                        $match: {
                            shippingStatus: "SHIPPED"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                deliveredOrders: [
                    {
                        $match: {
                            shippingStatus: "DELIVERED",
                            deliveryDate: { $gte: today }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                cancelledOrders: [
                    {
                        $match: {
                            shippingStatus: "CANCELED",
                            cancelledDate: { $gte: today }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                returnedOrders: [
                    {
                        $match: {
                            returnStatus: "APPROVED",
                            returnDate: { $gte: today }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
            }
        },
        {
            $project: {
                pendingOrders: { $ifNull: [{ $arrayElemAt: ["$pendingOrders.total", 0] }, 0] },
                progressOrders: { $ifNull: [{ $arrayElemAt: ["$progressOrders.total", 0] }, 0] },
                shippedOrders: { $ifNull: [{ $arrayElemAt: ["$shippedOrders.total", 0] }, 0] },
                deliveredOrders: { $ifNull: [{ $arrayElemAt: ["$deliveredOrders.total", 0] }, 0] },
                cancelledOrders: { $ifNull: [{ $arrayElemAt: ["$cancelledOrders.total", 0] }, 0] },
                returnedOrders: { $ifNull: [{ $arrayElemAt: ["$returnedOrders.total", 0] }, 0] },
            }
        }
    )
    return await orderProductModel.aggregate(pipeline);
}


export const getDashboardOrdersGraph = async (options: IGetDashboardOrdersGraphOptions): Promise<{ [key: string]: number }[]> => {
    let pipeline: PipelineStage[] = [], facet: any = {}, project: any = {}, format = "DD MMM";


    if (options.vendorId) {
        pipeline.push(
            {
                $match: {
                    vendorId: options.vendorId
                }
            }
        )
    }

    let unit: unitOfTime.StartOf = "day";

    switch (options.graphType) {
        case "DAY":
            format = "DD MMM";
            unit = "day";
            break;
        case "WEEK":
            format = "DD MMM";
            unit = "week";
            break;
        case "MONTH":
            format = "MMM YYYY";
            unit = "month";
            break;
        case "YEAR":
            format = "YYYY";
            unit = "year";
            break;
        default:
            format = "DD MMM";
            unit = "day";
            break;
    }

    const sDate = options.startDate ? moment(options.startDate).startOf("day") : moment().startOf(unit);
    const eDate = options.endDate ? moment(options.endDate).endOf("day") : moment().add(1, unit).endOf(unit);
    const startDate = options.startDate ? moment(options.startDate).startOf(unit) : moment().startOf(unit);
    const endDate = options.endDate ? moment(options.endDate).endOf(unit) : moment().add(1, unit).endOf(unit);
    const loopCounter = endDate.diff(startDate, unit);

    for (let i = 0; i <= loopCounter; i++) {
        let label = moment(startDate).endOf(unit).format(format);
        let dayStart = new Date(startDate.toISOString());
        let dayEnd = new Date(startDate.add(1, unit).toISOString());
        let match = {
            orderDate: {
                $gte: dayStart,
                $lt: dayEnd,
            },
        };
        facet[label] = [
            {
                $match: match,
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 }
                },
            },
        ];
        project[label] = {
            $ifNull: [{ $arrayElemAt: ["$" + label + ".total", 0] }, 0]
        };
    }
    pipeline.push(
        {
            $match: {
                $and: [
                    {
                        orderDate: {
                            $gte: new Date(sDate.toISOString())
                        },
                    },
                    {
                        orderDate: {
                            $lte: new Date(eDate.toISOString())
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 1,
                orderDate: 1,
            }
        },
        {
            $sort: {
                orderDate: 1
            }
        },
        {
            $facet: facet
        },
        {
            $project: project
        }
    );
    return await orderProductModel.aggregate(pipeline);
}


export const getDashboardOrderPieChartData = async (options: IGetDashboardOrdersPieChartDataOptions = {}): Promise<IGetDashboardOrderPiechartData[]> => {

    const sDate = options.startDate ? moment(options.startDate).startOf("day") : "";
    const eDate = options.endDate ? moment(options.endDate).endOf("day") : "";


    let deliveredOrders = [], cancelledOrders = [], returnedOrders = [];


    if (sDate) {
        deliveredOrders.push(
            {
                $match: {
                    deliveryDate: { $gte: new Date(sDate.toISOString()) }
                }
            }
        )
        returnedOrders.push(
            {
                $match: {
                    returnDate: { $gte: new Date(sDate.toISOString()) }
                }
            }
        )
        cancelledOrders.push(
            {
                $match: {
                    cancelledDate: { $gte: new Date(sDate.toISOString()) }
                }
            }
        )
    }
    if (eDate) {
        deliveredOrders.push(
            {
                $match: {
                    deliveryDate: { $lte: new Date(eDate.toISOString()) }
                }
            }
        )
        returnedOrders.push(
            {
                $match: {
                    returnDate: { $lte: new Date(eDate.toISOString()) }
                }
            }
        )
        cancelledOrders.push(
            {
                $match: {
                    cancelledDate: { $lte: new Date(eDate.toISOString()) }
                }
            }
        )
    }

    let facet = {
        deliveredOrders: [
            ...deliveredOrders,
            {
                $match: {
                    shippingStatus: "DELIVERED"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                }
            },
        ],
        cancelledOrders: [
            ...cancelledOrders,
            {
                $match: {
                    shippingStatus: "CANCELED"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                }
            },
        ],
        returnedOrders: [
            ...returnedOrders,
            {
                $match: {
                    returnStatus: "APPROVED"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                }
            },
        ],
    }

    let pipeline: PipelineStage[] = [];

    if (options.vendorId) {
        pipeline.push(
            {
                $match: {
                    vendorId: options.vendorId
                }
            }
        )
    }

    pipeline.push(
        {
            $project: {
                shippingStatus: 1,
                returnStatus: 1,
                cancelledDate: 1,
                returnDate: 1,
                deliveryDate: 1
            }
        },
        {
            $facet: facet
        },
        {
            $project: {
                deliveredOrders: { $ifNull: [{ $arrayElemAt: ["$deliveredOrders.total", 0] }, 0] },
                cancelledOrders: { $ifNull: [{ $arrayElemAt: ["$cancelledOrders.total", 0] }, 0] },
                returnedOrders: { $ifNull: [{ $arrayElemAt: ["$returnedOrders.total", 0] }, 0] },
            }
        }
    )
    return await orderProductModel.aggregate(pipeline);
}



export const getDashboardReturnedOrdersPieChartData = async (options: IGetDashboardReturnedOrdersPieChartDataOptions = {}): Promise<IGetDashboardReturnedOrderPiechartData[]> => {

    const sDate = options.startDate ? moment(options.startDate).startOf("day") : "";
    const eDate = options.endDate ? moment(options.endDate).endOf("day") : "";


    let pending = [], approved = [], rejected = [];


    if (sDate) {
        pending.push(
            {
                $match: {
                    returnRequestDate: { $gte: new Date(sDate.toISOString()) }
                }
            }
        )
        approved.push(
            {
                $match: {
                    returnDate: { $gte: new Date(sDate.toISOString()) }
                }
            }
        )
        rejected.push(
            {
                $match: {
                    returnRejectedDate: { $gte: new Date(sDate.toISOString()) }
                }
            }
        )
    }
    if (eDate) {
        pending.push(
            {
                $match: {
                    returnRequestDate: { $lte: new Date(eDate.toISOString()) }
                }
            }
        )
        approved.push(
            {
                $match: {
                    returnDate: { $lte: new Date(eDate.toISOString()) }
                }
            }
        )
        rejected.push(
            {
                $match: {
                    returnRejectedDate: { $lte: new Date(eDate.toISOString()) }
                }
            }
        )
    }

    let facet = {
        pending: [
            ...pending,
            {
                $match: {
                    returnStatus: "PENDING"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                }
            },
        ],
        rejected: [
            ...rejected,
            {
                $match: {
                    returnStatus: "REJECTED"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                }
            },
        ],
        approved: [
            ...approved,
            {
                $match: {
                    returnStatus: "APPROVED"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                }
            },
        ],
    }

    let pipeline: PipelineStage[] = [];

    if (options.vendorId) {
        pipeline.push(
            {
                $match: {
                    vendorId: options.vendorId
                }
            }
        )
    }

    pipeline.push(
        {
            $project: {
                returnRequestDate: 1,
                returnStatus: 1,
                returnDate: 1,
                returnRejectedDate: 1,
            }
        },
        {
            $facet: facet
        },
        {
            $project: {
                pending: { $ifNull: [{ $arrayElemAt: ["$pending.total", 0] }, 0] },
                approved: { $ifNull: [{ $arrayElemAt: ["$approved.total", 0] }, 0] },
                rejected: { $ifNull: [{ $arrayElemAt: ["$rejected.total", 0] }, 0] },
            }
        }
    )
    return await orderProductModel.aggregate(pipeline);
}



export const getDashboardReturnedOrderSummary = async (vendorId?: Types.ObjectId): Promise<IGetDashboardReturnedOrderSummary[]> => {

    const today = new Date(moment().startOf("day").toISOString());

    let pipeline: PipelineStage[] = [];

    if (vendorId) {
        pipeline.push(
            {
                $match: {
                    vendorId: vendorId
                }
            }
        )
    }

    pipeline.push(
        {
            $project: {
                _id: 1,
                returnStatus: 1,
                returnRejectedDate: 1,
                returnDate: 1
            }
        },
        {
            $facet: {
                pending: [
                    {
                        $match: {
                            returnStatus: "PENDING",
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                approvedToday: [
                    {
                        $match: {
                            returnStatus: "APPROVED",
                            returnDate: { $gte: today }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
                rejectedToday: [
                    {
                        $match: {
                            returnStatus: "REJECTED",
                            returnRejectedDate: { $gte: today }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                        }
                    },
                ],
            }
        },
        {
            $project: {
                pending: { $ifNull: [{ $arrayElemAt: ["$pending.total", 0] }, 0] },
                approvedToday: { $ifNull: [{ $arrayElemAt: ["$approvedToday.total", 0] }, 0] },
                rejectedToday: { $ifNull: [{ $arrayElemAt: ["$rejectedToday.total", 0] }, 0] },
            }
        }
    )
    return await orderProductModel.aggregate(pipeline);
}



export const getDashboardRefundOrderSummary = async (vendorId?: Types.ObjectId): Promise<IGetDashboardRefundOrderSummary[]> => {

    const today = new Date(moment().startOf("day").toISOString());

    let pipeline: PipelineStage[] = [];

    if (vendorId) {
        pipeline.push(
            {
                $match: {
                    vendorId: vendorId
                }
            }
        )
    }

    pipeline.push(
        {
            $project: {
                _id: 1,
                refundStatus: 1,
                refundAmount: 1,
                refundRequestDate: 1,
                refundDate: 1,
                sellingPrice: 1
            }
        },
        {
            $facet: {
                pendingAmount: [
                    {
                        $match: {
                            refundStatus: "PENDING"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$sellingPrice" },
                        }
                    },
                ],
                paidToday: [
                    {
                        $match: {
                            refundStatus: "PAID",
                            refundDate: { $gte: today }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$refundAmount" },
                        }
                    },
                ],
            }
        },
        {
            $project: {
                pendingAmount: { $ifNull: [{ $arrayElemAt: ["$pendingAmount.total", 0] }, 0] },
                paidToday: { $ifNull: [{ $arrayElemAt: ["$paidToday.total", 0] }, 0] },
            }
        }
    )
    return await orderProductModel.aggregate(pipeline);
}



export const getDashboardRefundOrdersPieChartData = async (options: IGetDashboardRefundOrdersPieChartDataOptions = {}): Promise<IGetDashboardRefundOrderPiechartData[]> => {

    const sDate = options.startDate ? moment(options.startDate).startOf("day") : "";
    const eDate = options.endDate ? moment(options.endDate).endOf("day") : "";


    let pending = [], paid = [];


    if (sDate) {
        pending.push(
            {
                $match: {
                    refundRequestDate: { $gte: new Date(sDate.toISOString()) }
                }
            }
        )
        paid.push(
            {
                $match: {
                    refundDate: { $gte: new Date(sDate.toISOString()) }
                }
            }
        )
    }
    if (eDate) {
        pending.push(
            {
                $match: {
                    refundRequestDate: { $lte: new Date(eDate.toISOString()) }
                }
            }
        )
        paid.push(
            {
                $match: {
                    refundDate: { $lte: new Date(eDate.toISOString()) }
                }
            }
        )
    }

    let facet = {
        pending: [
            ...pending,
            {
                $match: {
                    refundStatus: "PENDING"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$sellingPrice" },
                }
            },
        ],
        paid: [
            ...paid,
            {
                $match: {
                    refundStatus: "PAID"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$refundAmount" },
                }
            },
        ],
    }

    let pipeline: PipelineStage[] = [];

    if (options.vendorId) {
        pipeline.push(
            {
                $match: {
                    vendorId: options.vendorId
                }
            }
        )
    }


    pipeline.push(
        {
            $project: {
                refundRequestDate: 1,
                refundStatus: 1,
                refundDate: 1,
                refundAmount: 1,
                sellingPrice: 1
            }
        },
        {
            $facet: facet
        },
        {
            $project: {
                pending: { $ifNull: [{ $arrayElemAt: ["$pending.total", 0] }, 0] },
                paid: { $ifNull: [{ $arrayElemAt: ["$paid.total", 0] }, 0] },
            }
        }
    )
    return await orderProductModel.aggregate(pipeline);
}


export const getDashboardOrderAmountPieChartData = async (options: IGetDashboardOrdersAmountPieChartDataOptions = {}): Promise<IGetDashboardOrderAmountPiechartData[]> => {

    const sDate = options.startDate ? moment(options.startDate).startOf("day") : "";
    const eDate = options.endDate ? moment(options.endDate).endOf("day") : "";


    let pending = [], paid = [];


    if (sDate) {
        pending.push(
            {
                $match: {
                    orderDate: { $gte: new Date(sDate.toISOString()) }
                }
            }
        )
        paid.push(
            {
                $match: {
                    deliveryDate: { $gte: new Date(sDate.toISOString()) }
                }
            }
        )
    }
    if (eDate) {
        pending.push(
            {
                $match: {
                    orderDate: { $lte: new Date(eDate.toISOString()) }
                }
            }
        )
        paid.push(
            {
                $match: {
                    deliveryDate: { $lte: new Date(eDate.toISOString()) }
                }
            }
        )
    }

    let facet = {
        pending: [
            ...pending,
            {
                $match: {
                    shippingStatus: { $in: ["PENDING", "PACKAGE_IN_PROGRESS", "SHIPPED"] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$sellingPrice" },
                }
            },
        ],
        paid: [
            ...paid,
            {
                $match: {
                    paymentStatus: "COMPLETED"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$sellingPrice" },
                }
            },
        ],
    }

    let pipeline: PipelineStage[] = [];

    if (options.vendorId) {
        pipeline.push(
            {
                $match: {
                    vendorId: options.vendorId
                }
            }
        )
    }

    pipeline.push(
        {
            $facet: facet
        },
        {
            $project: {
                pending: { $ifNull: [{ $arrayElemAt: ["$pending.total", 0] }, 0] },
                paid: { $ifNull: [{ $arrayElemAt: ["$paid.total", 0] }, 0] },
            }
        }
    )
    return await orderProductModel.aggregate(pipeline);
}



export const getDashboardShippingChargePieChartData = async (options: IGetDashboardShippingChargePieChartDataOptions = {}): Promise<IGetDashboardShippingChargePiechartData[]> => {

    const sDate = options.startDate ? moment(options.startDate).startOf("day") : "";
    const eDate = options.endDate ? moment(options.endDate).endOf("day") : "";


    let pending = [], paid = [];


    if (sDate) {
        pending.push(
            {
                $match: {
                    orderDate: { $gte: new Date(sDate.toISOString()) }
                }
            }
        )
        paid.push(
            {
                $match: {
                    deliveryDate: { $gte: new Date(sDate.toISOString()) }
                }
            }
        )
    }
    if (eDate) {
        pending.push(
            {
                $match: {
                    orderDate: { $lte: new Date(eDate.toISOString()) }
                }
            }
        )
        paid.push(
            {
                $match: {
                    deliveryDate: { $lte: new Date(eDate.toISOString()) }
                }
            }
        )
    }

    let facet = {
        pending: [
            ...pending,
            {
                $match: {
                    shippingStatus: { $in: ["PENDING", "PACKAGE_IN_PROGRESS", "SHIPPED"] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$shippingCharge" },
                }
            },
        ],
        paid: [
            ...paid,
            {
                $match: {
                    paymentStatus: "COMPLETED"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$shippingCharge" },
                }
            },
        ],
    }

    let pipeline: PipelineStage[] = [];


    if (options.vendorId) {
        pipeline.push(
            {
                $match: {
                    vendorId: options.vendorId
                }
            }
        )
    }
    pipeline.push(
        {
            $facet: facet
        },
        {
            $project: {
                pending: { $ifNull: [{ $arrayElemAt: ["$pending.total", 0] }, 0] },
                paid: { $ifNull: [{ $arrayElemAt: ["$paid.total", 0] }, 0] },
            }
        }
    )
    return await orderProductModel.aggregate(pipeline);
}