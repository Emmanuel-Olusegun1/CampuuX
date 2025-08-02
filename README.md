# CampuusX - Student Resource Sharing Platform  

**Discover. Share. Succeed.**  

CampuusX is an open platform for students to find and share academic resources, opportunities, and jobs—powered by Supabase for backend services.  

---

## Features  
- **Open Access** – No signup needed to browse or share  
- **50,000+ Resources** – Lecture notes, past exams, study guides  
- **10,000+ Opportunities** – Internships, jobs, scholarships  
- **Instant Sharing** – Contribute with one click  
- **Smart Search** – Find materials by course, university, or keyword  

---

## Tech Stack  
- **Frontend**: React.js, Tailwind CSS  
- **Backend**: Supabase (Auth, Database, Storage)  
- **Routing**: React Router  
- **Icons**: React Icons (Font Awesome)  
- **Deployment**: Netlify  

---

## Getting Started  

### Prerequisites  
- Node.js (v16+)  
- npm/yarn  
- Supabase account (for backend setup)  

### Installation  
1. Clone the repo:  
   ```bash
   git clone https://github.com/Emmanuel-Olusegun1/CampuuX.git
   ```
2. Install dependencies:  
   ```bash
   npm install
   ```
3. Set up Supabase:  
   - Create a `.env` file with your Supabase credentials:  
     ```
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```
4. Start the development server:  
   ```bash
   npm run dev
   ```

---

## Project Structure  
```
src/
├── components/      # Reusable UI components (Navbar, Footer, Button)
├── pages/           # Main pages (Home, Resources, Share, Scholarships, etc.)
├── lib/             # Supabase client configuration
├── assets/          # Images, styles
└── App.jsx          # Main app router
```

---

## Customization  
- Update university/course filters in `src/data/filters.js`  
- Modify colors in `tailwind.config.js`  
- Replace placeholder images in `public/`  

---

## License  
MIT License – Free for educational and personal use.  

---

## Credits  
- **Hero Image**: [Premium PNG](https://example.com)  
- **Icons**: [Font Awesome](https://react-icons.github.io/react-icons/)  
- **Backend**: [Supabase](https://supabase.com)  

---

## Live Demo  
[https://campuusx.netlify.app](https://campuusx.netlify.app)  

---

**Made for students, by students**  

---

### Screenshot  
![CampuusX Homepage](https://res.cloudinary.com/dzibfknxq/image/upload/v1754131444/download_szbgus.png)  



---

Contribute by sharing resources at `/resources`.  

For issues, open a [GitHub Issue](https://github.com/Emmanuel-Olusegun1/CampuuX/issues).  
