import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';

const router = Router();
const controller = new ContactController();

router.post('/submit', controller.submitContactForm);

export default router;
