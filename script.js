const problemDescription = "Write a function that reverses a string.";
document.getElementById('problem-description').innerText = problemDescription;

console.log(config.OPENAI_API_KEY); // Check if config is defined

let lastRequestTime = 0;
const initialRequestInterval = 5000; // Start with a 5-second delay
const maxRetries = 5;

document.getElementById('submit').addEventListener('click', async () => {
    const currentTime = Date.now();
    if (currentTime - lastRequestTime < initialRequestInterval) {
        console.error('Please wait before sending another request.');
        return;
    }
    lastRequestTime = currentTime;

    const code = document.getElementById('code').value;

    if (!config || !config.OPENAI_API_KEY) {
        console.error('API key is not defined.');
        document.getElementById('output').innerText = 'API key is not defined.';
        return;
    }

    const prompt = `
    Here is a problem statement: ${problemDescription}
    Please check the following JavaScript code for correctness:
    ${code}
    `;

    let retryCount = 0;
    let delay = initialRequestInterval;

    while (retryCount < maxRetries) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            console.log(`Attempt ${retryCount + 1} with delay ${delay} ms`);

            if (response.status === 429) {
                console.warn('Rate limit exceeded. Retrying...');
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
                delay *= 2; // Double the delay for exponential backoff
                continue; // Retry the request
            }

            const data = await response.json();

            if (response.ok) {
                document.getElementById('output').innerText = data.choices[0].message.content;
                break; // Exit loop on success
            } else {
                document.getElementById('output').innerText = `Error: ${data.error.message}`;
                break;
            }
        } catch (error) {
            console.error('Error fetching from OpenAI:', error);
            document.getElementById('output').innerText = 'An error occurred while communicating with the API.';
            break; // Exit loop on error
        }
    }

    if (retryCount >= maxRetries) {
        document.getElementById('output').innerText = 'Max retries reached. Please try again later.';
    }
});
