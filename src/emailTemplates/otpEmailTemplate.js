module.exports = (otp, userName = "User") => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style type="text/css">
        *{ box-sizing: border-box; margin: 0; }
        body{ background-color: #FFF; font-family: "Arial"; }
        .container{ max-width: 615px; width: 100%; margin: 0 auto; padding: 32px; background-color: #FFF; }
        .text-center{ text-align: center; }
        .email-wraper{ padding: 28px; border-radius: 12px; border: 0.66px solid #D9DADF; background: #FFF; }
        .p-tag{ color: #484A54; font-size: 14px; font-weight: 400; line-height: 20px; }
        .heading-tag{ color: #030303; font-size: 22px; font-weight: 600; padding-top: 12px; }
        .otp-number{ color: #000; font-size: 24px; font-weight: bold; padding: 15px 20px; border: 2px solid #4CAF50; border-radius: 8px; display: inline-block; margin: 0 5px; }
        .green-text{ color: #4CAF50; }
        .pt-24{ padding-top: 24px; }
        .pt-32{ padding-top: 32px; }
        .pt-8{ padding-top: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-wraper">
            <div>
                <h1 style="color: #4CAF50;">Scrum.</h1>
            </div>

            <h2 class="heading-tag pt-24">OTP Verification</h2>
            <p class="p-tag pt-24">Dear <span class="green-text">${userName}</span>,</p>
            <p class="p-tag pt-8">We received a request to verify your account. Please use the following 6-digit One-Time Password (OTP):</p>

            <div class="text-center pt-24">
                <span class="otp-number">${otp}</span>
            </div>

            <p class="p-tag pt-32">This OTP is valid for 10 minutes. Please do not share this code with anyone for security reasons.</p>
            <p class="p-tag pt-8">If you didn't request this, please ignore this email.</p>
        </div>
    </div>
</body>
</html>
`;