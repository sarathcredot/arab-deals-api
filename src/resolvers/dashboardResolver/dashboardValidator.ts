import { body } from 'express-validator';


export const getDashboardUsersGraphValidator = [
    body('variables.input.startDate').optional({ checkFalsy: true }).isDate(),
    body('variables.input.endDate').optional({ checkFalsy: true }).isDate(),
    body('variables.input.graphType').optional({ checkFalsy: true }).isIn(["DAY", "WEEK", "MONTH", "YEAR"]),
]

export const getDashboardVendorsGraphValidator = [
    body('variables.input.startDate').optional({ checkFalsy: true }).isDate(),
    body('variables.input.endDate').optional({ checkFalsy: true }).isDate(),
    body('variables.input.graphType').optional({ checkFalsy: true }).isIn(["DAY", "WEEK", "MONTH", "YEAR"]),
]

export const getDashboardOrdersGraphValidator = [
    body('variables.input.startDate').optional({ checkFalsy: true }).isDate(),
    body('variables.input.endDate').optional({ checkFalsy: true }).isDate(),
    body('variables.input.graphType').optional({ checkFalsy: true }).isIn(["DAY", "WEEK", "MONTH", "YEAR"]),
]

export const getDashboardOrdersPieChartDataValidator = [
    body('variables.input.startDate').optional({ checkFalsy: true }).isDate(),
    body('variables.input.endDate').optional({ checkFalsy: true }).isDate(),
]

export const getDashboardReturnedOrdersPieChartDataValidator = [
    body('variables.input.startDate').optional({ checkFalsy: true }).isDate(),
    body('variables.input.endDate').optional({ checkFalsy: true }).isDate(),
]

export const getDashboardRefundOrdersPieChartDataValidator = [
    body('variables.input.startDate').optional({ checkFalsy: true }).isDate(),
    body('variables.input.endDate').optional({ checkFalsy: true }).isDate(),
]
export const getDashboardOrdersAmountPieChartDataValidator = [
    body('variables.input.startDate').optional({ checkFalsy: true }).isDate(),
    body('variables.input.endDate').optional({ checkFalsy: true }).isDate(),
]
export const getDashboardShippingChargePieChartDataValidator = [
    body('variables.input.startDate').optional({ checkFalsy: true }).isDate(),
    body('variables.input.endDate').optional({ checkFalsy: true }).isDate(),
]