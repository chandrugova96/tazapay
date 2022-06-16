const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
    companyEmail: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    addressLine1: {
        type: String,
        required: true,
    },
    addressLine2: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    invoiceAmount: {
        type: Number,
        required: true,
    },
    invoiceCurrency: {
        type: String,
        required: true,
    },
    instrumentId: {
        type: String,
        required: true,
    },
    invoiceNumber: {
        type: String,
        required: true,
    },
    referenceNo: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        default: "In Progress"
    },
    txn_no: {
        type: String,
        required: true,
    },
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);

module.exports = Invoice;