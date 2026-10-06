import { Router } from 'express';
import { getSettings, updateSettings, updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { updateSettingsSchema, updateProfileSchema } from '../validators/user.validator';

const router = Router();

router.get('/settings', authenticate, getSettings);
router.patch('/settings', authenticate, validateRequest({ body: updateSettingsSchema }), updateSettings);
router.patch('/profile', authenticate, validateRequest({ body: updateProfileSchema }), updateProfile);

export default router;
