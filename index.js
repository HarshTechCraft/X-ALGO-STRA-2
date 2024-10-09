// const speakeasy = require("speakeasy");
// const axios = require("axios");
// const WebSocket = require("ws");
// const http = require("http");
// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const cors = require('cors');

// app.use(bodyParser.json());
// const port = process.env.PORT || 5000;

// app.use(cors()); // Enable CORS
// app.use(bodyParser.json());

// app.get('/start', (req, res) => {
//     getPreviousData()
//         .then(() => res.send("Data fetched successfully"))
//         .catch((error) => {
//             console.log("Error fetching data:", error);
//             res.status(500).send("Error fetching data");
//         });
// });

// // Start the HTTP server
// const server = http.createServer(app);
// server.listen(port, () => {

//     console.log(`Server running on http://localhost:${port}`);
    
// });

// // Constants for login credentials and API keys
// const secretKey = "UUGDXH753M4H5FS5HJVIGBSSSU";
// const clientcode = "R51644670";
// const password = "3250";
// const apiKey = "xL9TyAO8";
// const privateKey = "xL9TyAO8";

// // Function to get previous day's data
// const getPreviousData = async () => {
//     const totpCode = speakeasy.totp({
//         secret: secretKey,
//         encoding: "base32",
//     });

//     const data = JSON.stringify({
//         clientcode: clientcode,
//         password: password,
//         totp: `${totpCode}`,
//     });

//     const config = {
//         method: "post",
//         url: "https://apiconnect.angelbroking.com//rest/auth/angelbroking/user/v1/loginByPassword",
//         headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//             "X-UserType": "USER",
//             "X-SourceID": "WEB",
//             "X-ClientLocalIP": "192.168.43.238",
//             "X-ClientPublicIP": "106.193.147.98",
//             "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
//             "X-PrivateKey": privateKey,
//         },
//         data: data,
//     };

//     try {
//         const response = await axios(config);
//         const responseData = response.data;
//         const jwtToken = responseData.data.jwtToken;
//         const feedToken = responseData.data.feedToken;

//         const fromDate = getPreviousDayFormattedDate();
//         const toDate = fromDate;

//         const data2 = JSON.stringify({
//             exchange: "NSE",
//             symboltoken: "99926000",
//             interval: "ONE_MINUTE",
//             fromdate: fromDate,
//             todate: toDate,
//         });

//         const config2 = {
//             method: "post",
//             url: "https://apiconnect.angelbroking.com/rest/secure/angelbroking/historical/v1/getCandleData",
//             headers: {
//                 "X-PrivateKey": privateKey,
//                 "Accept": "application/json",
//                 "X-SourceID": "WEB",
//                 "X-ClientLocalIP": "192.168.43.238",
//                 "X-ClientPublicIP": "106.193.147.98",
//                 "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
//                 "X-UserType": "USER",
//                 "Authorization": `Bearer ${jwtToken}`,
//                 "Content-Type": "application/json",
//             },
//             data: data2,
//         };

//         const ceresponse = await axios(config2);
//         const jsonData = ceresponse.data;

//         const formattedData = jsonData.data.map(
//             ([timestamp, open, high, low, close, volume]) => ({
//                 timestamp,
//                 open,
//                 high,
//                 low,
//                 close,
//                 volume,
//             })
//         );

//         const close = formattedData[0].close;
//         const target = close * 1.05;

//         startWebSocket(target, jwtToken, feedToken);
//     } catch (error) {
//         console.log("Error fetching data:", error);
//     }
// };

// // Function to start WebSocket server and connect
// const startWebSocket = (target, jwtToken, feedToken) => {
//     const { WebSocketV2 } = require("smartapi-javascript");

//     const fetchDataAndConnectWebSocket = async () => {
//         try {

//             console.log("Target is ",target)

//             const web_socket = new WebSocketV2({
//                 jwttoken: jwtToken,
//                 apikey: apiKey,
//                 clientcode: clientcode,
//                 feedtype: feedToken,
//             });

//             await web_socket.connect();
//             const json_req = {
//                 correlationID: "abcde12345",
//                 action: 1,
//                 mode: 1,
//                 exchangeType: 1,
//                 tokens: [`26000`],
//             };

//             web_socket.fetchData(json_req);
//             web_socket.on("tick", receiveTick);
            
//             function receiveTick(data) {
//                 // console.log(data.last_traded_price / 100);
                
//                 if ((data.last_traded_price) / 100 > target) {
//                     sendEmail();
//                     web_socket.close();
//                 }

//                 wss.clients.forEach((client) => {
//                     if (client.readyState === WebSocket.OPEN) {
//                         client.send(JSON.stringify(data));
//                     }
//                 });
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     const wss = new WebSocket.Server({ server });

//     wss.on("close", () => {
//         console.log("WebSocket Server Closed");
//     });

//     fetchDataAndConnectWebSocket();
// };

// // Function to get the previous day's date formatted
// const getPreviousDayFormattedDate = () => {
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(today.getDate() - 1);
//     yesterday.setHours(15, 29, 0, 0);

//     const year = yesterday.getFullYear();
//     const month = String(yesterday.getMonth() + 1).padStart(2, "0");
//     const day = String(yesterday.getDate()).padStart(2, "0");
//     const hours = String(yesterday.getHours()).padStart(2, "0");
//     const minutes = String(yesterday.getMinutes()).padStart(2, "0");

//     return `${year}-${month}-${day} ${hours}:${minutes}`;
// };

// // Function to send email alert
// const sendEmail = () => {
//     console.log(
//         "Sending email to user: Market price exceeded +5% of previous day's close."
//     );

//     const nodemailer = require("nodemailer");

