import mongoose from 'mongoose'
import express, { json } from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import 'dotenv/config'
import Item from './models/Item.js';
import productItem from './models/product.js';

const app = express();
const PORT = process.env.PORT || 4000
const MONG_URL = process.env.MONGODB_URI

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors()); 
app.use(express.json());

// Serve the 'uploads' folder statically so images can be accessed via URL
// e.g., http://localhost:4000/uploads/my-image.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Multer Configuration (File Uploads) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure uploads directory exists
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp + original name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })
// -------------------------------------------

async function mongodb() {
    try {
        await mongoose.connect(MONG_URL)
        console.log('Mongoose connect successs')

        app.listen(PORT, () => {
            console.log(`🚀 Express server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
}

app.get('/',(req,res) => {
    res.send('database success connect')
});

// Determine Base URL for images
const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

// --- UPDATED PRODUCT POST ROUTE ---
// We use 'upload.single('image')' middleware to process the file
app.post('/api/product', upload.single('image'), async (req,res) => {
    try {
        const {name, price, available, description, category} = req.body;
        
        // If a file was uploaded, construct the URL
        let imageUrl = '';
        if (req.file) {
            // URL will be: https://your-app.onrender.com/uploads/filename.jpg
            imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        } else {
            // Fallback if they sent a text URL (optional)
            imageUrl = req.body.image || ''; 
        }

        const newProductItem = new productItem({
            name,
            price,
            available: available === 'true' || available === true, // FormData sends booleans as strings
            description,
            category,
            image: imageUrl
        });
        
        const saveProduct = await newProductItem.save();
        res.status(201).json(saveProduct);

    } catch (error) {
        console.error("Error saving item:", error.message);
        res.status(400).json({ 
            message: "Failed to create item.", 
            details: error.message 
        });
    }
});

app.get('/api/product', async (req,res) => {
    try {
         const getProduct =await productItem.find({});
         res.status(201).json(getProduct);
    } catch (error) {
          console.error("Error fetching items:", error.message);
        res.status(500).json({ 
            message: "Failed to retrieve items.", 
            details: error.message 
        });
    }
});

// --- UPDATE PRODUCT PUT ROUTE ---
app.put('/api/product/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, available, description, category } = req.body;

        let updateData = {
            name,
            price,
            description,
            category,
            available: available === 'true' || available === true
        };

        // If a new file is uploaded, update the image URL
        if (req.file) {
            updateData.image = `${baseUrl}/uploads/${req.file.filename}`;
        }

        const updatedProduct = await productItem.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error updating item:", error.message);
        if (error.name === 'CastError') {
             return res.status(400).json({ message: "Invalid Product ID format" });
        }
        res.status(400).json({ 
            message: "Failed to update item.", 
            details: error.message 
        });
    }
});

// --- DELETE PRODUCT ROUTE ---
app.delete('/api/product/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await productItem.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting item:", error.message);
        if (error.name === 'CastError') {
             return res.status(400).json({ message: "Invalid Product ID format" });
        }
        res.status(500).json({ 
            message: "Failed to delete item.", 
            details: error.message 
        });
    }
});

// Item routes (from previous implementation)
app.post('/api/items', async (req,res) => {
    try {
        const {name,quantity} = req.body;
        const newItem = new Item({ name, quantity : quantity || 0 });
        const saveItem = await newItem.save();
        res.status(201).json(saveItem);
    } catch (error) {
        res.status(400).json({ message: "Failed", details: error.message });
    }
});
app.get('/api/items',async (req,res) => {
   try {
        const items = await Item.find({}); 
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: "Failed", details: error.message });
    }
});

mongodb();
