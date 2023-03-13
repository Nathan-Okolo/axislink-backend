import 'dotenv/config';

export default {
    port: process.env.PORT || 4000,
    db_uri: process.env.DB_URI,
    sendgrid_key: process.env.SENDGRID_API_KEY,
    sendgrid_sender: process.env.SENDGRID_EMAIL_SENDER,
    jwt_key: process.env.JWT_SECRET,
    node_env: process.env.NODE_ENV
}