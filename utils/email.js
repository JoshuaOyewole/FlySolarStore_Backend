const nodemailer = require('nodemailer');

// Email transporter configuration  
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email credentials not configured. Emails will not be sent.');
    console.warn('⚠️  Please set EMAIL_USER and EMAIL_PASS in your .env file');
    return null;
  }

  // Nodemailer v7.x+ uses default export
  const mailerModule = nodemailer.default || nodemailer;
  
  if (typeof mailerModule.createTransport !== 'function') {
    console.error('Nodemailer createTransport is not available');
    return null;
  }

  const port = parseInt(process.env.EMAIL_PORT) || 587;
  const isSecure = port === 465;
  
  const transportConfig = {
    host: process.env.EMAIL_HOST,
    port: port,
    secure: isSecure, // true for 465, false for other ports (587)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      // Don't fail on invalid certs
      rejectUnauthorized: false,
      // Minimum TLS version
      minVersion: 'TLSv1.2'
    },
    // Connection timeout (10 seconds)
    connectionTimeout: 10000,
    // Greeting timeout (10 seconds)
    greetingTimeout: 10000,
    // Socket timeout (10 seconds)
    socketTimeout: 10000,
    // Enable debug logs
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  };

  // For port 587, explicitly enable STARTTLS
  if (port === 587) {
    transportConfig.requireTLS = true;
  }
  
  
  return mailerModule.createTransport(transportConfig);
};

