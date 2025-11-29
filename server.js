const express = require('express');
const app = express();

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// M-Pesa STK Callback Route
app.post('/mpesa/stk/callback', (req, res) => {
    console.log('================================================');
    console.log(' M-PESA CALLBACK RECEIVED');
    console.log(' Timestamp:', new Date().toISOString());
    console.log('================================================');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('================================================');
    
    const { Body } = req.body;
    
    if (Body && Body.stkCallback) {
        const { ResultCode, ResultDesc, CheckoutRequestID, MerchantRequestID } = Body.stkCallback;
        
        console.log('MerchantRequestID:', MerchantRequestID);
        console.log('CheckoutRequestID:', CheckoutRequestID);
        console.log('ResultCode:', ResultCode);
        console.log('ResultDesc:', ResultDesc);
        
        if (ResultCode === 0) {
            // Payment successful
            const metadata = Body.stkCallback.CallbackMetadata?.Item || [];
            
            const amount = metadata.find(item => item.Name === 'Amount')?.Value;
            const mpesaRef = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
            const phone = metadata.find(item => item.Name === 'PhoneNumber')?.Value;
            const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
            
            console.log('✅ PAYMENT SUCCESSFUL!');
            console.log('Amount: KES', amount);
            console.log('M-Pesa Receipt:', mpesaRef);
            console.log('Phone:', phone);
            console.log('Transaction Date:', transactionDate);
            
            // TODO: Save to database
            // saveToDatabase({ amount, mpesaRef, phone, transactionDate, CheckoutRequestID });
            
        } else {
            // Payment failed or cancelled
            console.log('❌ PAYMENT FAILED/CANCELLED');
            console.log('Reason:', ResultDesc);
            
            // Common error codes:
            // 1032: Transaction cancelled by user
            // 2001: Wrong PIN
            // 1: Insufficient balance
            // 2029: Configuration error
        }
    }
    
    // CRITICAL: Always respond with 200 immediately
    res.status(200).json({ 
        ResultCode: 0, 
        ResultDesc: "Accepted" 
    });
});

// Test endpoint - GET request
app.get('/mpesa/stk/callback', (req, res) => {
    res.json({ 
        status: 'online',
        message: 'M-Pesa STK callback endpoint is ready',
        endpoint: '/mpesa/stk/callback',
        method: 'POST',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        service: 'M-Pesa Callback Server',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'M-Pesa Callback Server Running ✅',
        endpoints: {
            callback: 'POST /mpesa/stk/callback',
            test: 'GET /mpesa/stk/callback',
            health: 'GET /health'
        },
        timestamp: new Date().toISOString()
    });
});

// Use Railway's PORT or default to 4040 for local development
const PORT = process.env.PORT || 4040;
const HOST = '0.0.0.0'; // Important for Railway

app.listen(PORT, HOST, () => {
    console.log('================================================');
    console.log('✅ M-Pesa Callback Server Started');
    console.log('================================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Listening on ${HOST}:${PORT}`);
    console.log('================================================');
    console.log('📍 Endpoints:');
    console.log(`   POST /mpesa/stk/callback - M-Pesa callback handler`);
    console.log(`   GET  /mpesa/stk/callback - Test endpoint`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  / - Server info`);
    console.log('================================================');
});