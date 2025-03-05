import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import League from '../models/League.js';
import User from '../models/User.js';

const router = express.Router();

// Get all leagues
router.get('/', async (req, res) => {
  try {
    const leagues = await League.find();
    res.json(leagues);
  } catch (err) {
    console.error('Error fetching leagues:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific league by ID
router.get('/:id', async (req, res) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    res.json(league);
  } catch (err) {
    console.error('Error fetching league:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new league
router.post('/', auth, async (req, res) => {
  try {
    const { name, location, gameType, leagueType, schedule, status, sessions } = req.body;
    
    // Check if a league with the same name already exists
    const existingLeague = await League.findOne({ name });
    if (existingLeague) {
      return res.status(400).json({ message: 'A league with this name already exists' });
    }
    
    const newLeague = new League({
      name,
      location,
      gameType,
      leagueType,
      schedule,
      status,
      sessions: sessions || [],
      createdBy: req.user.id,
      createdAt: new Date()
    });
    
    const savedLeague = await newLeague.save();
    res.status(201).json(savedLeague);
  } catch (err) {
    console.error('Error creating league:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a league
router.put('/:id', auth, async (req, res) => {
  try {
    const league = await League.findById(req.params.id);
    
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    // Check if user is the creator of the league
    if (league.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this league' });
    }
    
    const { name, location, gameType, leagueType, schedule, status } = req.body;
    
    // Check if name is being changed and if the new name already exists
    if (name && name !== league.name) {
      const existingLeague = await League.findOne({ name });
      if (existingLeague) {
        return res.status(400).json({ message: 'A league with this name already exists' });
      }
    }
    
    const updatedLeague = await League.findByIdAndUpdate(
      req.params.id,
      { 
        name: name || league.name,
        location: location || league.location,
        gameType: gameType || league.gameType,
        leagueType: leagueType || league.leagueType,
        schedule: schedule || league.schedule,
        status: status || league.status,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json(updatedLeague);
  } catch (err) {
    console.error('Error updating league:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a league
router.delete('/:id', auth, async (req, res) => {
  try {
    const league = await League.findById(req.params.id);
    
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    // Check if user is the creator of the league
    if (league.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this league' });
    }
    
    await League.findByIdAndDelete(req.params.id);
    res.json({ message: 'League deleted successfully' });
  } catch (err) {
    console.error('Error deleting league:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a session to a league
router.post('/:id/sessions', auth, async (req, res) => {
  try {
    const league = await League.findById(req.params.id);
    
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    // Check if user is the creator of the league
    if (league.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add sessions to this league' });
    }
    
    const { name, startDate, endDate, teams, matches, standings } = req.body;
    
    // Check if a session with the same name already exists in this league
    const sessionExists = league.sessions.some(session => session.name === name);
    if (sessionExists) {
      return res.status(400).json({ message: 'A session with this name already exists in this league' });
    }
    
    const newSession = {
      _id: new mongoose.Types.ObjectId(),
      name,
      startDate,
      endDate,
      teams: teams || [],
      matches: matches || [],
      standings: standings || [],
      createdAt: new Date()
    };
    
    league.sessions.push(newSession);
    await league.save();
    
    res.status(201).json(newSession);
  } catch (err) {
    console.error('Error adding session:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a session
router.put('/:leagueId/sessions/:sessionId', auth, async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);
    
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    // Check if user is the creator of the league
    if (league.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update sessions in this league' });
    }
    
    const sessionIndex = league.sessions.findIndex(
      session => session._id.toString() === req.params.sessionId
    );
    
    if (sessionIndex === -1) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    const { name, startDate, endDate, teams, matches, standings } = req.body;
    
    // Check if name is being changed and if the new name already exists
    if (name && name !== league.sessions[sessionIndex].name) {
      const sessionExists = league.sessions.some(
        (session, idx) => idx !== sessionIndex && session.name === name
      );
      if (sessionExists) {
        return res.status(400).json({ message: 'A session with this name already exists in this league' });
      }
    }
    
    // Update the session
    if (name) league.sessions[sessionIndex].name = name;
    if (startDate) league.sessions[sessionIndex].startDate = startDate;
    if (endDate) league.sessions[sessionIndex].endDate = endDate;
    if (teams) league.sessions[sessionIndex].teams = teams;
    if (matches) league.sessions[sessionIndex].matches = matches;
    if (standings) league.sessions[sessionIndex].standings = standings;
    league.sessions[sessionIndex].updatedAt = new Date();
    
    await league.save();
    
    res.json(league.sessions[sessionIndex]);
  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a session
router.delete('/:leagueId/sessions/:sessionId', auth, async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);
    
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    // Check if user is the creator of the league
    if (league.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete sessions from this league' });
    }
    
    const sessionIndex = league.sessions.findIndex(
      session => session._id.toString() === req.params.sessionId
    );
    
    if (sessionIndex === -1) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    league.sessions.splice(sessionIndex, 1);
    await league.save();
    
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 