// Send email function
const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const transporter = createTransporter();
    
    // If transporter is null (email not configured), skip sending
    if (!transporter) {
      console.log('📧 Email not sent (service not configured):', subject);
      return { success: false, message: 'Email service not configured' };
    }
    
    // For now, sending simple HTML email
    // In production, you'd use a template engine like Handlebars
    let html = '';
    
    if (template === 'test') {
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #CC5500 0%, #FF6B35 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-badge { background: #10B981; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 20px 0; }
              .info-box { background: white; padding: 15px; border-left: 4px solid #CC5500; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Test Email Successful!</h1>
                <p>FlySolarStore Email Service</p>
              </div>
              <div class="content">
                <div class="success-badge">✓ Email Delivery Working</div>
                <p><strong>Congratulations!</strong> Your email service is configured correctly and working properly.</p>
                <div class="info-box">
                  <p><strong>Message:</strong> ${data.message}</p>
                  <p><strong>Sent at:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                </div>
                <p>This confirms that:</p>
                <ul>
                  <li>✓ SMTP connection is established</li>
                  <li>✓ Email credentials are valid</li>
                  <li>✓ Emails can be delivered successfully</li>
                  <li>✓ Your application can send notifications</li>
                </ul>
                <p>You can now confidently use email features like:</p>
                <ul>
                  <li>Account verification emails</li>
                  <li>Password reset emails</li>
                  <li>Order confirmations</li>
                  <li>Other notifications</li>
                </ul>
              </div>
              <div class="footer">
                <p>FlySolarStore - Your trusted solar products marketplace</p>
                <p>This is an automated test email. Please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else if (template === 'emailVerification') {
      html = `
        <h2>Welcome to FlySolarStore, ${data.name}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${data.verificationLink}">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
      `;
    } else if (template === 'passwordReset') {
      html = `
        <h2>Password Reset Request</h2>
        <p>Hello ${data.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${data.resetLink}">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;
    } 
  
    else if (template === 'orderConfirmation') {
      const itemsHtml = data.items.map(item => `
        <tr>
          <td class="item-name">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="font-size: 22px;">⚡</span>
              </div>
              <div>
                <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">${item.productSnapshot.title}</div>
                <div style="font-size: 12px; color: #9ca3af;">SKU: ${item.productSnapshot._id || 'N/A'}</div>
              </div>
            </div>
          </td>
          <td class="item-qty">
            <span style="background-color: #f3f4f6; padding: 4px 12px; border-radius: 12px; font-weight: 600;">×${item.quantity}</span>
          </td>
          <td class="item-price">
            ₦${item.subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </td>
        </tr>
      `).join('');

      // Determine shipping method text
      //let shippingMethodText = 'Shipping';
      //let shippingLocation = '';
      if (data.shippingCost === 0 || data.shippingCost < 10000) {
        shippingMethodText = 'Shipping: Pickup (LAGOS)';
       /*  shippingLocation = 'Lagos - Alaba International Market'; */
      }

      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
              .email-wrapper { background-color: #f3f4f6; padding: 40px 20px; }
              .email-container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); }
              .header { background: #cc5500; padding: 40px 30px; text-align: center; color: #ffffff; }
              .header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 700; }
              .header p { margin: 0; font-size: 14px; opacity: 0.95; }
              .status-badge { display: inline-block; background-color: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin: 20px 0; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 20px 0; }
              .message { color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 30px 0; }
              .payment-box { background: linear-gradient(to bottom right, #ede9fe, #f3e8ff); border-left: 4px solid #cc5500; padding: 24px; border-radius: 8px; margin: 30px 0; }
              .payment-box h3 { margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #111827; }
              .bank-details { background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 16px 0; }
              .bank-details p { margin: 0 0 12px 0; font-size: 14px; color: #374151; }
              .bank-details strong { color: #111827; font-weight: 600; }
              .detail-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
              .detail-label { color: #6b7280; }
              .detail-value { color: #111827; font-weight: 600; }
              .cta-button { display: inline-block; background-color: #cc5500; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
              .invoice-section { margin: 30px 0; }
              .section-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
              .order-info { background-color: #f9fafb; padding: 16px; border-radius: 6px; margin-bottom: 20px; }
              .order-info span { color: #6b7280; font-size: 14px; }
              .order-info strong { color: #111827; font-weight: 600; }
              .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .items-table thead { background-color: #f9fafb; }
              .items-table th { padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; }
              .items-table td { padding: 16px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; }
              .item-name { font-weight: 500; color: #111827; }
              .item-qty { text-align: center; }
              .item-price { text-align: right; font-weight: 600; color: #111827; }
              .totals-section { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px; }
              .total-row.subtotal { color: #6b7280; }
              .total-row.shipping { color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; }
              .total-row.grand-total { font-size: 20px; font-weight: 700; color: #111827; padding-top: 16px; border-top: 2px solid #d1d5db; }
              .address-section { margin: 30px 0; padding: 20px; background-color: #fafafa; border-radius: 8px; }
              .address-section h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #111827; }
              .address-content { font-size: 14px; line-height: 1.8; color: #4b5563; }
              .address-name { font-weight: 600; color: #111827; margin-bottom: 4px; }
              .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
              .footer p { margin: 8px 0; color: #6b7280; font-size: 13px; line-height: 1.6; }
              .footer a { color: #cc5500; text-decoration: none; font-weight: 600; }
              .highlight { background-color: #fef3c7; padding: 2px 6px; border-radius: 3px; }
              @media only screen and (max-width: 600px) {
                .email-wrapper { padding: 20px 10px; }
                .content { padding: 30px 20px; }
                .header { padding: 30px 20px; }
                .items-table th, .items-table td { padding: 10px 8px; font-size: 13px; }
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <div class="email-container">
                
                <!-- Header -->
                <div class="header">
                  <h1>📦 Order Invoice</h1>
                  <p>FlySolarStore - Your Solar Solutions Partner</p>
                </div>
                
                <!-- Main Content -->
                <div class="content">
                  
                  <!-- Status Badge -->
                  <div style="text-align: center;">
                    <span class="status-badge">⏳ Awaiting Payment</span>
                  </div>
                  
                  <!-- Greeting -->
                  <p class="greeting">Hello ${data.shippingAddress.name.split(' ')[0]},</p>
                  
                  <!-- Message -->
                  <p class="message">
                    Thank you for placing your order with FlySolarStore! We've successfully received your order and it's currently pending payment confirmation.
                  </p>
                  
                  <p class="message">
                    To complete your purchase, please proceed with the payment using the bank details provided below. Once payment is made, kindly send your payment receipt to us for verification.
                  </p>
                  
                  <!-- Payment Instructions Box -->
                  <div class="payment-box">
                    <h3>💳 Payment Instructions</h3>
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Please transfer the total amount to the account below and send your payment receipt to 
                      <a href="tel:08167360193" text-decoration: none; font-weight: 600;">08167360193</a> via WhatsApp or SMS.
                    </p>
                    
                    <div class="bank-details">
                      <p style="margin: 0 0 16px 0; font-size: 15px; font-weight: 700; color: #333;">
                        FLY SOLAR STORE NG LIMITED
                      </p>
                      <div class="detail-row">
                        <span class="detail-label">Bank Name:</span>
                        <span class="detail-value">UBA (United Bank for Africa)</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Account Number:</span>
                        <span class="detail-value">0421451448</span>
                      </div>
                      <div class="detail-row" style="border-top: 1px solid #e5e7eb; margin-top: 12px; padding-top: 12px;">
                        <span class="detail-label">Amount to Pay:</span>
                        <span class="detail-value" style="font-size: 18px; color: #333;">₦${data.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Order Details Section -->
                  <div class="invoice-section">
                    <h2 class="section-title">Order Details</h2>
                    
                    <div class="order-info">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Order Number:</span>
                        <strong> #${data.orderNumber.split('-').slice(1).join('-') || data.orderNumber}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between;">
                        <span>Order Date:</span>
                        <strong> ${new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                      </div>
                    </div>
                    
                    <!-- Items Table -->
                    <table class="items-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th class="item-qty">Qty</th>
                          <th class="item-price">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>
                    
                    <!-- Totals -->
                    <div class="totals-section">
                      <div class="total-row subtotal">
                        <span>Subtotal:</span>
                        <span style="font-weight: 600; color: #111827;">₦${data.subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div class="total-row shipping">
                        <span>Pickup Cost (Within Lagos):</span>
                        <span style="font-weight: 600; color: #111827;">₦${data.shippingCost.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div class="total-row grand-total">
                        <span>Total Amount:</span>
                        <span>₦${data.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                  
               
                  
                </div>
                
                <!-- Footer -->
                <div class="footer">
                  <p style="font-weight: 600; color: #111827; margin-bottom: 12px;">Need Help?</p>
                  <p>If you have any questions about your order or payment, please contact us:</p>
                  <p>
                    📞 <a href="tel:08167360193">08167360193</a> | 
                    📧 <a href="mailto:support@flysolarstore.com">support@flysolarstore.com</a>
                  </p>
                  <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                    © ${new Date().getFullYear()} FlySolarStore. All rights reserved.
                  </p>
                </div>
                
              </div>
            </div>
          </body>
        </html>
      `;
    }

    const mailOptions = {
      from: `"FlySolarStore" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send order confirmation email
const sendOrderConfirmation = async (order) => {
  try {
    const result = await sendEmail({
      to: order.shippingAddress.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      template: 'orderConfirmation',
      data: order
    });
    return result;
  } catch (error) {
    console.error('Failed to send order confirmation:', error);
    // Don't throw error - just return null to allow order creation to succeed
    return null;
  }
};

module.exports = { sendEmail, sendOrderConfirmation };