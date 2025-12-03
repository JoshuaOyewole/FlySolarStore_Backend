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
  
  console.log('📧 Email configuration:', {
    host: process.env.EMAIL_HOST,
    port: port,
    secure: isSecure,
    user: process.env.EMAIL_USER?.substring(0, 3) + '***'
  });
  
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
          <td style="padding: 15px 10px; border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 50px; height: 50px; background-color: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">📦</span>
              </div>
              <div>
                <div style="font-weight: 500; color: #111827;">${item.productSnapshot.title}</div>
              </div>
            </div>
          </td>
          <td style="padding: 15px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">
            ×${item.quantity}
          </td>
          <td style="padding: 15px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827;">
            ₦${item.subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </td>
        </tr>
      `).join('');

      // Determine shipping method text
      let shippingMethodText = 'Shipping';
      let shippingLocation = '';
      if (data.shippingCost === 0 || data.shippingCost < 10000) {
        shippingMethodText = 'Shipping: Pickup (LAGOS)';
        shippingLocation = 'Lagos - Ikeja Pickup location';
      }

      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; }
            </style>
          </head>
          <body style="background-color: #f9fafb; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="background-color: #7c3aed; color: white; padding: 30px 20px; text-align: left;">
                <h1 style="margin: 0; font-size: 20px; font-weight: 600;">Itel Solar | Inverter, Battery, Panel and Solar Generator</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                
                <!-- Thank You -->
                <h2 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700; color: #111827;">Thank you for your order</h2>
                
                <p style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">Hi ${data.shippingAddress.name.split(' ')[0].toUpperCase()},</p>
                
                <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  We've received your order and it's currently on hold until we can confirm your payment has been processed.
                </p>
                
                <p style="margin: 0 0 30px 0; color: #374151; font-size: 14px;">
                  Here's a reminder of what you've ordered:
                </p>
                
                <!-- Order Info Box -->
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                  <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">
                    Kindly Send the receipt of the bank transfer to <a href="tel:08071444456" style="color: #7c3aed; text-decoration: none; font-weight: 600;">08071444456</a>
                  </p>
                  
                  <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 700; color: #111827;">Our bank details</h3>
                  
                  <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: 700; color: #111827;">VISIBILITY MARKETING COMPANY :</p>
                  
                  <ul style="margin: 10px 0; padding-left: 20px; color: #374151; font-size: 14px;">
                    <li style="margin-bottom: 5px;">Bank: <strong>UBA</strong></li>
                    <li>Account number: <strong>1027234184</strong></li>
                  </ul>
                </div>
                
                <!-- Order Summary -->
                <h3 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #111827;">Order summary</h3>
                <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">
                  Order #${data.orderNumber.split('-').slice(1).join('-') || data.orderNumber} (${new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})
                </p>
                
                <!-- Order Items Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                
                <!-- Totals -->
                <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
                  <table style="width: 100%; margin-bottom: 10px;">
                    <tr>
                      <td style="padding: 8px 0; color: #374151; font-size: 14px;">Subtotal:</td>
                      <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 600; font-size: 14px;">₦${data.subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #374151; font-size: 14px;">
                        ${shippingMethodText}${shippingLocation ? '<br/><span style="font-size: 12px; color: #6b7280;">' + shippingLocation + '</span>' : ''}
                      </td>
                      <td style="padding: 8px 0; text-align: right;">
                        <div style="color: #111827; font-weight: 600; font-size: 14px;">Pickup cost:</div>
                        <div style="color: #111827; font-weight: 600; font-size: 14px;">₦${data.shippingCost.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px 0 8px 0; color: #111827; font-size: 16px; font-weight: 700; border-top: 2px solid #e5e7eb;">Total:</td>
                      <td style="padding: 15px 0 8px 0; text-align: right; color: #111827; font-size: 18px; font-weight: 700; border-top: 2px solid #e5e7eb;">₦${data.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 15px 0; color: #374151; font-size: 14px;">Payment method:</td>
                      <td style="padding: 0 0 15px 0; text-align: right; color: #374151; font-size: 14px;">Direct bank transfer</td>
                    </tr>
                  </table>
                </div>
                
                <!-- Billing Address -->
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 700; color: #111827;">Billing address</h3>
                  <div style="color: #374151; font-size: 14px; line-height: 1.8;">
                    <div style="font-weight: 600; margin-bottom: 5px;">${data.billingAddress.name.toUpperCase()}</div>
                    <div>${data.billingAddress.address}</div>
                    <div>${data.billingAddress.state || 'Benin City'}</div>
                    <div>${data.billingAddress.state || 'Akwa Ibom'}</div>
                    <div>${data.billingAddress.country.label || 'Nigeria'}</div>
                    <div><a href="tel:${data.billingAddress.contact}" style="color: #7c3aed; text-decoration: none;">${data.billingAddress.contact}</a></div>
                    <div><a href="mailto:${data.billingAddress.email}" style="color: #7c3aed; text-decoration: none;">${data.billingAddress.email}</a></div>
                  </div>
                </div>
                
                <!-- Footer Message -->
                <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Thanks again! If you need any help with your order, please contact us at
                  </p>
                </div>
                
              </div>
            </div>
          </body>
        </html>
      `;
    }

    const mailOptions = {
      from: `"FlySolarStore" <${process.env.EMAIL_USER}>`,
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