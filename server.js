const express = require('express');
const app = express();

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware (optional, but helps with some API calls)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// ========================================
// M-PESA CALLBACK ROUTES
// ========================================

// Primary callback route: /mpesa/stk/callback
app.post('/mpesa/stk/callback', (req, res) => {
    console.log('================================================');
    console.log(' M-PESA CALLBACK RECEIVED');
    console.log(' Route: /mpesa/stk/callback');
    console.log(' Timestamp:', new Date().toISOString());
    console.log('================================================');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('================================================');
    
    processCallback(req.body);
    
    // CRITICAL: Always respond with 200 immediately
    res.status(200).json({ 
        ResultCode: 0, 
        ResultDesc: "Accepted" 
    });
});

// Alternative callback route: /callback
app.post('/callback', (req, res) => {
    console.log('================================================');
    console.log(' M-PESA CALLBACK RECEIVED');
    console.log(' Route: /callback');
    console.log(' Timestamp:', new Date().toISOString());
    console.log('================================================');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('================================================');
    
    processCallback(req.body);
    
    res.status(200).json({ 
        ResultCode: 0, 
        ResultDesc: "Accepted" 
    });
});

// Alternative callback route: /cb (short)
app.post('/cb', (req, res) => {
    console.log('================================================');
    console.log(' M-PESA CALLBACK RECEIVED');
    console.log(' Route: /cb');
    console.log(' Timestamp:', new Date().toISOString());
    console.log('================================================');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('================================================');
    
    processCallback(req.body);
    
    res.status(200).json({ 
        ResultCode: 0, 
        ResultDesc: "Accepted" 
    });
});

// Alternative callback route: /mpesa
app.post('/mpesa', (req, res) => {
    console.log('================================================');
    console.log(' M-PESA CALLBACK RECEIVED');
    console.log(' Route: /mpesa');
    console.log(' Timestamp:', new Date().toISOString());
    console.log('================================================');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('================================================');
    
    processCallback(req.body);
    
    res.status(200).json({ 
        ResultCode: 0, 
        ResultDesc: "Accepted" 
    });
});

// Alternative callback route: /hook
app.post('/hook', (req, res) => {
    console.log('================================================');
    console.log(' M-PESA CALLBACK RECEIVED');
    console.log(' Route: /hook');
    console.log(' Timestamp:', new Date().toISOString());
    console.log('================================================');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('================================================');
    
    processCallback(req.body);
    
    res.status(200).json({ 
        ResultCode: 0, 
        ResultDesc: "Accepted" 
    });
});

// ========================================
// CALLBACK PROCESSING FUNCTION
// ========================================

function processCallback(body) {
    const { Body } = body;
    
    if (!Body || !Body.stkCallback) {
        console.log('⚠️  Invalid callback format - missing Body.stkCallback');
        return;
    }
    
    const { 
        ResultCode, 
        ResultDesc, 
        CheckoutRequestID, 
        MerchantRequestID 
    } = Body.stkCallback;
    
    console.log('📋 Transaction Details:');
    console.log('   MerchantRequestID:', MerchantRequestID);
    console.log('   CheckoutRequestID:', CheckoutRequestID);
    console.log('   ResultCode:', ResultCode);
    console.log('   ResultDesc:', ResultDesc);
    
    if (ResultCode === 0) {
        // ✅ PAYMENT SUCCESSFUL
        const metadata = Body.stkCallback.CallbackMetadata?.Item || [];
        
        const amount = metadata.find(item => item.Name === 'Amount')?.Value;
        const mpesaRef = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        const phone = metadata.find(item => item.Name === 'PhoneNumber')?.Value;
        const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
        
        console.log('================================================');
        console.log('✅ PAYMENT SUCCESSFUL!');
        console.log('================================================');
        console.log('💰 Amount: KES', amount);
        console.log('📝 M-Pesa Receipt:', mpesaRef);
        console.log('📱 Phone:', phone);
        console.log('📅 Transaction Date:', transactionDate);
        console.log('================================================');
        
        // TODO: Save to database
        // Example:
        // saveToDatabase({
        //     amount,
        //     mpesaReceiptNumber: mpesaRef,
        //     phoneNumber: phone,
        //     transactionDate,
        //     checkoutRequestID: CheckoutRequestID,
        //     merchantRequestID: MerchantRequestID,
        //     status: 'success'
        // });
        
    } else {
        // ❌ PAYMENT FAILED OR CANCELLED
        console.log('================================================');
        console.log('❌ PAYMENT FAILED/CANCELLED');
        console.log('================================================');
        console.log('Error Code:', ResultCode);
        console.log('Reason:', ResultDesc);
        console.log('================================================');
        
        // Common error codes:
        const errorCodes = {
            1: 'Insufficient Balance',
            1032: 'Transaction Cancelled by User',
            2001: 'Wrong PIN entered',
            2006: 'Other user input error',
            2029: 'Configuration error (passkey issue)',
            1037: 'Timeout - User took too long',
            1: 'Balance insufficient'
        };
        
        if (errorCodes[ResultCode]) {
            console.log('💡 Known Error:', errorCodes[ResultCode]);
        }
        
        // TODO: Update transaction status in database
        // updateTransactionStatus(CheckoutRequestID, 'failed', ResultDesc);
    }
}

