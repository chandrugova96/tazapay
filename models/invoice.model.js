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
        required: false,
    },
    addressLine2: {
        type: String,
        required: false,
    },
    country: {
        type: String,
        required: false,
    },
    invoiceAmount: {
        type: Number,
        required: false,
    },
    invoiceCurrency: {
        type: String,
        required: false,
    },
    instrumentId: {
        type: String,
        required: false,
    },
    invoiceNumber: {
        type: String,
        required: false,
    },
    referenceNo: {
        type: String,
        required: false,
    },
    paymentStatus: {
        type: String,
        default: "In Progress"
    },
    txn_no: {
        type: String,
        required: true,
    },
}, {
    timestamps : true
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);

module.exports = Invoice;