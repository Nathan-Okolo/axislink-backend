import mongoose from "mongoose";

const { Schema, model } = mongoose;

const appointmentSchema = new Schema(
    {
        patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
        reason: { type: String, required: true },
        date: { type: String, required: true },
        status: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default model("appointment", appointmentSchema);
