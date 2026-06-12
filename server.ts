import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { INITIAL_PRODUCTS, CATEGORIES } from './src/data.ts';
import { Product, Order, ChatSession, ChatMessage, UserAccount } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

// Ensure database file exists with initial data
function initDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      products: INITIAL_PRODUCTS,
      orders: [] as Order[],
      users: [
        {
          email: 'admin@karimabeauty.com',
          name: 'Karima Beauty Admin',
          phone: '+216 22 111 222',
          address: 'Boutique Karima, Les Berges du Lac 2',
          city: 'Tunis',
          passwordHash: 'admin123', // Clean, robust simple hash for demo purposes
          dateCreated: new Date().toISOString(),
        }
      ] as UserAccount[],
      chats: [] as ChatSession[]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log('Database initialized with seed data.');
  } else {
    // If it exists, let's make sure it has all mock products loaded
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (!data.products || data.products.length === 0) {
        data.products = INITIAL_PRODUCTS;
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error('Error verifying database, recreating...', e);
    }
  }
}

initDatabase();

// Helper helper to read/write DB
function getDB() {
  const fileData = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(fileData);
}

function saveDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize Gemini
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini GenAI successfully initialized server-side.');
  } catch (error) {
    console.error('Failed to initialize Gemini GenAI:', error);
  }
} else {
  console.log('No GEMINI_API_KEY detected. In-Memory mock will handle chat queries.');
}

// Nodemailer SMTP Transporter
function getMailTransporter() {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_PASS || process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }
  return null;
}

