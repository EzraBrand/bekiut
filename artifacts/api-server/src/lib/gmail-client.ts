// Gmail integration for sending chatbot usage notifications
// Uses Replit's Google Mail connector

import { google } from 'googleapis';
import { admitChatAlert } from "./chat-quota";
import { logger } from "./logger";

let connectionSettings: any;

// RFC 2047 encoded-words: each stays under 75 characters, without splitting
// a UTF-8 character. Fold with CRLF + space for long Hebrew/Unicode subjects.
function encodeSubject(subject: string): string {
  const chunks: string[] = [];
  let chunk = "";
  for (const character of subject.replace(/[\r\n]/g, " ")) {
    if (Buffer.byteLength(chunk + character, "utf8") > 42) {
      chunks.push(chunk);
      chunk = "";
    }
    chunk += character;
  }
  if (chunk) chunks.push(chunk);
  return chunks.map(text => `=?UTF-8?B?${Buffer.from(text, "utf8").toString("base64")}?=`).join("\r\n ");
}

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then((data: any) => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

interface ChatbotAlertParams {
  userQuestion: string;
  aiResponse: string;
  fullPrompt: string;
  talmudRange: string;
  tractate: string;
  page: string;
  timestamp: Date;
}

export async function sendChatbotAlert(params: ChatbotAlertParams): Promise<void> {
  try {
    if (!process.env.CHATBOT_ALERT_EMAIL || !await admitChatAlert()) return;
    const gmail = await getUncachableGmailClient();
    
    // Get recipient email from environment variable
    const recipientEmail = process.env.CHATBOT_ALERT_EMAIL;
    
    if (!recipientEmail) {
      console.log('CHATBOT_ALERT_EMAIL not set, skipping email notification');
      return;
    }
    
    const subject = `Bekiut Chatbot Query: ${params.talmudRange.replace(/[\r\n]/g, " ").slice(0, 160)}`;
    const body = `
A user has queried the Bekiut chatbot!

📅 Time: ${params.timestamp.toLocaleString('en-US', { timeZone: 'America/New_York' })} ET

📖 Talmud Passage: ${params.talmudRange}
   Tractate: ${params.tractate}
   Page: ${params.page}

💬 User's Question:
${params.userQuestion}

🤖 AI Response:
${params.aiResponse}

📝 Full Prompt Sent to AI:
${params.fullPrompt}

---
This is an automated notification from Bekiut's Sugya Viewer.
    `.trim();

    // Create the email in RFC 2822 format with proper headers
    const email = [
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      'MIME-Version: 1.0',
      `To: ${recipientEmail}`,
      `Subject: ${encodeSubject(subject)}`,
      '',
      Buffer.from(body, "utf8").toString("base64").match(/.{1,76}/g)!.join("\r\n")
    ].join('\r\n');

    // Encode as base64url
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    });

    logger.info('Chatbot alert email sent successfully');
  } catch (error) {
    logger.error({ err: error }, 'Failed to send chatbot alert email');
    // Don't throw - we don't want email failures to break the chatbot
  }
}
