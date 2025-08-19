### **FitConnect**

An intelligent platform that connects people to their ideal personal trainers using AI, powered by Sensay AI.

## 🎯 About the Project

FitConnect revolutionizes how people find personal trainers. Using advanced artificial intelligence from Sensay, we connect clients with ideal professionals based on their goals, preferences, and compatibility.

Our chatbot acts as an interactive assistant that asks strategic questions to understand the user’s profile and goals. Based on this input, it recommends the most suitable personal trainers. The main use case is to simplify the connection between people who want to work out and qualified professionals, making the process fast, personalized, and accessible.

### Key Features

  - **Intelligent AI Chat**: Find the perfect personal trainer through smart conversations
  - **Personalized Matching**: Profile, goal, and preference analysis for ideal connections
  - **Modern Interface**: Responsive design and an optimized user experience
  - **Admin Panel**: Replica management and AI training

-----

## 🚀 Getting Started

### Prerequisites

  - Node.js 18+
  - npm or yarn
  - Sensay AI API Key

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/dawson001/fitconnect.git
    cd fitconnect
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Configure environment variables**

    ```bash
    # Copy the template file
    cp config.template .env.local

    # Edit the .env.local file with your settings
    # NEXT_PUBLIC_SENSAY_ORG_SECRET=your-sensay-key-here
    # NEXT_PUBLIC_REPLICA_UUID=your-replica-uuid
    # ADMIN_PASSWORD=your-admin-password-here
    ```

4.  **Run the development server**

    ```bash
    npm run dev
    ```

5.  **Access the project**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

-----

## ⚙️ Environment Configuration

The project uses environment variables for configuration. All configurations are in the **`.env.local`** file:

### Required Variables:

  - **NEXT\_PUBLIC\_SENSAY\_API\_URL**: Sensay API URL (default: [https://api.sensay.io](https://api.sensay.io))
  - **NEXT\_PUBLIC\_SENSAY\_ORG\_SECRET**: Sensay organization secret key
  - **NEXT\_PUBLIC\_SENSAY\_API\_VERSION**: API version (default: 2025-05-01)
  - **NEXT\_PUBLIC\_REPLICA\_UUID**: UUID of the replica for the client chat
  - **ADMIN\_PASSWORD**: Password for admin panel access

### Configuration example:

```env
NEXT_PUBLIC_SENSAY_API_URL=https://api.sensay.io
NEXT_PUBLIC_SENSAY_ORG_SECRET=your-secret-key-here
NEXT_PUBLIC_SENSAY_API_VERSION=2025-05-01
NEXT_PUBLIC_REPLICA_UUID=replica-uuid-here
ADMIN_PASSWORD=secure-admin-password
```

-----

## 🤖 AI Training

### Replica Training Script

The project includes a powerful script to create and train the AI replicas:

```bash

# Create a replica
npx tsx scripts/train-replicas.ts create
```

### Replica Configuration

After running the training script:

1.  **Get the UUID** from the generated JSON file
2.  **Update** the `.env.local` file:
    ```env
    NEXT_PUBLIC_REPLICA_UUID=client-replica-uuid
    ```

For complete script documentation, see: [`scripts/README.md`](scripts/README.md)

-----

## 🛠️ Technologies

  - **Framework**: Next.js 14 (App Router)
  - **Language**: TypeScript
  - **Styling**: Tailwind CSS
  - **AI**: Sensay AI SDK
  - **CLI**: Commander.js for scripts

-----

## 📁 Project Structure

```
fitconnect/
├── app/                  # Pages and layouts (App Router)
│   ├── page.tsx          # Main page with AI chat
│   ├── admin/            # Admin panel
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # Reusable components
├── sensay-sdk/           # Auto-generated Sensay SDK
├── scripts/              # Automation scripts
│   ├── train-replicas.ts # Training script
│   └── README.md         # Scripts documentation
├── public/               # Static files
└── training-data/        # Data for AI training
```

-----

## 🔗 Useful Links

  - [Sensay AI Documentation](https://docs.sensay.io)
  - [Next.js Documentation](https://nextjs.org/docs)
  - [Tailwind CSS](https://tailwindcss.com/docs)
  - [TypeScript](https://www.typescriptlang.org/docs)

-----

**Developed with ❤️ to revolutionize the fitness market**

**Sensay API Organization ID 13438daf-92b7-4a79-ab7a-e6c8f18f7a60**