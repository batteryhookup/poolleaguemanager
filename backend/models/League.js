import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
  },
  teams: [{
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    name: String,
    members: [String]
  }],
  matches: [{
    date: Date,
    location: String,
    team1: {
      teamId: mongoose.Schema.Types.ObjectId,
      name: String,
      score: Number
    },
    team2: {
      teamId: mongoose.Schema.Types.ObjectId,
      name: String,
      score: Number
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    winner: mongoose.Schema.Types.ObjectId
  }],
  standings: [{
    teamId: mongoose.Schema.Types.ObjectId,
    name: String,
    wins: Number,
    losses: Number,
    draws: Number,
    points: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

const leagueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: false,
    default: "Unknown"
  },
  gameType: {
    type: String,
    required: false,
    default: "8-ball",
    enum: ['8-ball', '9-ball', '10-ball', 'straight', 'one-pocket', 'bank', 'rotation', 'other']
  },
  leagueType: {
    type: String,
    required: false,
    default: "singles",
    enum: ['singles', 'doubles', 'team', 'other']
  },
  schedule: {
    type: String,
    required: false,
    default: "Weekly"
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'completed', 'cancelled'],
    default: 'active'
  },
  sessions: [sessionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

const League = mongoose.model('League', leagueSchema);
export default League; 