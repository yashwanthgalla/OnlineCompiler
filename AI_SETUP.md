# AI-Powered Error Analysis Integration

## Overview
This Online Compiler now includes AI-powered error analysis using NVIDIA's API to help users understand and fix coding mistakes. When errors occur, the AI provides:
- Clear explanations of what went wrong
- Step-by-step suggestions to fix the error
- Corrected code snippets (when applicable)
- Related learning resources

## Features

### Error Type Detection
The system analyzes three types of errors:
1. **Compilation Errors** - Syntax and compilation issues
2. **Runtime Errors** - Crashes and exceptions during execution
3. **Wrong Output** - Logic errors where output doesn't match expected results

### AI Feedback Panel
Located in a dedicated tab in the console:
- **What Happened** - Plain English explanation of the error
- **How to Fix It** - Numbered suggestions with actionable steps
- **Corrected Code Snippet** - Example fix (when available)
- **Learn More** - Related concepts and resources

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

No additional packages needed - NVIDIA API uses standard HTTP requests.

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NVIDIA_API_KEY=your_nvidia_api_key_here
```

**How to get your API key:**
1. Visit [NVIDIA API Hub](https://integrate.api.nvidia.com/)
2. Sign up or log in with your NVIDIA account
3. Navigate to API keys section
4. Create a new key for "NIM OpenAI-compatible API"
5. Copy the key and add it to `.env.local`

### 3. Configure Vercel Deployment (if using Vercel)

If deploying to Vercel:
1. Go to your project settings → Environment Variables
2. Add `NVIDIA_API_KEY` with your API key value
3. Redeploy the project

### 4. Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev:all

# Or start separately:
# Terminal 1:
npm run server

# Terminal 2:
npm run dev
```

## API Endpoint

### POST `/api/ai-analysis`

Analyzes code errors and returns AI-powered suggestions.

**Request Body:**
```json
{
  "code": "string",                    // The user's code
  "language": "string",                // Programming language (cpp, python, etc)
  "error": "string",                   // Error message
  "errorType": "compilation|runtime|wrong-output",  // Type of error
  "expectedOutput": "string",          // (optional) For wrong-output errors
  "actualOutput": "string"             // (optional) For wrong-output errors
}
```

**Response:**
```json
{
  "explanation": "string",             // What went wrong
  "suggestions": ["string"],           // Array of fix suggestions
  "correctedCode": "string",           // (optional) Fixed code
  "resources": ["string"]              // Related learning topics
}
```

**Error Response:**
```json
{
  "error": "string",
  "details": "string"
}
```

## How It Works

1. **Error Detection**: When code compilation fails or produces wrong output, the system captures the error
2. **AI Request**: The error details are sent to the NVIDIA API with context about the code
3. **Analysis**: NVIDIA's AI model (gpt-oss-120b) analyzes the error and generates suggestions
4. **Display**: Feedback is shown in the "AI Feedback" tab in the console panel
5. **User Learning**: Users can expand sections to learn more about their mistakes

## Security Considerations

⚠️ **IMPORTANT**: 
- Never commit your API key to version control
- Use environment variables for all secrets
- Keep `.env.local` in `.gitignore`
- If you accidentally expose your key, rotate it immediately in the NVIDIA dashboard

## Troubleshooting

### "NVIDIA_API_KEY is not configured"
- Ensure `.env.local` exists in the root directory
- Verify the `NVIDIA_API_KEY` variable is set correctly
- For Vercel, check Environment Variables in project settings

### "Failed to analyze error"
- Check your API key is valid (not expired)
- Ensure you have API quota remaining
- Check internet connectivity
- Review server logs for detailed error messages

### AI Feedback tab is disabled
- Errors must occur first for the feedback tab to activate
- Run or submit code to trigger error analysis
- Check browser console for API errors

### Response time is slow
- First-time API calls may take longer (~5-10 seconds)
- Subsequent requests are usually faster
- Large code submissions may increase processing time

## API Rate Limiting

NVIDIA API has rate limits depending on your plan:
- **Free Tier**: Limited requests per day
- **Paid Tier**: Higher limits

If you hit rate limits, you'll see an error. Wait before trying again.

## Supported Languages

The AI analysis works with all supported programming languages:
- C, C++, Python, Java, JavaScript, TypeScript
- Go, Rust, Ruby, PHP, Kotlin, Swift
- Perl, R, Scala, C#

## Performance Notes

- **Compilation Errors**: 2-5 seconds for analysis
- **Runtime Errors**: 3-8 seconds for analysis
- **Wrong Output**: 5-10 seconds for analysis

Times vary based on code length and API load.

## Future Enhancements

Potential improvements to the AI integration:
- Performance optimizations (caching, batch requests)
- Multi-language explanations
- Interactive code fixing suggestions
- Video tutorials linked to errors
- Personalized learning paths based on error patterns

## Support

For issues with:
- **NVIDIA API**: Visit [NVIDIA API Hub docs](https://build.nvidia.com/)
- **This integration**: Check GitHub issues or contact support

## License

This feature is part of the Online Compiler project. See LICENSE file for details.