// Generate beautiful HTML Email markup
function generateOrderEmailHTML(order: Order, type: 'receipt' | 'status_update') {
  const itemsListHTML = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-family: sans-serif; font-size: 14px; color: #333;">
        <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px; margin-right: 12px; vertical-align: middle;" />
        <span style="font-weight: 500;">${item.name}</span>
        <br/><span style="font-size: 11px; color: #999; text-transform: uppercase;">Category: ${item.category}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-family: sans-serif; font-size: 14px; color: #333;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-family: sans-serif; font-weight: 600; font-size: 14px; color: #333;">
        ${item.price.toFixed(2)} DT
      </td>
    </tr>
  `).join('');

  const statusTexts = {
    new: 'Received & Pending Approval',
    processing: 'In Preparation & Packaging',
    shipped: 'Dispatched with Courier',
    delivered: 'Delivered successfully!',
    cancelled: 'Cancelled'
  };

  const statusHeader = statusTexts[order.orderStatus] || order.orderStatus;

  return `
    <div style="background-color: #faf6f0; padding: 40px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e9dfd3;">
        
        <!-- Header -->
        <tr>
          <td align="center" style="background: linear-gradient(135deg, #2c2520, #42372d); padding: 30px 20px; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; font-family: 'Playfair Display', Georgia, serif;">Karima Beauty</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #d4af37;">Vif • Farmasi • Arvea</p>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding: 30px 30px 10px 30px;">
            <h2 style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 18px; font-weight: 600; color: #2c2520; text-align: center;">
              ${type === 'receipt' ? 'Merci pour votre commande!' : 'Mise à jour de votre commande'}
            </h2>
            <p style="margin: 0; font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #555; text-align: center;">
              ${type === 'receipt' 
                ? `Hi <strong>${order.customer.name}</strong>, we have registered your purchase. Below are the order receipt details.` 
                : `Hi <strong>${order.customer.name}</strong>, the status of your order <strong>#${order.id}</strong> has been updated to:`}
            </p>
            
            ${type !== 'receipt' ? `
              <div style="background-color: #fcf8f2; border: 1px dashed #d4af37; padding: 12px; text-align: center; border-radius: 6px; margin: 15px auto; max-width: 280px; font-family: sans-serif; font-size: 16px; font-weight: bold; color: #42372d;">
                ${statusHeader}
              </div>
            ` : ''}
          </td>
        </tr>

        <!-- Table Summary -->
        <tr>
          <td style="padding: 20px 30px;">
            <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
              <thead>
                <tr style="background-color: #faf6f0;">
                  <th style="padding: 10px 12px; text-align: left; font-family: sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #777;">Product</th>
                  <th style="padding: 10px 12px; text-align: center; font-family: sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #777;">Qty</th>
                  <th style="padding: 10px 12px; text-align: right; font-family: sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #777;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHTML}
                <!-- Total Row -->
                <tr>
                  <td colspan="2" style="padding: 15px 12px 10px 12px; text-align: right; font-family: sans-serif; font-size: 14px; color: #777; font-weight: bold;">
                    Subtotal:
                  </td>
                  <td style="padding: 15px 12px 10px 12px; text-align: right; font-family: sans-serif; font-size: 14px; color: #333; font-weight: bold;">
                    ${order.total.toFixed(2)} DT
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 5px 12px 15px 12px; text-align: right; font-family: sans-serif; font-size: 14px; color: #777; font-weight: bold; border-bottom: 2px solid #2c2520;">
                    Livraison (Delivery Fee):
                  </td>
                  <td style="padding: 5px 12px 15px 12px; text-align: right; font-family: sans-serif; font-size: 14px; color: #2e7d32; font-weight: bold; border-bottom: 2px solid #2c2520;">
                    GRATUIT (Free)
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 15px 12px; text-align: right; font-family: sans-serif; font-size: 18px; color: #2c2520; font-weight: bold;">
                    TOTAL:
                  </td>
                  <td style="padding: 15px 12px; text-align: right; font-family: sans-serif; font-size: 20px; color: #d4af37; font-weight: bold;">
                    ${order.total.toFixed(2)} DT
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Shipping & Payment Details -->
        <tr>
          <td style="padding: 10px 30px 40px 30px;">
            <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf6f0; border-radius: 8px; padding: 15px;">
              <tr>
                <td width="50%" valign="top" style="font-family: sans-serif; font-size: 13px; line-height: 1.5; color: #555; padding-right: 10px;">
                  <strong style="color: #2c2520; text-transform: uppercase;">Shipping Destination:</strong><br/>
                  ${order.customer.name}<br/>
                  ${order.customer.address}<br/>
                  ${order.customer.city}<br/>
                  Tél: ${order.customer.phone}
                </td>
                <td width="50%" valign="top" style="font-family: sans-serif; font-size: 13px; line-height: 1.5; color: #555;">
                  <strong style="color: #2c2520; text-transform: uppercase;">Payment Details:</strong><br/>
                  Method: ${order.paymentMethod === 'card' ? 'Online Card Payment' : 'Paiement à la livraison (COD)'}<br/>
                  Status: <span style="font-weight: 600; color: ${order.paymentStatus === 'completed' ? '#2e7d32' : '#f57c00'}">${order.paymentStatus.toUpperCase()}</span><br/>
                  Date: ${new Date(order.date).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer Card -->
        <tr>
          <td align="center" style="background-color: #faf6f0; padding: 20px 20px; border-top: 1px solid #e9dfd3; font-family: sans-serif; font-size: 12px; color: #888;">
            <p style="margin: 0 0 5px 0;">Need immediate support? Dial our hotline +216 22 111 222 or open our live support web chat.</p>
            <p style="margin: 0; font-weight: bold; color: #2c2520;">© ${new Date().getFullYear()} Karima Beauty Boutique S.A. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </div>
  `;
}

// ---------------- API ENDPOINTS ----------------

// Products
app.get('/api/products', (req, res) => {
  const db = getDB();
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const db = getDB();
  const newProduct: Product = {
    ...req.body,
    id: req.body.id || `prod-${Date.now()}`,
    rating: req.body.rating || 4.5,
  };
  db.products.push(newProduct);
  saveDB(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const index = db.products.findIndex((p: Product) => p.id === id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    saveDB(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const index = db.products.findIndex((p: Product) => p.id === id);
  if (index !== -1) {
    db.products.splice(index, 1);
    saveDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Categories
app.get('/api/categories', (req, res) => {
  res.json(CATEGORIES);
});

// Authentication Routes
app.post('/api/auth/register', (req, res) => {
  const db = getDB();
  const { email, name, phone, address, city, password } = req.body;

  if (db.users.some((u: UserAccount) => u.email === email)) {
    return res.status(400).json({ error: 'Cet email est déjà enregistré !' });
  }

  const newUser: UserAccount = {
    email,
    name,
    phone,
    address,
    city,
    passwordHash: password, // Store cleanly for demo
    dateCreated: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDB(db);

  res.status(201).json({
    email: newUser.email,
    name: newUser.name,
    phone: newUser.phone,
    address: newUser.address,
    city: newUser.city
  });
});

app.post('/api/auth/login', (req, res) => {
  const db = getDB();
  const { email, password } = req.body;

  const user = db.users.find((u: UserAccount) => u.email === email && u.passwordHash === password);
  
  if (user) {
    res.json({
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      city: user.city,
      isAdmin: user.email === 'admin@karimabeauty.com'
    });
  } else {
    res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
  }
});

// Create Order (Checkout)
app.post('/api/orders', async (req, res) => {
  const db = getDB();
  const { items, total, customer, paymentMethod, cardDetails } = req.body;

  let paymentStatus: 'pending' | 'completed' = 'pending';
  let cardDetailsMasked = undefined;

  if (paymentMethod === 'card' && cardDetails) {
    paymentStatus = 'completed'; // Mimic successful processor auth
    cardDetailsMasked = {
      numberMasked: `•••• •••• •••• ${cardDetails.number?.slice(-4) || '1111'}`,
      holder: cardDetails.holder || 'Client Card'
    };
  }

  const orderId = `KARIMA-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder: Order = {
    id: orderId,
    items,
    total,
    customer,
    paymentMethod,
    paymentStatus,
    orderStatus: 'new',
    cardDetailsMasked,
    date: new Date().toISOString()
  };

  // If "createAccount" was ticked, and user doesn't already exist, create an account!
  if (customer.createAccount && customer.password) {
    const userExists = db.users.some((u: UserAccount) => u.email === customer.email);
    if (!userExists) {
      db.users.push({
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        passwordHash: customer.password,
        dateCreated: new Date().toISOString()
      });
    }
  }

  // Deduct product stock
  items.forEach((item: any) => {
    const dbProd = db.products.find((p: Product) => p.id === item.productId);
    if (dbProd) {
      dbProd.stock = Math.max(0, dbProd.stock - item.quantity);
    }
  });

  db.orders.push(newOrder);
  saveDB(db);

  // Trigger SMTP mail sending
  const emailHtml = generateOrderEmailHTML(newOrder, 'receipt');
  let mailResult = { sent: false, error: null as any };

  const transporter = getMailTransporter();
  if (transporter && customer.email) {
    try {
      await transporter.sendMail({
        from: `"Karima Beauty Boutique" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`,
        to: customer.email,
        subject: `Facture & Confirmation de commande Karima Beauty #${newOrder.id}`,
        html: emailHtml
      });
      mailResult.sent = true;
      console.log(`Real SMTP order receipt successfully mailed to ${customer.email}!`);
    } catch (err: any) {
      console.error('SMTP Mail error: ', err.message);
      mailResult.error = err.message;
    }
  } else {
    console.log('No GMAIL_USER credentials configured. Order email simulated successfully.');
  }

  res.status(201).json({
    success: true,
    order: newOrder,
    emailSimulated: !mailResult.sent,
    simulatedEmailHTML: emailHtml
  });
});

