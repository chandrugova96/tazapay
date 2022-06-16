const PaymentRoute = require("express").Router();
const PaymentController = require("../controllers/payment.controller");

PaymentRoute.post("/", PaymentController.createPayment);
PaymentRoute.put("/", PaymentController.updatePaymentStatus);

module.exports = PaymentRoute;
