/**
 * Watchlist Routes
 * Let Investments - Watchlist API endpoints
 */

const express = require('express');
const router = express.Router();
const watchlistRepository = require('../repositories/watchlistRepository');
const companyRepository = require('../repositories/companyRepository');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.get('/', authenticate, async (req, res) => {
  try {
    const watchlist = await watchlistRepository.findByUserId(req.userId);
    res.json({ success: true, watchlist, count: watchlist.length });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist', message: error.message });
  }
});

router.get('/count', authenticate, async (req, res) => {
  try {
    const count = await watchlistRepository.getCount(req.userId);
    res.json({ success: true, count });
  } catch (error) {
    console.error('Get watchlist count error:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist count', message: error.message });
  }
});

router.get('/alerts', authenticate, async (req, res) => {
  try {
    const alerts = await watchlistRepository.getPriceAlerts(req.userId);
    res.json({ success: true, alerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts', message: error.message });
  }
});

router.post('/', authenticate, validate(schemas.addWatchlist), async (req, res) => {
  try {
    const { companyId, targetPrice, note, priceAlertEnabled } = req.body;
    const company = await companyRepository.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    const existing = await watchlistRepository.findByUserAndCompany(req.userId, companyId);
    if (existing) {
      return res.status(400).json({ error: 'Already in watchlist', message: 'This company is already in your watchlist' });
    }
    const watchlistItem = await watchlistRepository.add(req.userId, companyId, targetPrice, note, priceAlertEnabled || false);
    res.status(201).json({ success: true, message: 'Added to watchlist', watchlist: watchlistItem });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Failed to add to watchlist', message: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { targetPrice, note, priceAlertEnabled } = req.body;
    const existing = await watchlistRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Watchlist item not found' });
    }
    if (existing.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const updated = await watchlistRepository.update(id, { targetPrice, note, priceAlertEnabled });
    res.json({ success: true, message: 'Watchlist updated', watchlist: updated });
  } catch (error) {
    console.error('Update watchlist error:', error);
    res.status(500).json({ error: 'Failed to update watchlist', message: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await watchlistRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Watchlist item not found' });
    }
    if (existing.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    await watchlistRepository.removeById(id, req.userId);
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist', message: error.message });
  }
});

router.delete('/company/:companyId', authenticate, async (req, res) => {
  try {
    const { companyId } = req.params;
    const existing = await watchlistRepository.findByUserAndCompany(req.userId, companyId);
    if (!existing) {
      return res.status(404).json({ error: 'Not in watchlist' });
    }
    await watchlistRepository.remove(req.userId, companyId);
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist', message: error.message });
  }
});

router.delete('/clear', authenticate, async (req, res) => {
  try {
    await watchlistRepository.clearAll(req.userId);
    res.json({ success: true, message: 'Watchlist cleared' });
  } catch (error) {
    console.error('Clear watchlist error:', error);
    res.status(500).json({ error: 'Failed to clear watchlist', message: error.message });
  }
});

module.exports = router;