// ========================================
// TEST ENDPOINTS (GET requests)
// ========================================

// Test endpoint for /mpesa/stk/callback
app.get('/mpesa/stk/callback', (req, res) => {
    res.json({ 
        status: 'online',
        message: 'M-Pesa STK callback endpoint is ready',
        endpoint: '/mpesa/stk/callback',
        method: 'POST',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint for /callback
app.get('/callback', (req, res) => {
    res.json({ 
        status: 'online',
        message: 'M-Pesa callback endpoint is ready',
        endpoint: '/callback',
        method: 'POST',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint for /cb
app.get('/cb', (req, res) => {
    res.json({ 
        status: 'online',
        message: 'M-Pesa callback endpoint is ready',
        endpoint: '/cb',
        method: 'POST',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint for /mpesa
app.get('/mpesa', (req, res) => {
    res.json({ 
        status: 'online',
        message: 'M-Pesa callback endpoint is ready',
        endpoint: '/mpesa',
        method: 'POST',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint for /hook
app.get('/hook', (req, res) => {
    res.json({ 
        status: 'online',
        message: 'M-Pesa callback endpoint is ready',
        endpoint: '/hook',
        method: 'POST',
        timestamp: new Date().toISOString()
    });
});

// ========================================
// GENERAL ENDPOINTS
// ========================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        service: 'M-Pesa Callback Server',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root route - Shows all available endpoints
app.get('/', (req, res) => {
    res.json({
        message: 'M-Pesa Callback Server Running ✅',
        version: '1.0.0',
        endpoints: {
            callbacks: {
                primary: 'POST /mpesa/stk/callback',
                alternative1: 'POST /callback',
                alternative2: 'POST /cb',
                alternative3: 'POST /mpesa',
                alternative4: 'POST /hook'
            },
            testing: {
                health: 'GET /health',
                test_primary: 'GET /mpesa/stk/callback',
                test_alt1: 'GET /callback',
                test_alt2: 'GET /cb',
                test_alt3: 'GET /mpesa',
                test_alt4: 'GET /hook'
            }
        },
        urls: {
            primary: `${req.protocol}://${req.get('host')}/mpesa/stk/callback`,
            alternative1: `${req.protocol}://${req.get('host')}/callback`,
            alternative2: `${req.protocol}://${req.get('host')}/cb`,
            alternative3: `${req.protocol}://${req.get('host')}/mpesa`,
            alternative4: `${req.protocol}://${req.get('host')}/hook`
        },
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
        message: 'Please check the available endpoints at GET /',
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error occurred:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// ========================================
// START SERVER
// ========================================

// Use Railway's PORT or default to 4040 for local development
const PORT = process.env.PORT || 4040;
const HOST = '0.0.0.0'; // Important for Railway

app.listen(PORT, HOST, () => {
    console.log('================================================');
    console.log('✅ M-PESA CALLBACK SERVER STARTED');
    console.log('================================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Listening on ${HOST}:${PORT}`);
    console.log('================================================');
    console.log('📍 Available Callback Endpoints:');
    console.log('   1. POST /mpesa/stk/callback (Primary)');
    console.log('   2. POST /callback (Alternative)');
    console.log('   3. POST /cb (Short)');
    console.log('   4. POST /mpesa (Alternative)');
    console.log('   5. POST /hook (Alternative)');
    console.log('================================================');
    console.log('🧪 Test Endpoints:');
    console.log('   GET /health - Health check');
    console.log('   GET / - Server info & all URLs');
    console.log('   GET /mpesa/stk/callback - Test primary endpoint');
    console.log('   GET /callback - Test alternative endpoint');
    console.log('================================================');
    console.log('⏳ Waiting for M-Pesa callbacks...');
    console.log('================================================');
});