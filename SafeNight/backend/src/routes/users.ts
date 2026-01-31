import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import {
  isConnected,
  getUserById,
  updateUser,
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
} from '../services/snowflake';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/users/:id
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify user is accessing their own profile
    if (req.user?.userId !== id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    if (!isConnected()) {
      // Demo mode
      res.json({
        id,
        email: req.user.email,
        displayName: 'Demo User',
        weight: 140,
        gender: 'female',
        emergencyContacts: [],
        settings: {
          shareLocation: true,
          allowCheckIns: true,
          autoEscalate: false,
          darkMode: true,
        },
      });
      return;
    }

    const user = await getUserById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const contacts = await getEmergencyContacts(id);

    res.json({
      id: user.ID,
      email: user.EMAIL,
      displayName: user.DISPLAY_NAME,
      weight: user.WEIGHT,
      gender: user.GENDER,
      sosCodeWord: user.SOS_CODE_WORD,
      emergencyContacts: contacts.map((c) => ({
        id: c.ID,
        name: c.NAME,
        phone: c.PHONE,
        relationship: c.RELATIONSHIP,
      })),
      settings: user.SETTINGS || {
        shareLocation: true,
        allowCheckIns: true,
        autoEscalate: false,
        darkMode: true,
      },
      createdAt: user.CREATED_AT,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// PATCH /api/users/:id
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify user is updating their own profile
    if (req.user?.userId !== id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { displayName, weight, gender, sosCodeWord, settings } = req.body;

    if (!isConnected()) {
      // Demo mode - just return success
      res.json({ message: 'Profile updated successfully' });
      return;
    }

    await updateUser(id, {
      displayName,
      weight,
      gender,
      sosCodeWord,
      settings,
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/users/:id/contacts
router.post('/:id/contacts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify user is adding to their own contacts
    if (req.user?.userId !== id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { name, phone, relationship } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: 'Name and phone are required' });
      return;
    }

    const contactId = uuidv4();

    if (!isConnected()) {
      // Demo mode - just return the contact
      res.status(201).json({
        id: contactId,
        name,
        phone,
        relationship,
      });
      return;
    }

    await addEmergencyContact(contactId, id, name, phone, relationship);

    res.status(201).json({
      id: contactId,
      name,
      phone,
      relationship,
    });
  } catch (error: any) {
    console.error('Add contact error:', error);
    res.status(500).json({ error: 'Failed to add emergency contact' });
  }
});

// DELETE /api/users/:id/contacts/:contactId
router.delete('/:id/contacts/:contactId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, contactId } = req.params;

    // Verify user is deleting their own contact
    if (req.user?.userId !== id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    if (!isConnected()) {
      // Demo mode - just return success
      res.json({ message: 'Contact deleted successfully' });
      return;
    }

    await deleteEmergencyContact(contactId, id);

    res.json({ message: 'Contact deleted successfully' });
  } catch (error: any) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Failed to delete emergency contact' });
  }
});

export default router;
