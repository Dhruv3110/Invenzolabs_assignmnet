import React, { useState, useEffect } from 'react';
import { LegacyCard, Page, TextField, Button, Checkbox, Layout, TextContainer, TextStyle, Banner } from '@shopify/polaris';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
const ClarityIntegrationApp = () => {
    const [clarityID, setClarityID] = useState('');
    const [events, setEvents] = useState({
        viewCategory: false,
        viewItem: false,
        search: false,
        addToCart: false,
        beginCheckout: false,
        purchase: false,
    });
    const [pixelCode, setPixelCode] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const queryParams= new URLSearchParams(location.search);
    const shop = queryParams.get('shop');


    useEffect(() => {
        async function fetchData() {
            const response = await axios.get('http://localhost:5000/api/settings');
            setClarityID(response.data.clarityID || '');
            setEvents(response.data.events || events);
        }
        fetchData();
    }, []);

    // Handle input for the Clarity ID
    const handleClarityIDChange = (value) => setClarityID(value);

    // Toggle event tracking options
    const handleCheckboxChange = (key) => {
        setEvents({ ...events, [key]: !events[key] });
    };

    // Handle Pixel Generation and Save
    const handleGeneratePixel = async () => {
        setLoading(true);
        setStatus('');  // Clear any previous status messages
        setPixelCode('');
        if (!clarityID) {
          setStatus('Please enter a valid Clarity ID.');
          setLoading(false);
          return;
        }
        try {
            const response = await axios.post('http://localhost:5000/api/generate-pixel', { clarityID, events });
            console.log('Pixel code response:', response.data);
            setPixelCode(response.data.pixelCode);
            setStatus('Pixel code generated successfully!');
        } catch (error) {
            console.error(error);
            if (error.response) {
              // The request was made, and the server responded with a status code
              setStatus(`Failed to generate pixel code. Server responded with status: ${error.response.status}`);
          } else if (error.request) {
              // The request was made, but no response was received
              setStatus('Failed to generate pixel code. No response from server.');
          } else {
              // Something happened in setting up the request
              setStatus(`Failed to generate pixel code. Error: ${error.message}`);
          }
        }
        finally{
          setLoading(false);
        }
    };

    return (
      <Page>
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned>
              <TextContainer>
                <TextStyle variation="strong">Microsoft Clarity ID</TextStyle>
                <TextField
                  label="Clarity ID"
                  value={clarityID}
                  onChange={handleClarityIDChange}
                  helpText="Submit your Microsoft Clarity ID to start tracking events."
                  placeholder='Enter your Microsoft Clarity ID'
                />
                <Button primary onClick={handleGeneratePixel} loading={loading}>
                  Generate Pixel Code
                </Button>
              </TextContainer>
            </LegacyCard>
          </Layout.Section>

          <Layout.Section>
            <LegacyCard title="Event Options" sectioned>
              <div style={{ display: 'flex', gap: '10px', justifyContent:"space-between" }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap:"40px" }}>
                    <label>View Category</label>
                    <Checkbox
                      checked={events.viewCategory}
                      onChange={() => handleCheckboxChange('viewCategory')}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',gap:"40px" }}>
                    <label>View Item</label>
                    <Checkbox
                      checked={events.viewItem}
                      onChange={() => handleCheckboxChange('viewItem')}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',gap:"40px" }}>
                    <label>Search</label>
                    <Checkbox
                      checked={events.search}
                      onChange={() => handleCheckboxChange('search')}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',gap:"40px" }}>
                    <label>Add to Cart</label>
                    <Checkbox
                      checked={events.addToCart}
                      onChange={() => handleCheckboxChange('addToCart')}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',gap:"40px" }}>
                    <label>Begin Checkout</label>
                    <Checkbox
                      checked={events.beginCheckout}
                      onChange={() => handleCheckboxChange('beginCheckout')}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',gap:"40px" }}>
                    <label>Purchase</label>
                    <Checkbox
                      checked={events.purchase}
                      onChange={() => handleCheckboxChange('purchase')}
                    />
                  </div>
                </div>
              </div>
            </LegacyCard>
          </Layout.Section>

          <Layout.Section>
            <LegacyCard sectioned>
              <div style={{marginBottom:"10px"}}>
                <TextStyle variation="strong">Pixel Integration Status</TextStyle>
              </div>
              {pixelCode && (
                <TextContainer>
                  <TextStyle variation="strong">Generated Pixel Code</TextStyle>
                  <textarea 
                    readOnly 
                    value={pixelCode} 
                    rows={10}
                    style={{ width: "100%", fontFamily: "monospace", fontSize: "12px" }}
                  />
                  <Button onClick={() => navigator.clipboard.writeText(pixelCode)}>Copy Pixel Code</Button>
                </TextContainer>
              )}
              
              {status && <Banner status="success">{status}</Banner>}
            </LegacyCard>
          </Layout.Section>
        </Layout>
      </Page>
    );
};

export default ClarityIntegrationApp;
