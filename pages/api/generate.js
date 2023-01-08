const bufferToBase64 = (buffer) => {
  const base64 = buffer.toString('base64');
  return `data:image/png;base64,${base64}`;
};

const generateAction = async (req, res) => {
  console.log('Received request');

  // Go input from the body of the request
  const input = JSON.parse(req.body).input;

  // Add fetch request to Hugging Face
  const response = await fetch(
    `https://api-inference.huggingface.co/models/ParamSiddharth/sd-1-5-paramsid-lq`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_AUTH_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: input,
      }),
    }
  );

  // Check for different statuses to send proper payload
  if (response.ok) {
    const buffer = await response.buffer();
    // Convert to base64
    const base64 = bufferToBase64(buffer);
    // Make sure to change to base64
    res.status(200).json({ image: base64 });
  } else if (response.status === 503) {
    const json = await response.json();
    res.status(503).json(json);
  } else {
    const json = await response.json();
    res.status(response.status).json({ error: response.statusText });
  }
}

export default generateAction;