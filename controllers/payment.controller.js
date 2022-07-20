
const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars');
const pdf = require('html-pdf');

const invoiceModel = require("../models/invoice.model");
const { makeRequest, getBuyerDetails, createBuyerDetails } = require("../healper/signature_generation");
const { sendMail} = require("../healper/sendMail");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const html = fs.readFileSync(path.resolve(__dirname, '../templates/index.html'), 'utf8');
const template = handlebars.compile(html);
const templatesPath = path.resolve(__dirname, "..", "templates");
const pdfFile = path.resolve(__dirname, "..", "templates/invoice.pdf");

module.exports = {
    
    createPayment: async (req, res, next) => {
        try {
            let { companyEmail, invoiceAmount, invoiceCurrency, companyName, country } = req.body;
            let buyerId = '';
            let buyerDetails = await getBuyerDetails(companyEmail);
            if(buyerDetails && buyerDetails.statusCode === 200 ){
                buyerId = buyerDetails.body.data.id
            };
            if(buyerDetails && buyerDetails.statusCode !== 200 ){
                buyerDetails = await createBuyerDetails(companyEmail, companyName, country);
                buyerId = buyerDetails.body.data.account_id;
            };
            const body = {
                initiated_by: process.env.SELLER_ID,
                buyer_id: buyerId,
                seller_id: process.env.SELLER_ID,
                txn_description: "Description",
                is_milestone: true,
                invoice_amount: invoiceAmount,
                invoice_currency: invoiceCurrency
            };
            const result = await makeRequest("POST", "/v1/escrow", body);
            if (result && result.statusCode === 200) {
                const createPaymentPayload = {
                    txn_no: result.body.data.txn_no,
                    "complete_url": "https://www.google.co.in/?hl=ta",
                    "error_url": "https://www.google.co.in/?hl=ta"
                };
                let createPaymentResult = await makeRequest("POST", "/v1/session/payment", createPaymentPayload);
                if(createPaymentResult && createPaymentResult.statusCode === 200){
                    let obj = req.body;
                    obj.txn_no = result.body.data.txn_no;
                    const html = template({
                        name : obj.companyName,
                        amount : obj.invoiceAmount,
                        url : createPaymentResult.body.data.redirect_url
                    });
                    pdf.create(html).toFile(path.resolve(templatesPath, `invoice.pdf`), async function (err, data1) {
                        if (err) {
                            res.send({ statusCode: 201, message: 'Create pdf failed.' });
                        } else {
                            let mailPayload = {
                                subject : "Invoice", 
                                mailBody : `<p> Hi ${obj.companyName}`, 
                                toMail : obj.companyEmail, 
                                attachments : [{
                                    filename: 'invoice.pdf',
                                    path: pdfFile,
                                    contentType: 'application/pdf'
                                }]
                            }
                            await sendMail(mailPayload);
                            const invoice = new invoiceModel(obj);
                            await invoice.save();
                            res.send({ statusCode: 200, message: "Payment link generation success" });
                        }
                    });
                }else{
                    res.send({ statusCode: 201, message: "Payment link generation failed" }); 
                }
            };
        } catch (error) {
            next(error);
        }
    },

    updatePaymentStatus: async (req, res, next) => {
        const invoices = await invoiceModel.find({ "paymentStatus": "In Progress" });
        await asyncForEach(invoices, async (oneDoc, index) => {
            let result = await makeRequest("GET", `/v1/escrow/${oneDoc.txn_no}`);
            if(result && result.statusCode === 200 && result.body.data && result.body.data.state === 'Payment_Received'){
                await invoiceModel.updateOne(
                    { txn_no: oneDoc.txn_no },
                    { $set: { "paymentStatus" : 'Payment Received' } },
                );
            };
        });
        res.send({ statusCode: 200, message: "Success" }); 
    }

};