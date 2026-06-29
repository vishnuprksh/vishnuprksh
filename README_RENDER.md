# Render Migration & Setup Guide

This project has been migrated from Firebase to run on Render. Follow the guide below to run the project locally and deploy it.

## 🚀 Running Locally

1. Make sure you have **Node.js (v20 or higher)** installed.
2. In the project root, install the dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
5. You can test form submissions locally; they will be routed to the live Google Apps Script endpoint.

---

## ☁️ Deploying to Render

You can deploy this repository to Render in one of two ways. We provide a `render.yaml` Blueprint file to automate the configuration.

### Option A: Single Web Service (Recommended & Simplest)

In this mode, a single Render Web Service hosts both your HTML pages and your backend `/api/contact` endpoint. This has the advantage of **no CORS configurations** and **no setup issues**, but runs on a free instance that spins down after 15 minutes of inactivity (taking up to 50 seconds to respond on the first load).

**To deploy Option A:**
1. Connect your GitHub repository to Render.
2. Go to **New > Blueprint** in the Render dashboard.
3. Select this repository and click **Apply**.
4. Render will automatically provision the `resume-fullstack` service as defined in `render.yaml`.
5. Once deployed, you will get a URL like `https://resume-fullstack.onrender.com`.

---

### Option B: Split Static Site (Frontend) + Web Service (Backend)

In this mode, you split your deployment:
- The frontend files are hosted as a **Render Static Site**. This is fast, backed by a global CDN, and **never spins down**.
- The contact form API is hosted as a **Render Web Service**. This service spins down, meaning submitting the form may have a 30-50 second delay if the API has been idle, but the main site loads instantly.

**To deploy Option B:**
1. In `render.yaml`, uncomment the sections under **Option B** (and comment out the **Option A** block if desired).
2. Connect your repo as a Render Blueprint. It will build:
   - A static site named `resume-frontend`.
   - A Node backend service named `resume-backend-api`.
3. After deployment, copy the URL of your Web Service API (e.g., `https://resume-backend-api.onrender.com`).
4. To link the frontend to the backend, define the backend URL in your `index.html` or `blog.html` right before the closing `</body>` tag:
   ```html
   <script>
     window.CONTACT_API_URL = "https://resume-backend-api.onrender.com";
   </script>
   ```
5. Commit and push the changes. Render will rebuild and serve your frontend static site pointing to the remote backend API.
