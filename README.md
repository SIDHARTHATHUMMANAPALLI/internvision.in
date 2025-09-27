# AI Internship & Scholarship Portal (Frontend)

A static web app that helps students find internships and scholarships using AI-like ranking and filters. Includes signup/login (demo via localStorage), profile-driven search, and category-wise listings.

## Features
- Authentication: signup (with strong password validation), login
- Degrees and branches:
  - B.Tech: CSE, ECE, EEE, MEC, CIVIL, VLSI DESIGNING
  - Degree: BA, B.Com, B.Sc, BBA, BCA, B.Pharm
  - MBBS: MBBS, Veterinary, pharmacy, B.Sc
- AI search engine: filter by domain (internship/scholarship), degree, specialization, grad year, gender
- Category-wise internship and scholarship listings

## Run locally with XAMPP (Windows)
1. Install XAMPP.
2. Copy the `hacathon2025` folder to your Apache `htdocs` directory, e.g.: `C:\xampp\htdocs\hacathon2025`.
3. Start Apache from XAMPP Control Panel.
4. Open your browser at `http://localhost/hacathon2025/`.

If you prefer without XAMPP, open `index.html` directly, but `fetch` for JSON may be blocked; use a server.

## Test flow
- Sign up at `/signup.html` with required fields and strong password.
- Log in at `/login.html`.
- Use AI Search on home to choose Domain, Degree, and Specialization; optionally set Grad Year and Gender.
- Results render below in the respective section.
- Use the search inputs in each section for quick text filtering.

## Share on local network
- Ensure both devices are on same network.
- From another device, open `http://<your_pc_ip>/hacathon2025/`.

## Maintenance
- Edit data in `data/internships.json` and `data/scholarships.json`.
- Customize UI in `assets/css/styles.css`.
- Logic resides in `assets/js/app.js` and `assets/js/auth.js`.

## Notes
- This is a client-only demo. For production, replace localStorage with a backend (auth, DB), add HTTPS, CSRF protection, and real AI/ML services.
