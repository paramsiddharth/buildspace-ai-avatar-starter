import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const sleep = ms => new Promise(res => setTimeout(res, ms));

const Home = () => {
  const maxRetries = 20;
  const [input, setInput] = useState('');
  const [img, setImg] = useState('');
  // Numbers of retries 
  const [retry, setRetry] = useState(0);
  // Number of retries left
  const [retryCount, setRetryCount] = useState(maxRetries);
  // Add isGenerating state
  const [isGenerating, setIsGenerating] = useState(false);
  // Add new state here
  const [finalPrompt, setFinalPrompt] = useState('');

  const onChange = e => setInput(e.target.value);

  const generateAction = async () => {
    console.log('Generating...');

    // Add this check to make sure there is no double click
    if (isGenerating && retry === 0) return;
  
    // Set loading has started
    setIsGenerating(true);

    // If this is a retry request, take away retryCount
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ input }),
    });
    
    const data = await response.json();

    if (response.status === 503) {
      // Set the estimated_time property in state
      setRetry(data.estimated_time);
      return;
    }

    // If another error, drop error
    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      return;
    }

    // Set final prompt here
    setFinalPrompt(input);
    setImg(data.image);
    // Everything is all done -- stop loading!
    setIsGenerating(false);
    // Remove content from input box
    setInput('');
    setImg(data.image);
    setIsGenerating(false);
  };

  // Add useEffect here
  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`);
        setRetryCount(maxRetries);
        return;
      }

      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);

  return (
    <div className="root">
      <Head>
        {/* <title>AI Avatar Generator | buildspace</title> */}
        <title>Param's Silly Avatar Generator | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Param's Silly Avatar Generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>Prompt Param to present his virtual self in varying formats!</h2>
          </div>
          <div className='prompt-container'>
            <input className='prompt-box' value={input} onChange={onChange} />
            <a
              className={
                isGenerating ? 'generate-button loading' : 'generate-button'
              }
              onClick={generateAction}
            >
              {/* Tweak to show a loading indicator */}
              <div className="generate">
                {isGenerating ? (
                  <span className="loader"></span>
                ) : (
                  <p>Generate</p>
                )}
              </div>
            </a>
          </div>
        </div>
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt={input} />
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>built with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
