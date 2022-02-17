import twilio from 'twilio'

const accountSid = 'AC8f6a2b7be1d4d1be66ce31ad415ca23f'
const authToken = 'adf0709b3f34bc4d67e4a184faa09c54'

const client = twilio(accountSid, authToken)


async function sendWhatsapp(msj) {
    const options = {
        body: msj,
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+5491156637932'
    }
    
    try {
        await client.messages.create(options)
    } catch (error) {
        logger.error(error)
    }
    
}


export default sendWhatsapp