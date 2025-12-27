# Phone Inspector PWA

Phone Inspector is a high-performance Progressive Web App (PWA) designed for global phone number validation, formatting, and open-source intelligence (OSINT). The application provides a comprehensive suite of tools for telecommunications analysis, enabling users to verify number legitimacy, identify carrier types, and investigate digital footprints.

## Core Capabilities

### Technical Analysis
- **Global Validation:** Utilizes comprehensive numbering plan metadata to verify number validity and possibility across all international regions.
- **Metadata Extraction:** Identifies country of origin, international calling codes, national formats, and number categories (Mobile, Fixed-line, VoIP, etc.).
- **Detailed Reasoning:** A dedicated technical panel provides verbose explanations for validation status and formatting standards (E.164, URI, National).

### OSINT and Intelligence
- **Google Dorking Suite:** Specialized search automation for discovering digital footprints across four categories:
    - Social Profiles: Scans major networks (LinkedIn, Facebook, Twitter, etc.).
    - Public Documents: Locates mentions in PDF, DOCX, and XLS files.
    - Community Recon: Queries specialized forums مانند Reddit, 800Notes, and Tellows.
    - Leak Repositories: Checks for entries in Pastebin, GitHub, and other data dumps.
- **External Intelligence:** Direct deep-linking to reputable reputation services including IPQualityScore, TrueCaller, and Free-Lookup.

### Utility and Integration
- **Direct Actions:** Native integration for initiating cellular calls and WhatsApp conversations.
- **Web Share Integration:** Allows for seamless sharing of analyzed number reports via the system share sheet.
- **PWA Features:** Fully installable on mobile and desktop platforms with offline support via Service Workers.

## Technical Implementation

- **Framework:** Vite with Vanilla JavaScript.
- **PWA Architecture:** Managed via vite-plugin-pwa with custom manifest and service worker configuration.
- **Logic Engine:** libphonenumber-js (max metadata build) for high-accuracy parsing.
- **Design System:** Custom CSS implementation featuring a glassmorphic dark theme and responsive design architecture.
- **Deployment:** Automated CI/CD pipeline via GitHub Actions.

## Live Access

The application is deployed at: [https://darpan-97.github.io/phone-inspector-pwa/](https://darpan-97.github.io/phone-inspector-pwa/)

## Development and Deployment

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/darpan-97/phone-inspector-pwa.git
   cd phone-inspector-pwa
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Command Reference
- **Development Server:** `npm run dev`
- **Production Build:** `npm run build`
- **Preview Build:** `npm run preview`

## License

This project is licensed under the MIT License. Reference the LICENSE file for full legal text.
