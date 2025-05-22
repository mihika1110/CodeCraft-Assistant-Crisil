const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
  try {
    const { appDetails } = req.body;

    // Prepare prompt
    const prompt = `Generate a complete business application based on these requirements: ${appDetails}

    Please provide:
    1. Frontend code (React)
    2. Backend code (Node.js/Express)
    3. Database schema
    4. Setup instructions
    5. Package.json files

    Format the response with clear sections for each file and include detailed setup instructions.`;

    // Call Hugging Face's inference API (free tier)
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 2048,
            temperature: 0.7,
            top_p: 0.95,
          }
        }),
      }
    );

    const generatedContent = await response.json();

    // Create downloads directory path
    const downloadsPath = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const appFolderName = `generated-app-${timestamp}`;
    const appPath = path.join(downloadsPath, appFolderName);

    // Create app directory
    fs.mkdirSync(appPath);

    // Save the generated content
    fs.writeFileSync(
      path.join(appPath, 'app-files.txt'),
      generatedContent.generated_text || generatedContent[0].generated_text,
      'utf8'
    );

    // Create instructions file
    const instructions = `
# Generated App Instructions
Generated on: ${new Date().toISOString()}

## Requirements Provided:
${appDetails}

## Setup Instructions:
1. Review the generated code in app-files.txt
2. Follow the implementation instructions provided in the generated content
3. Make sure to install all required dependencies
4. Test thoroughly before deployment

Note: This is an AI-generated application scaffold. Please review and modify the code according to your specific needs.
    `;

    fs.writeFileSync(
      path.join(appPath, 'instructions.txt'),
      instructions,
      'utf8'
    );

    res.json({
      success: true,
      message: 'App generated successfully',
      path: appPath
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});