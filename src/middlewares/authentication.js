import jwt from 'jsonwebtoken';
import { BadRequestError, UnAuthorizedError } from '../../lib/appErrors.js';
import env from '../config/env.js';
import { findOrganizationById } from '../services/authentication/authenticationService.js';
import { secondDb } from '../db/connection.js';

export const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw new UnAuthorizedError('Missing token');

    const token = authorization.replace('Bearer ', '');

    const decoded = jwt.verify(token, env.jwt_key);
    if (!decoded) throw new UnAuthorizedError('Invalid token, user is not authorized');

    let adminType;
    let admin;

    if (!decoded.organization) adminType = 'main';
    else adminType = 'user';

    req.dbConnection = secondDb;

    if (adminType === 'main') {
      admin = await findOrganizationById(decoded._id);

      const path = req.path.replace('/', '');

      const pathBucket = [
        'make-onboarding-payments',
        'profile',
        'fetch-members-by-status',
        'dashboard',
        'list-items',
        'dashboard-1',
        'update-kyc',
        'view-kyc',
        'upgrade-module'
      ];

      if (admin && pathBucket.includes(path)) {
        req.user = admin;
        req.token = token;

        return next();
      }

      if (!admin || admin.acctstatus === 'suspended')
        throw new UnAuthorizedError('Invalid Organization, user is not authorized');

      req.user = admin;
      req.token = token;
    }

    if (new Date() > admin.end_trial_ts)
      throw new UnAuthorizedError('You must upgrade your account before moving forward');

    req.user = admin;
    req.token = token;

    next();
  } catch (err) {
    console.log(err);
    throw new UnAuthorizedError(err.message || 'User is not authorized');
  }
};

export const dbconnection = (req, res, next) => {
  req.dbConnection = secondDb;

  next();
};
