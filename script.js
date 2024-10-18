const problemDescription = "Write a function that reverses a string.";
document.getElementById('problem-description').innerText = problemDescription;

document.getElementById('submit').addEventListener('click', async () => {
    const code = document.getElementById('code').value;
    const result = await evaluateCode(code);
    document.getElementById('output').innerText = result;
});



async function evaluateCode(code) {
    const apiKey = config.OPENAI_API_KEY; // Replace with your API key
    const prompt = `
    Here is a problem statement: ${problemDescription}
    Please check the following JavaScript code for correctness:
    ${code}
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}
