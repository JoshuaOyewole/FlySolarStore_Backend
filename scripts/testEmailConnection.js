/**
 * Email Connection Diagnostic Tool
 * Run this script to test your email configuration
 * Usage: node scripts/testEmailConnection.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const net = require('net');

console.log('🔍 Email Connection Diagnostic Tool\n');
console.log('=' .repeat(50));

// Check environment variables
console.log('\n📋 Configuration Check:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '❌ Not set');
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '❌ Not set');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '***' : '❌ Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.substring(process.env.EMAIL_PASS.length - 3) : '❌ Not set');

if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('\n❌ Missing email configuration in .env file');
  process.exit(1);
}

async function testDNS() {
  console.log('\n🌐 DNS Resolution Test:');
  try {
    const addresses = await dns.resolve4(process.env.EMAIL_HOST);
    console.log('✅ DNS resolved:', addresses.join(', '));
    return addresses[0];
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
    return null;
  }
}

async function testPort(host, port) {
  console.log(`\n🔌 Port ${port} Connection Test:`);
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 10000;

    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`✅ Port ${port} is open and accessible`);
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      console.log(`❌ Connection timeout (${timeout}ms) - Port may be blocked`);
      socket.destroy();
      resolve(false);
    });

    socket.on('error', (error) => {
      console.log(`❌ Connection error: ${error.message}`);
      resolve(false);
    });

    console.log(`Attempting to connect to ${host}:${port}...`);
    socket.connect(port, host);
  });
}

async function testSMTP() {
  console.log('\n📧 SMTP Connection Test:');
  
  const port = parseInt(process.env.EMAIL_PORT);
  const mailerModule = nodemailer.default || nodemailer;
  
  const configs = [
    {
      name: 'Current Config (Port ' + port + ')',
      config: {
        host: process.env.EMAIL_HOST,
        port: port,
        secure: port === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        },
        connectionTimeout: 10000
      }
    }
  ];

  // If current port is 587, also try 465
  if (port === 587) {
    configs.push({
      name: 'Alternative Config (Port 465)',
      config: {
        host: process.env.EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000
      }
    });
  }

  for (const { name, config } of configs) {
    console.log(`\nTesting ${name}...`);
    const transporter = mailerModule.createTransport(config);
    
    try {
      await transporter.verify();
      console.log(`✅ ${name} - SMTP connection successful!`);
      return true;
    } catch (error) {
      console.log(`❌ ${name} failed:`, error.message);
    }
  }
  
  return false;
}

async function suggestAlternatives() {
  console.log('\n💡 Suggested Solutions:\n');
  console.log('1. Use Gmail SMTP (Most Reliable):');
  console.log('   EMAIL_HOST=smtp.gmail.com');
  console.log('   EMAIL_PORT=587');
  console.log('   EMAIL_USER=your-gmail@gmail.com');
  console.log('   EMAIL_PASS=your-app-password (not regular password!)');
  console.log('   - Enable 2FA in Gmail');
  console.log('   - Create app password: https://myaccount.google.com/apppasswords\n');
  
  console.log('2. Use SendGrid (Free tier available):');
  console.log('   EMAIL_HOST=smtp.sendgrid.net');
  console.log('   EMAIL_PORT=587');
  console.log('   EMAIL_USER=apikey');
  console.log('   EMAIL_PASS=your-sendgrid-api-key\n');
  
  console.log('3. Use Mailtrap (For testing only):');
  console.log('   EMAIL_HOST=sandbox.smtp.mailtrap.io');
  console.log('   EMAIL_PORT=2525');
  console.log('   EMAIL_USER=your-mailtrap-username');
  console.log('   EMAIL_PASS=your-mailtrap-password\n');
  
  console.log('4. Contact Your Hosting Provider:');
  console.log('   - Verify mail.felicitysolar.ng is configured correctly');
  console.log('   - Check if outbound SMTP is enabled');
  console.log('   - Confirm firewall rules allow SMTP traffic\n');
  
  console.log('5. Check Your Network:');
  console.log('   - Try from a different network/WiFi');
  console.log('   - Disable VPN if active');
  console.log('   - Check if your ISP blocks SMTP ports');
}

// Run all tests
(async () => {
  try {
    const ip = await testDNS();
    
    if (ip) {
      const port = parseInt(process.env.EMAIL_PORT);
      await testPort(ip, port);
      
      // Also test alternative port
      const altPort = port === 587 ? 465 : 587;
      await testPort(ip, altPort);
    }
    
    const smtpSuccess = await testSMTP();
    
    if (!smtpSuccess) {
      await suggestAlternatives();
    } else {
      console.log('\n🎉 All tests passed! Your email configuration is working.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error.message);
  }
  
  console.log('=' .repeat(50));
})();
