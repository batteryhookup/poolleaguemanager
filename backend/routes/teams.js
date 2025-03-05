import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import Team from '../models/Team.js';
import User from '../models/User.js';

const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teams for current user (teams created by user or where user is a member)
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find teams where user is creator or a member
    const teams = await Team.find({
      $or: [
        { createdBy: req.user.id },
        { members: user.username }
      ]
    });
    
    res.json(teams);
  } catch (err) {
    console.error('Error fetching user teams:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific team by ID
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new team
router.post('/', auth, async (req, res) => {
  try {
    const { name, members } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure creator is included in members
    let teamMembers = members || [];
    if (!teamMembers.includes(user.username)) {
      teamMembers.push(user.username);
    }
    
    const newTeam = new Team({
      name,
      members: teamMembers,
      createdBy: req.user.id,
      createdAt: new Date()
    });
    
    const savedTeam = await newTeam.save();
    res.status(201).json(savedTeam);
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a team
router.put('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is the creator of the team
    if (team.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this team' });
    }
    
    const { name, members } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure creator is included in members
    let teamMembers = members || team.members;
    if (!teamMembers.includes(user.username)) {
      teamMembers.push(user.username);
    }
    
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { 
        name: name || team.name,
        members: teamMembers,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json(updatedTeam);
  } catch (err) {
    console.error('Error updating team:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a team
router.delete('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is the creator of the team
    if (team.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this team' });
    }
    
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a member to a team
router.post('/:id/members', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is the creator of the team
    if (team.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add members to this team' });
    }
    
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    // Check if user exists
    const userExists = await User.findOne({ username });
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is already a member
    if (team.members.includes(username)) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }
    
    team.members.push(username);
    team.updatedAt = new Date();
    await team.save();
    
    res.json(team);
  } catch (err) {
    console.error('Error adding team member:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a member from a team
router.delete('/:id/members/:username', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is the creator of the team
    if (team.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to remove members from this team' });
    }
    
    const username = req.params.username;
    
    // Check if user is a member
    const memberIndex = team.members.indexOf(username);
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'User is not a member of this team' });
    }
    
    // Don't allow removing the creator
    const user = await User.findById(req.user.id);
    if (username === user.username) {
      return res.status(400).json({ message: 'Cannot remove the team creator' });
    }
    
    team.members.splice(memberIndex, 1);
    team.updatedAt = new Date();
    await team.save();
    
    res.json(team);
  } catch (err) {
    console.error('Error removing team member:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 