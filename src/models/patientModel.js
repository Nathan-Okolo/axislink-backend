import mongoose from "mongoose";

const { Schema, model } = mongoose;

const patientSchema = new Schema(
    {
        contactInformation: {
            phone: { type: String, required: true },
            email: { type: String, required: true },
            address: { type: String, required: true },
        },
        medicalInfo: {
            bloodType: { type: String, required: true },
            allergies: { type: String, required: true },
            medications: {
                name: { type: String, required: true },
                dosage: { type: String, required: true },
                frequency: { type: String, required: true },
            },
            medicalHistory: { type: String, required: true },
        },
        emergencyContacts: {
            name: { type: String, required: true },
            phoneNumber: { type: String, required: true },
        },
        vitals: {
            height: { type: String, required: true },
            weight: { type: String, required: true },
            bloodPressure: { type: String, required: true },
        },
        otp: { type: String, required: true },
        gender: { type: String, required: true },
        password: { type: String, required: true },
        username: { type: String, required: true },
        dob: { type: Date, required: true },
        profileImage: { type: String, required: true },

    },
    { timestamps: true }
);

const Patient = model("Patient", patientSchema);

export default Patient;

