const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
// Use the MongoDB Atlas connection string
mongoose.connect('mongodb+srv://dhruvguptadg31:Abcde12345@cluster2.ljyb6.mongodb.net/', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Schema for storing Clarity ID and event options
const SettingSchema = new mongoose.Schema({
    clarityID: String,
    events: {
        viewCategory: Boolean,
        viewItem: Boolean,
        search: Boolean,
        addToCart: Boolean,
        beginCheckout: Boolean,
        purchase: Boolean
    }
});

const Setting = mongoose.model('Setting', SettingSchema);

const app = express();
app.use(bodyParser.json());
app.use(cors());
/**
 * Fetch current Clarity settings
 */
app.get('/api/settings', async (req, res) => {
    const settings = await Setting.findOne({});
    if (settings) {
        res.json(settings);
    } else {
        res.json({ clarityID: '', events: {} });
    }
});

/**
 * Generate Pixel Code
 */
app.post('/api/generate-pixel', async (req, res) => {
    try {
        const { clarityID, events } = req.body;
        console.log('Incoming request body:', req.body);

        
        console.log('Received clarityID:', clarityID);
        console.log('Received events:', events);

        // Validate input
        if (!clarityID || !events) {
            return res.status(400).json({ message: 'Clarity ID and events are required.' });
        }

        // Save Clarity ID and events to the database
        const updateResult = await Setting.updateOne({}, { clarityID, events }, { upsert: true });
        console.log('Update result:', updateResult);

        // Generate pixel code based on selected events
        const pixelCode = generatePixelCode(clarityID, events);

        res.json({ pixelCode });
    } catch (error) {
        console.error('Error generating pixel code:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



/*
 Helper function to generate the custom pixel code
*/

function generatePixelCode(clarityID, events) {
    let eventScript = `
        (function(c,l,a,r,i,t,y){
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
            t=l.createElement(r);
            t.async=1;
            t.src="https://www.clarity.ms/tag/${clarityID}";
            y=l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script");
    `;

    if (events.search) {
        eventScript += `
            clarity('track', 'search');
        `;
    }

    if (events.viewCategory) {
        eventScript += `
            clarity('track', 'view_category');
        `;
    }
    if (events.viewItem) {
        eventScript += `
            clarity('track', 'view_item');
        `;
    }

    if (events.addToCart) {
        eventScript += `
            clarity('track', 'add_to_cart');
        `;
    }

    if (events.purchase) {
        eventScript += `
            clarity('track', 'purchase');
        `;
    }

    if (events.beginCheckout) {
        eventScript += `
            clarity('track', 'begin_checkout');
        `;
    }
    console.log('Event script generated:', eventScript);

    return eventScript;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