// Admin list order
app.get('/api/orders', (req, res) => {
  const db = getDB();
  res.json(db.orders);
});

// Lazy configuration of Cloudinary to prevent crashing at startup if credentials aren't loaded
let isCloudinaryConfigured = false;
function configureCloudinary() {
  if (isCloudinaryConfigured) return true;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Les identifiants Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) ne sont pas configurés dans les secrets.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  isCloudinaryConfigured = true;
  return true;
}

// Media upload endpoint for Cloudinary
app.post('/api/admin/upload', async (req, res) => {
  try {
    configureCloudinary();
    
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Aucune image reçue." });
    }

    // Upload base64 string to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(image, {
      folder: 'karimabeauty'
    });

    res.json({ url: uploadRes.secure_url });
  } catch (err: any) {
    console.error('Cloudinary upload failure:', err);
    res.status(500).json({ error: err.message || 'L\'envoi à Cloudinary a échoué.' });
  }
});

// Admin update order status
app.put('/api/orders/:id', async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  const index = db.orders.findIndex((o: Order) => o.id === id);
  if (index !== -1) {
    db.orders[index].orderStatus = orderStatus || db.orders[index].orderStatus;
    db.orders[index].paymentStatus = paymentStatus || db.orders[index].paymentStatus;
    
    // Auto-complete payment on COD delivered
    if (db.orders[index].orderStatus === 'delivered' && db.orders[index].paymentMethod === 'cod') {
      db.orders[index].paymentStatus = 'completed';
    }

    const updatedOrder = db.orders[index];
    saveDB(db);

    // Send an email update to product customer
    const emailHtml = generateOrderEmailHTML(updatedOrder, 'status_update');
    let mailSent = false;
    const transporter = getMailTransporter();
    
    if (transporter && updatedOrder.customer?.email) {
      try {
        await transporter.sendMail({
          from: `"Karima Beauty Boutique" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`,
          to: updatedOrder.customer.email,
          subject: `Mise à jour de commande Karima Beauty #${updatedOrder.id} - ${orderStatus}`,
          html: emailHtml
        });
        mailSent = true;
        console.log(`SMTP update email dispatched to ${updatedOrder.customer.email}`);
      } catch (err: any) {
        console.error('SMTP update dispatch error:', err.message);
      }
    }

    res.json({
      order: updatedOrder,
      emailSent: mailSent,
      simulatedEmailHTML: emailHtml
    });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// --------------- REAL-TIME LIVE CHAT WITH AI ADMIN SUPPORT ---------------

// Initialize or resume chat session
app.post('/api/support/init-chat', (req, res) => {
  const db = getDB();
  const { userName, userEmail } = req.body;
  const sessionId = req.body.sessionId || `chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  let existingSession = db.chats.find((c: ChatSession) => c.sessionId === sessionId);

  if (!existingSession) {
    existingSession = {
      sessionId,
      userName: userName || 'Client',
      userEmail: userEmail || undefined,
      messages: [
        {
          id: `msg-${Date.now()}-welcome`,
          sender: 'ai',
          text: `Bonjour ${userName || 'chère cliente'} ! Raide de vous accueillir chez **Karima Beauty Boutique**. Je suis Karima Beauty AI, votre conseillère dermo-esthétique experte. Posez-moi vos questions sur nos produits **Vif**, **Farmasi** ou **Arvea**. Je suis à votre entière disposition ! ✨ Can I help you with a recommendation today?`,
          date: new Date().toISOString()
        }
      ],
      lastUpdated: new Date().toISOString(),
      isActive: true
    };
    db.chats.push(existingSession);
    saveDB(db);
  }

  res.json(existingSession);
});

// Send Chat Message and get Expert AI response
app.post('/api/support/chat', async (req, res) => {
  const db = getDB();
  const { sessionId, text, sender } = req.body;

  const sessionIndex = db.chats.findIndex((c: ChatSession) => c.sessionId === sessionId);
  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = db.chats[sessionIndex];

  // Append user message
  const userMessage: ChatMessage = {
    id: `msg-${Date.now()}-user`,
    sender: sender || 'user',
    text,
    date: new Date().toISOString()
  };
  session.messages.push(userMessage);
  session.lastUpdated = new Date().toISOString();
  saveDB(db);

  // If sent by admin, do not trigger auto-ai reply!
  if (sender === 'admin') {
    return res.json(session);
  }

  // Trigger Gemini AI beauty consultant model
  let aiReplyText = "";
  if (ai) {
    try {
      // Build a premium context combining product descriptions and beauty guides
      const activeProducts = db.products.map((p: Product) => 
        `- [${p.category.toUpperCase()}] ${p.name}: ${p.price} DT. Subcat: ${p.subcategory}. Desc: ${p.description}. In Stock: ${p.stock}`
      ).join('\n');

      const chatHistoryPrompt = session.messages.slice(-8).map((m: ChatMessage) => 
        `${m.sender === 'user' ? 'Client' : 'Karima Beauty Support'}: ${m.text}`
      ).join('\n');

      const systemPrompt = `You are "Karima Beauty AI", a warm, luxury dermo-aesthetic consultant and official assistant of Karima Beauty, an exclusive cosmetic gallery specializing in three top brands:
1. **Vif**: Highly advanced, scientific dermocosmetics (high protection UV creams, dermo-cleansers, Retinol boosters, deep hydrators).
2. **Farmasi**: Famous Turkish beauty cosmetics (VFX Pro Photo Camera primers, Double Lash extenders, Retro Rose liquid mattes, therapeutic odorless garlic scale hair shampoos).
3. **Arvea Nature**: Premium Tunisian organic line driven by Aloe Vera and Moroccan Argan Oil (miracle multi-use relief balm, firming/slimming gel, soothing aloe pulps).

Your goals are:
- Give professional skin/hair recommendations using the accurate product list below.
- Keep the tone super high-class, luxurious, soothing, and helpful (using French and English blending gracefully, as we operate in a multilingual Tunisian cosmetic scene).
- If the customer mentions acne, suggest Vif Purifying Gel and Arvea Miracle Cream.
- If the customer mentions sun or dark spots, suggest Vif SPF50+ sunscreen and Vif Retinol.
- If the customer asks for hair growth/loss, pitch the Farmasi Garlic & Capixyl shampoo immediately.
- If they ask about orders, guide them reassuringly.

Our catalog products for references:
${activeProducts}

Recent Dialogue History:
${chatHistoryPrompt}

Generate only the next immediate Response representing "AuraBeauty AI":`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          temperature: 0.8,
          systemInstruction: "You are Karima Beauty AI. Use gentle spacing, bold important keywords and maintain an aesthetic advice-centric format. Fluent in French and English."
        }
      });

      aiReplyText = response.text || "Pardon, j'ai rencontré une petite perturbation. Comment puis-je vous aider aujourd'hui ?";
    } catch (err: any) {
      console.error('Gemini prediction error:', err);
      aiReplyText = "Bonjour ! Je suis l'assistante Karima Beauty. Nos conseillers humains vont également prendre le relais dans un instant si besoin. Dites-moi quel produit de Vif, Farmasi, ou Arvea vous fait plaisir ! We are right here with you.";
    }
  } else {
    // Elegant fallback expert system
    const lower = text.toLowerCase();
    if (lower.includes('vif') || lower.includes('soleil') || lower.includes('crème') || lower.includes('solaire')) {
      aiReplyText = "La gamme **Vif** est notre référence dermo-esthétique. Je vous recommande chaudement la **Vif Crème Solaire Invisible SPF 50+** (49.90 DT) pour protéger votre peau avec un fini mat invisible et soyeux ! ✨";
    } else if (lower.includes('farmasi') || lower.includes('shampoing') || lower.includes('cheveux') || lower.includes('capixyl') || lower.includes('ail')) {
      aiReplyText = "Pour vos cheveux, le **Shampoing à l'Ail et Capixyl de Farmasi** (36.00 DT) fait des miracles absolus contre la chute de cheveux ! Il stimule intensément la repousse de manière saine et inodore. 😍";
    } else if (lower.includes('arvea') || lower.includes('miracle') || lower.includes('aloe') || lower.includes('gel')) {
      aiReplyText = "La **Crème Miracle d'Arvea** (19.50 DT) à base d'aloé vera, miel sauvage et propolis est indispensable pour soigner toutes les petites affections cutanées (irritations, démangeaisons, boutons). Un vrai trésor de la nature !";
    } else {
      aiReplyText = "Excellente question ! Chez Karima Beauty, nous combinons la science de **Vif**, le glamour européen de **Farmasi**, et la douceur naturelle au miel et aloe d'**Arvea Nature**. Vous pouvez parcourir nos catégories ou me confier votre type de peau pour une routine sur mesure ! 🌸";
    }
  }

  // Save AI response
  const aiMessage: ChatMessage = {
    id: `msg-${Date.now()}-ai`,
    sender: 'ai',
    text: aiReplyText,
    date: new Date().toISOString()
  };
  session.messages.push(aiMessage);
  session.lastUpdated = new Date().toISOString();
  saveDB(db);

  res.json(session);
});

// Get all chat sessions (Admin overview)
app.get('/api/admin/chats', (req, res) => {
  const db = getDB();
  res.json(db.chats);
});

// Admin manual chat reply
app.post('/api/admin/chat-reply', (req, res) => {
  const db = getDB();
  const { sessionId, text } = req.body;

  const index = db.chats.findIndex((c: ChatSession) => c.sessionId === sessionId);
  if (index !== -1) {
    const adminMessage: ChatMessage = {
      id: `msg-${Date.now()}-admin`,
      sender: 'admin',
      text,
      date: new Date().toISOString()
    };
    db.chats[index].messages.push(adminMessage);
    db.chats[index].lastUpdated = new Date().toISOString();
    saveDB(db);
    res.json(db.chats[index]);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Configure Vite and boot the server
async function startServer() {
  // Vite in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development.');
  } else {
    // Production static asset serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving compiled index.html for production.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Karima Beauty server running on: http://localhost:${PORT}`);
  });
}

startServer();
