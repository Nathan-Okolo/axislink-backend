import mongoose from "mongoose";

const { Schema, model } = mongoose;

const patientSchema = new Schema(
    {
        contactInformation: {
            phone: { type: String, required: false  },
            email: { type: String, required: true },
            address: { type: String, required: false },
        },
        medicalInfo: {
            bloodType: { type: String, required: false },
            allergies: { type: String, required: false },
            medications: {
                name: { type: String, required: false },
                dosage: { type: String, required: false },
                frequency: { type: String, required: false },
            },
            medicalHistory: { type: String, required: false },
        },
        emergencyContacts: {
            name: { type: String, required: false },
            phoneNumber: { type: String, required: false },
        },
        vitals: {
            height: { type: String, required: false },
            weight: { type: String, required: false },
            bloodPressure: { type: String, required: false },
        },
        otp: { type: String, required: true },
        gender: { type: String, required: false },
        password: { type: String, required: false },
        username: { type: String, required: false },
        dob: { type: String, required: false },
        profileImage: { type: String, required: false },

    },
    { timestamps: true }
);

const Patient = model("Patient", patientSchema);

export default Patient;

