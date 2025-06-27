# AI-Powered Resume Insight Tool

#### Deployed Vercel Link: [https://ai-powered-resume-insight-tool.vercel.app/](https://ai-powered-resume-insight-tool.vercel.app/)

A full-stack application that allows users to upload PDF documents (primarily resumes) and receive AI-powered summaries and insights. The application maintains a historical record of all analyzed documents.

## 🚀 Features

- **PDF Upload & Processing**: Upload PDF documents with drag-and-drop interface
- **AI-Powered Analysis**: Uses Sarvam AI to generate intelligent document summaries
- **Fallback Mechanism**: Automatically falls back to word frequency analysis if AI is unavailable
- **Document History**: Persistent storage of all analyzed documents across sessions
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS and shadcn/ui
- **Real-time Processing**: Live feedback during document processing

## 🏗️ Architecture

### Backend (Next.js API Routes)
- **File Upload Handling**: Secure multipart/form-data processing
- **Custom PDF Text Extraction**: Built-in PDF parser without external dependencies
- **AI Integration**: Sarvam AI client for document summarization
- **Data Persistence**: JSON-based storage for document history
- **Error Handling**: Robust fallback mechanisms

### Frontend (Next.js + React)
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Tabbed Interface**: Separate views for upload and history
- **Real-time Updates**: Dynamic content updates without page refresh
- **File Management**: Drag-and-drop file selection with validation

### Key Components

1. **API Routes**
   - `/api/upload-resume` - Handles PDF uploads, text extraction, and AI processing
   - `/api/insights` - Retrieves document history and specific insights

2. **Frontend Interface**
   - Upload interface with file validation
   - Results display with different insight types
   - History management with persistent storage

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js 15 (API Routes)
- **PDF Processing**: Custom PDF text extraction
- **AI Integration**: Sarvam AI API
- **File Handling**: Native Node.js fs/promises
- **Data Storage**: JSON file-based storage

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React hooks

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Sarvam AI API key

### Installation Steps

1. **Clone the repository**
   ```
   git clone https://github.com/AnkushS27/ai-powered-resume-insight-tool
   cd ai-powered-resume-insight-tool
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```
   SARVAM_API_KEY=your_sarvam_api_key_here
   ```

4. **Create required directories (optional)**
   ```
   mkdir uploads data
   ```

5. **Run the development server**
   ```
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Configuration

### Sarvam AI Setup
1. Create a free account at [Sarvam AI](https://www.sarvam.ai/)
2. Obtain your API subscription key
3. Add the key to your `.env.local` file

### File Storage
- Uploaded PDFs are stored in the `uploads/` directory
- Document insights are stored in `data/insights.json`
- Both directories are created automatically if they don't exist

## 🚀 Usage

### Uploading Documents
1. Navigate to the "Upload & Analyze" tab
2. Click to select or drag-and-drop a PDF file
3. Click "Upload & Analyze" to process the document
4. View the AI-generated summary or word frequency analysis

### Viewing History
1. Navigate to the "History" tab
2. View all previously analyzed documents
3. Click on any document to view its insights again

## 🔄 Fallback Mechanism

The application implements a robust fallback system:

1. **Primary**: Sarvam AI generates intelligent document summaries
2. **Fallback**: If AI is unavailable, the system automatically:
   - Extracts the top 5 most frequently used words
   - Filters out common stop words
   - Provides word frequency analysis instead

## 🔮 Future Enhancements

- **Database Integration**: Replace JSON storage with PostgreSQL/MongoDB
- **User Authentication**: Add user accounts and private document storage
- **Advanced AI Features**: Support for multiple AI providers and models
- **Document Types**: Extend support beyond PDFs (Word, text files)
- **Batch Processing**: Upload and process multiple documents simultaneously
- **Export Features**: Export insights to various formats (PDF, Word, etc.)
- **Analytics Dashboard**: Usage statistics and insights analytics

## 🐛 Troubleshooting

### Common Issues

1. **PDF Upload Fails**
   - Ensure the file is a valid PDF
   - Check file size limits
   - Verify upload directory permissions

2. **AI Processing Fails**
   - Verify Sarvam AI API key is correct
   - Check internet connectivity
   - Review API usage limits

3. **History Not Loading**
   - Ensure data directory exists and is writable
   - Check insights.json file permissions

## 📝 API Documentation

### POST /api/upload-resume
Uploads and processes a PDF document.

**Request**: Multipart form data with 'resume' file field

**Response**: Insight object with summary or word frequency data

### GET /api/insights
Retrieves document history or specific insight.

**Query Parameters**:
- `id` (optional): Specific insight ID

**Response**: Array of insights or single insight object