//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: "your_email@gmail.com", // Replace with your email
//             pass: "your_email_password", // Replace with your password
//         },
//     });

//     const mailOptions = {
//         from: "your_email@gmail.com", // Replace with your email
//         to: "recipient_email@gmail.com", // Replace with recipient's email
//         subject: "Market Price Alert",
//         text: "Market price exceeded +5% of previous day's close.",
//         html: "<b>Market price exceeded +5% of previous day's close.</b>",
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             return console.log("Error while sending email: ", error);
//         }
//         console.log("Email sent: " + info.response);
//     });
// };



const speakeasy = require("speakeasy");
const axios = require("axios");
const WebSocket = require("ws");
const http = require("http");
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
let web_socket; // Declare the WebSocket instance globally
let wss; // Declare the WebSocket server instance globally

app.use(bodyParser.json());
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS
app.use(bodyParser.json());

app.get('/start', (req, res) => {
    getPreviousData()
        .then(() => res.send("Data fetched successfully"))
        .catch((error) => {
            console.log("Error fetching data:", error);
            res.status(500).send("Error fetching data");
        });
});

// New route to close the WebSocket connection
app.get('/close', (req, res) => {
    if (web_socket) {
        web_socket.close();
        console.log("WebSocket connection closed");
        res.send("WebSocket connection closed");
    } else {
        res.status(400).send("No WebSocket connection to close");
    }
});

// Start the HTTP server
const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Constants for login credentials and API keys
const secretKey = "UUGDXH753M4H5FS5HJVIGBSSSU";
const clientcode = "R51644670";
const password = "3250";
const apiKey = "xL9TyAO8";
const privateKey = "xL9TyAO8";

// Function to get previous day's data
const getPreviousData = async () => {
    const totpCode = speakeasy.totp({
        secret: secretKey,
        encoding: "base32",
    });

    const data = JSON.stringify({
        clientcode: clientcode,
        password: password,
        totp: `${totpCode}`,
    });

    const config = {
        method: "post",
        url: "https://apiconnect.angelbroking.com//rest/auth/angelbroking/user/v1/loginByPassword",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": "192.168.43.238",
            "X-ClientPublicIP": "106.193.147.98",
            "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
            "X-PrivateKey": privateKey,
        },
        data: data,
    };

    try {
        const response = await axios(config);
        const responseData = response.data;
        const jwtToken = responseData.data.jwtToken;
        const feedToken = responseData.data.feedToken;

        const fromDate = getPreviousDayFormattedDate();
        const toDate = fromDate;

        const data2 = JSON.stringify({
            exchange: "NSE",
            symboltoken: "99926000",
            interval: "ONE_MINUTE",
            fromdate: fromDate,
            todate: toDate,
        });

        const config2 = {
            method: "post",
            url: "https://apiconnect.angelbroking.com/rest/secure/angelbroking/historical/v1/getCandleData",
            headers: {
                "X-PrivateKey": privateKey,
                "Accept": "application/json",
                "X-SourceID": "WEB",
                "X-ClientLocalIP": "192.168.43.238",
                "X-ClientPublicIP": "106.193.147.98",
                "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
                "X-UserType": "USER",
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            data: data2,
        };

        const ceresponse = await axios(config2);
        const jsonData = ceresponse.data;

        const formattedData = jsonData.data.map(
            ([timestamp, open, high, low, close, volume]) => ({
                timestamp,
                open,
                high,
                low,
                close,
                volume,
            })
        );

        const close = formattedData[0].close;
        const target = close * 1.05;

        startWebSocket(target, jwtToken, feedToken);
    } catch (error) {
        console.log("Error fetching data:", error);
    }
};

// Function to start WebSocket server and connect
const startWebSocket = (target, jwtToken, feedToken) => {
    const { WebSocketV2 } = require("smartapi-javascript");

    const fetchDataAndConnectWebSocket = async () => {
        try {
            console.log("Target is ", target);

            web_socket = new WebSocketV2({
                jwttoken: jwtToken,
                apikey: apiKey,
                clientcode: clientcode,
                feedtype: feedToken,
            });

            await web_socket.connect();
            const json_req = {
                correlationID: "abcde12345",
                action: 1,
                mode: 1,
                exchangeType: 1,
                tokens: [`26000`],
            };

            web_socket.fetchData(json_req);
            web_socket.on("tick", receiveTick);

            function receiveTick(data) {
                console.log(data.last_traded_price/100)
                if (data.last_traded_price / 100 > target) {
                    sendEmail();
                    web_socket.close();
                }

                if (wss) {
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(data));
                        }
                    });
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    wss = new WebSocket.Server({ server });

    wss.on("close", () => {
        console.log("WebSocket Server Closed");
    });

    fetchDataAndConnectWebSocket();
};

// Function to get the previous day's date formatted
const getPreviousDayFormattedDate = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(15, 29, 0, 0);

    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, "0");
    const day = String(yesterday.getDate()).padStart(2, "0");
    const hours = String(yesterday.getHours()).padStart(2, "0");
    const minutes = String(yesterday.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Function to send email alert
const sendEmail = () => {
    console.log(
        "Sending email to user: Market price exceeded +5% of previous day's close."
    );

    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "your_email@gmail.com", // Replace with your email
            pass: "your_email_password", // Replace with your password
        },
    });

    const mailOptions = {
        from: "your_email@gmail.com", // Replace with your email
        to: "recipient_email@gmail.com", // Replace with recipient's email
        subject: "Market Price Alert",
        text: "Market price exceeded +5% of previous day's close.",
        html: "<b>Market price exceeded +5% of previous day's close.</b>",
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("Error while sending email: ", error);
        }
        console.log("Email sent: " + info.response);
    });
};
