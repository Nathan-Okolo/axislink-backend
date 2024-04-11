import appResponse from "../../lib/appResponse.js";
import { deleteUserProfile, viewProfile } from "../../services/userServices/userServices.js";

export const viewProfileHandler = async (req, res) => {
  const { user } = req;
  const profile = await viewProfile({ user });

  res.send(appResponse("new user onboarded successfully", profile));
};

export const deleteUserProfileHandler = async (req, res) => {
  const { user } = req;
  const profile = await deleteUserProfile({ user });

  res.send(appResponse("profile deleted successfully", profile));
};
