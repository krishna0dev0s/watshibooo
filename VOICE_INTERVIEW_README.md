# Voice Interview Feature - Setup Guide

## Overview
The Voice Interview feature allows users to practice interviews with AI-powered feedback using Google Gemini. It includes:
- 8 pre-configured professional roles
- Real-time speech-to-text transcription
- AI-powered conversation analysis
- Detailed performance metrics and feedback
- Professional closing remarks

## Features

### Interview Roles
1. **Software Engineer** - Technical questions on design patterns, debugging, async programming
2. **Product Manager** - Product strategy, prioritization, and user research
3. **Data Scientist** - ML models, data handling, fairness and ethics
4. **UX Designer** - Design process, user research, balancing aesthetics and usability
5. **Marketing Manager** - Campaign strategy, ROI measurement, go-to-market strategy
6. **Sales Executive** - Sales process, prospecting, objection handling
7. **Financial Analyst** - Financial modeling, valuation, compliance
8. **HR Manager** - Talent acquisition, employee engagement, HR policies

### AI Analysis Metrics
- **Communication Clarity** - How clear and organized your response is
- **Technical Accuracy** - Correctness of information provided
- **Confidence Level** - Professionalism and self-assurance
- **Completeness** - Thoroughness of your answer
- **Articulation** - Grammar, pacing, and language quality

## Setup Instructions

### 1. Get Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Create API Key"
3. Copy your API key

### 2. Update Environment Variables
Add to your `.env.local`:
```
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

### 3. Browser Requirements
- Modern browser with Web Speech API support (Chrome, Edge, Safari)
- Microphone access permission
- JavaScript enabled

## How It Works

### Step 1: Select Role
Choose the position you want to interview for from the 8 available roles.

### Step 2: Start Interview
The system generates 5 tailored questions for your selected role.

### Step 3: Answer Questions
- Click "Start Speaking" to begin recording
- Speak your answer naturally
- Click "Stop Speaking" when done
- Move to the next question

### Step 4: Get Analysis
After answering all questions, the AI analyzes your responses and provides:
- Overall performance score (0-100)
- Detailed metrics breakdown
- Key strengths identified
- Areas for improvement with specific tips
- Action items for future interviews
- Professional closing remarks

## API Endpoints

### `/api/interview/start` (POST)
Generates interview questions for a selected role.

**Request:**
```json
{
  "roleId": "software-engineer"
}
```

**Response:**
```json
{
  "success": true,
  "roleName": "Software Engineer",
  "questions": [...]
}
```

### `/api/interview/analyze` (POST)
Analyzes interview responses using Google Gemini.

**Request:**
```json
{
  "roleId": "software-engineer",
  "questions": [...],
  "responses": "user's transcribed responses",
  "currentQuestion": "the question being analyzed"
}
```

**Response:**
```json
{
  "overallScore": 78,
  "overallFeedback": "Strong technical knowledge with room for improvement in communication",
  "metrics": {
    "communication_clarity": 75,
    "technical_accuracy": 85,
    "confidence_level": 80,
    "completeness": 75,
    "articulation": 70
  },
  "strengths": [...],
  "improvements": [...],
  "actionItems": [...],
  "closingLine": "Great effort! Keep practicing..."
}
```

## Component Structure

### Components
- **`VoiceInterviewComponent`** - Main interview UI component
  - Role selection interface
  - Recording and transcription UI
  - Analysis display with metrics

### API Routes
- **`/api/interview/start`** - Question generation
- **`/api/interview/analyze`** - Response analysis with Gemini

## User Flow

```
Interview Hub
    ↓
Select Role → Start Interview → Answer Questions → Analyze Responses
    ↓
View Detailed Feedback → Take Another Interview or Back to Hub
```

## Troubleshooting

### Microphone Not Working
- Check browser microphone permissions
- Try a different browser
- Ensure microphone is connected and enabled

### Speech Recognition Not Starting
- Refresh the page
- Check browser console for errors
- Ensure you're using a modern browser

### Analysis Fails
- Verify GOOGLE_GEMINI_API_KEY is set in .env.local
- Check API quota and rate limits
- Ensure you have answered the question

## Future Enhancements
- Video recording and body language analysis
- Comparison with industry benchmarks
- Interview history and progress tracking
- Custom question creation
- Export reports as PDF
- Interview scheduling and reminders

## Best Practices
1. **Speak naturally** - Use conversational tone, not robotic speech
2. **Be specific** - Include examples and concrete details
3. **Stay focused** - Address the question directly
4. **Manage pacing** - Speak clearly and at a natural pace
5. **Practice multiple times** - Retake interviews to improve scores

## Technology Stack
- **Frontend**: Next.js, React, Web Speech API
- **Backend**: Next.js API Routes
- **AI**: Google Gemini Pro
- **UI**: Custom React components with Tailwind CSS
