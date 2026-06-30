const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse URL-encoded and JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Front-matter parsing helper (extracts title, date, etc.)
function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { attributes: {}, body: content };
  const yaml = match[1];
  const body = match[2];
  const attributes = {};
  yaml.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim();
      attributes[key] = val.replace(/^['"]|['"]$/g, '');
    }
  });
  return { attributes, body };
}

// Read and parse all local markdown blog posts
function getBlogPosts() {
  const blogDir = path.join(__dirname, 'blog');
  if (!fs.existsSync(blogDir)) return [];
  
  const files = fs.readdirSync(blogDir);
  const posts = [];
  
  files.forEach(file => {
    if (file.endsWith('.md')) {
      const slug = file.replace(/\.md$/, '');
      const filePath = path.join(blogDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { attributes, body } = parseFrontMatter(content);
      posts.push({
        slug,
        title: attributes.title || 'Untitled',
        date: attributes.date || 'June 30, 2026',
        category: attributes.category || 'General',
        description: attributes.description || '',
        image: attributes.image || '',
        icon: attributes.icon || 'bx-file',
        readTime: attributes.read_time || '5 min read',
        keywords: attributes.keywords || '',
        body: body
      });
    }
  });
  
  // Sort posts by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

// Generate HTML for post cards
function generatePostCard(post, isHomepage, index = 0) {
  const postUrl = `/blog/${post.slug}`;
  
  let imageHtml = '';
  if (post.image && (post.image.includes('.') || post.image.includes('/'))) {
    let imageSrc = post.image;
    if (!imageSrc.startsWith('/')) {
      imageSrc = '/' + imageSrc;
    }
    imageHtml = `<img src="${imageSrc}" alt="${post.title}" class="img-fluid">`;
  } else {
    const bgClass = post.image || 'ml-bg';
    const iconClass = post.icon || 'bx-file';
    imageHtml = `
      <div class="blog-image-placeholder">
        <i class="bx ${iconClass}"></i>
        <span>${post.category.toUpperCase()}</span>
      </div>
    `;
  }
  
  const bgClass = (!post.image || post.image.includes('.') || post.image.includes('/')) ? '' : ` ${post.image}`;
  const animationAttr = isHomepage ? ` data-aos="zoom-in" data-aos-delay="${100 + index * 50}"` : '';
  const colClass = isHomepage ? 'col-lg-4 col-md-6 d-flex align-items-stretch' : 'col-lg-4 col-md-6 mb-4';

  return `
    <div class="${colClass}"${animationAttr}>
      <article class="blog-entry">
        <div class="blog-entry-img${bgClass}">
          ${imageHtml}
        </div>
        <div class="blog-entry-content">
          <div class="blog-meta">
            <span class="date">${post.date}</span>
            <span class="category">${post.category}</span>
          </div>
          <h3><a href="${postUrl}">${post.title}</a></h3>
          <p>${post.description}</p>
          <div class="read-more">
            <a href="${postUrl}">Read More <i class="bx bx-right-arrow-alt"></i></a>
          </div>
        </div>
      </article>
    </div>
  `;
}

// Dynamic route for individual blog articles (MUST be before express.static)
app.get('/blog/:slug', (req, res, next) => {
  const slug = req.params.slug.replace(/\.html$/, '');
  const mdPath = path.join(__dirname, 'blog', `${slug}.md`);
  
  if (fs.existsSync(mdPath)) {
    try {
      const templatePath = path.join(__dirname, 'blog', 'blog-post-template.html');
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      const { attributes, body } = parseFrontMatter(mdContent);
      
      const title = attributes.title || 'Untitled Article';
      const date = attributes.date || 'June 30, 2026';
      const category = attributes.category || 'General';
      const readTime = attributes.read_time || '5 min read';
      const description = attributes.description || '';
      const keywords = attributes.keywords || 'blog, article';
      const htmlContent = marked(body);
      
      let template = fs.readFileSync(templatePath, 'utf-8');
      
      // Generate related posts list (top 3 excluding current post)
      const allPosts = getBlogPosts();
      const related = allPosts.filter(p => p.slug !== slug).slice(0, 3);
      let relatedHtml = '';
      related.forEach((p, idx) => {
        relatedHtml += generatePostCard(p, false, idx);
      });
      
      // Inject variables into template
      template = template
        .replace(/{{TITLE}}/g, title)
        .replace(/{{DATE}}/g, date)
        .replace(/{{CATEGORY}}/g, category)
        .replace(/{{READ_TIME}}/g, readTime)
        .replace(/{{CONTENT}}/g, htmlContent)
        .replace(/{{DESCRIPTION}}/g, description)
        .replace(/{{KEYWORDS}}/g, keywords)
        .replace(/<!-- RELATED_POSTS_LIST -->/g, relatedHtml);
        
      return res.send(template);
    } catch (err) {
      console.error('Error rendering markdown post:', err);
      return res.status(500).send('Internal Server Error');
    }
  }
  next();
});

// Serve static assets directories
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/blog', express.static(path.join(__dirname, 'blog')));
app.use('/forms', express.static(path.join(__dirname, 'forms')));

// Serve dynamic homepages
app.get('/', (req, res) => {
  try {
    const htmlPath = path.join(__dirname, 'index.html');
    let content = fs.readFileSync(htmlPath, 'utf-8');
    
    // Inject latest 3 posts
    const posts = getBlogPosts().slice(0, 3);
    let postsHtml = '';
    posts.forEach((post, idx) => {
      postsHtml += generatePostCard(post, true, idx);
    });
    
    content = content.replace(/<!-- LATEST_POSTS_LIST -->/g, postsHtml);
    res.send(content);
  } catch (err) {
    console.error('Error loading index.html:', err);
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.get('/index.html', (req, res) => {
  res.redirect('/');
});

// Serve dynamic blog listing index
app.get('/blog.html', (req, res) => {
  res.redirect('/blog');
});

app.get('/blog', (req, res) => {
  try {
    const htmlPath = path.join(__dirname, 'blog.html');
    let content = fs.readFileSync(htmlPath, 'utf-8');
    
    // Inject all posts
    const posts = getBlogPosts();
    let postsHtml = '';
    posts.forEach((post, idx) => {
      postsHtml += generatePostCard(post, false, idx);
    });
    
    content = content.replace(/<!-- POSTS_LIST -->/g, postsHtml);
    res.send(content);
  } catch (err) {
    console.error('Error loading blog.html:', err);
    res.sendFile(path.join(__dirname, 'blog.html'));
  }
});

// API contact form submission (matches functions/index.js logic)
app.post('/api/contact', async (req, res) => {
  try {
    const googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbxqoPNGZ6p877I7R14zBFK4x5XR3W41rfwkRxbn2u7iCskgFBF6fp2ZMmDwm2q2kGILfA/exec';

    // Format body as url-encoded for Google Apps Script
    const params = new URLSearchParams(req.body);

    const response = await axios.post(googleAppsScriptUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      data: response.data
    });
  } catch (error) {
    console.error('Error forwarding to Google Apps Script:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit form',
      error: error.message
    });
  }
});

// Fallback routing for SPA (redirecting undefined routes to index.html, matching firebase config)
app.get('*', (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

