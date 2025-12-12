const twilio = require('twilio');

class TwilioService {
  static client = null;

  static getClient() {
    if (!this.client) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (!accountSid || !authToken) {
        console.error('❌ Twilio credentials not configured');
        throw new Error('Twilio credentials are required');
      }

      this.client = twilio(accountSid, authToken);
    }
    return this.client;
  }

  static async sendOTPSMS(phone, otp) {
    try {
      console.log('🔧 Twilio Config Check:');
      console.log('- Account SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Missing');
      console.log('- Auth Token:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Missing');
      console.log('- Verify Service SID:', process.env.TWILIO_VERIFY_SERVICE_SID ? 'Set' : 'Missing');
      
      const client = this.getClient();
      const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

      if (!verifyServiceSid) {
        console.error('❌ Twilio Verify Service SID not configured');
        throw new Error('Twilio Verify Service SID not configured');
      }

      console.log('📱 Sending OTP via Twilio Verify to:', phone);
      console.log('📱 Using Verify Service SID:', verifyServiceSid);

      const verification = await client.verify.v2.services(verifyServiceSid).verifications.create({
        to: phone,
        channel: 'sms',
      });

      console.log('✅ OTP sent successfully via Twilio Verify:', verification.sid);
      console.log('✅ Verification Status:', verification.status);
      console.log('⚠️ Note: Twilio Verify generates its own OTP. User will receive Twilio\'s OTP, not:', otp);
      
      return verification;
    } catch (error) {
      console.error('❌ Error sending SMS via Twilio Verify:', error.message);
      console.error('❌ Full error details:', error);
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      // In development, don't throw to prevent app crash
      return null;
    }
  }

  static async verifyOTP(phone, otp) {
    try {
      const client = this.getClient();
      const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

      const verificationCheck = await client.verify.v2.services(verifyServiceSid)
        .verificationChecks.create({
          to: phone,
          code: otp
        });

      return verificationCheck.status === 'approved';
    } catch (error) {
      console.error('❌ Error verifying OTP:', error.message);
      return false;
    }
  }
}

module.exports = TwilioService;