import twilio from 'twilio'

import logger from '../logger.js'

const accountSid = 'AC8f6a2b7be1d4d1be66ce31ad415ca23f'
const authToken = 'adf0709b3f34bc4d67e4a184faa09c54'

const client = twilio(accountSid, authToken)

async function sendSMS(msj, telefono) {
    const options = {
        body: msj,
        // from: '+14155238886',
        from: '+18126152424',
        // messagingServiceSid: 'MGac852e3d6e5065346af9ffa39e75961e',
        to: '+541156637932'
    }
    
    try {
        await client.messages.create(options)
    } catch (error) {
        logger.error(error)
    }
    
}


export default sendSMS