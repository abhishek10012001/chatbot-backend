/**
 * Generates a bot response based on the user's message by matching keywords with predefined intents.
 * If multiple intents match, the highest priority response is returned.
 * If no match is found, a fallback response is randomly selected.
 *
 * @function getBotResponse
 * @param {string} userText - The user's input message.
 * @returns {string} The bot's response based on keyword matching and priority.
 *
 * @example
 * const response = getBotResponse("Can you automate outbound?");
 * console.log(response); // "I can help you in automating your outbound an All-In-One, AI-First Platform powered by AI Employees"
 */

export function getBotResponse (userText: string): string {

    const cleanedText = userText.toLowerCase().trim();

    const intents = [
        { keywords: ["automate", "outbound", "all-in-one", "ai-first platform"], response: "I can help you in automating your outbound an All-In-One, AI-First Platform powered by AI Employees", priority: 4 },
        { keywords: ["sales", "marketing", "customer-success"], response: "I can do help you in Sales, Marketing & Customer success", priority: 4 },
        { keywords: ["artisan"], response: "Artisan is a tech startup building future of software with AI emplooyees called Artisan", priority: 4 },
        { keywords: ["gtm ", "artisan", "outbound"], response: "Artisan is replacing, optimizing, and automating the entire GTM stack with AI and world-class software products", priority: 4 },
        { keywords: ["analytics", "artisan", "sales"], response: "Artisan AI employees can do sales and share the outbound analytics", priority: 3 },
        { keywords: [ "AI", "BDR", "Ava",], response: "Ava is the first Artisan. She is our AI BDR?", priority: 3 },
        { keywords: ["leads", "find"], response: "Yes, I can also find leads. I identifies leads that match your targeting criteria with her international B2B database that has over 300M contacts in over 200 countries.", priority: 3 },
        { keywords: ["leads", "researches"], response: "Yes, I can also researches leads. I scrapes the web and her database for relevant intent signals, such as fundraising announcements, Google searches, and hiring news.", priority: 3 },
        { keywords: [ "email", "write"], response: "Yes, I Ghostwrites Hyper-Personalized Emails.", priority: 3 },
        { keywords: ["schedule", "call", "meeting"], response: "I can help you schedule a call. What date and time do you prefer?", priority: 3 },
        { keywords: ["help", "support", "assist"], response: "Sure! I can help with FAQs, troubleshooting, or general inquiries.", priority: 2 },
        { keywords: ["hello", "hi", "hey"], response: "Hello! How can I assist you today?", priority: 1 },
        { keywords: ["bye", "goodbye"], response: "Goodbye! Feel free to reach out anytime.", priority: 1 },
        { keywords: ["thanks", "great"], response: "Thanks! Let me know in case I can help you.", priority: 1 },
        { keywords: ["weather"], response: "I can't provide live weather updates, but you can check Weather.com!", priority: 1 },
        { keywords: ["time"], response: `The current time is ${new Date().toLocaleTimeString()}.`, priority: 1 },
        { keywords: ["date"], response: `Today's date is ${new Date().toLocaleDateString()}.`, priority: 1 },
        { keywords: ["joke"], response: "Why did the scarecrow win an award? Because he was outstanding in his field!", priority: 1 }
    ];

    let matchedResponses = [];

    for (const intent of intents) {
        if (intent.keywords.some(keyword => cleanedText.includes(keyword))) {
            matchedResponses.push({ response: intent.response, priority: intent.priority });
        }
    }

    console.log(`matched response: ${JSON.stringify(matchedResponses)}`);

   
    if (matchedResponses.length > 0) {
        return matchedResponses.sort((a, b) => b.priority - a.priority)[0].response;
    }

    const fallbackResponses = [
        "I'm not sure I understand. Could you rephrase that?",
        "That's interesting! Tell me more.",
        "I don't have an answer for that yet, but I'm learning!",
        "Can you clarify your question? I'd love to help."
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
};
