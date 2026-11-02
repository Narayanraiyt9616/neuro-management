import { Router } from 'express';
import { submitContactForm } from '../controllers/contactController';

const router: Router = Router();

/**
 * @route   POST /api/contact
 * @desc    Submit inquiry/contact form
 * @access  Public
 */
router.post('/', submitContactForm);

export default router;

