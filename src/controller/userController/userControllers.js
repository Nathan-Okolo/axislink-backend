import appResponse from "../../lib/appResponse.js";
import {
  deleteUserProfile,
  followUser,
  getLeaderBoard,
  getUserPoint,
  updateUserProfile,
  viewConnection,
  viewProfile,
} from "../../services/userServices/userServices.js";

export const viewProfileHandler = async (req, res) => {
  const { user } = req;
  const profile = await viewProfile({ user });

  res.send(appResponse("viewing profile", profile));
};

export const viewConnectionHandler = async (req, res) => {
  const { user } = req;
  const profile = await viewConnection({ user });

  res.send(appResponse("viewing connections", profile));
};

export const viewMemberHandler = async (req, res) => {
  const { user } = req;
  const profile = await viewMember({ user });

  res.send(appResponse("viewing connections", profile));
};

export const getUserPointHandler = async (req, res) => {
  const { user } = req;
  const profile = await getUserPoint({ user });

  res.send(appResponse("points fetched successfully", profile));
};

export const followUserHandler = async (req, res) => {
  const { user } = req;
  const { userIdToFollow } = req.query;
  const profile = await followUser({ user, userIdToFollow });

  res.send(appResponse("followed or unfollowed a user successfully", profile));
};

export const updateUserProfileHandler = async (req, res) => {
  const { user, body } = req;
  const profile = await updateUserProfile({ user, body });

  res.send(appResponse("profile updated successfully", profile));
};

export const leaderBoardHandler = async (req, res) => {
  const board = await getLeaderBoard();

  res.send(appResponse("leaderboard fetched succefully", board));
};

export const deleteUserProfileHandler = async (req, res) => {
  const { user } = req;
  const profile = await deleteUserProfile({ user });

  res.send(appResponse("profile deleted successfully", profile));
};
