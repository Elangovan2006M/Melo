# **🎵 Melo \- Music Streaming App**

A seamless, cross-platform music streaming application built with React Native, Node.js, and Azure.

## **🚀 About The Project**

**Melo** is a robust music streaming mobile application designed to provide an ad-free listening experience across 4 different languages.

Unlike traditional music apps that rely on static databases or paid APIs, Melo acts as a **real-time data aggregator**. It uses a custom-built backend to dynamically scrape, structure, and stream audio data from the web instantly, delivering a polished, native-like experience to the user.

**Note:** *This project was developed strictly for educational purposes to demonstrate skills in full-stack mobile development, web scraping, and cloud infrastructure.*

## **✨ Key Features**

* **Cross-Platform UI:** Built with React Native (Expo) for a fluid, high-performance experience on Android.  
* **Real-Time Aggregation:** Custom backend scrapes and parses unstructured web data on-the-fly to serve song metadata and audio streams.  
* **Zero Cold-Start Backend:** API deployed on a **Microsoft Azure Virtual Machine** (Ubuntu Linux) using PM2, ensuring millisecond response times compared to serverless functions.  
* **User Library:**  
  * **Favorites:** "Heart" songs to add them to your personal collection.  
  * **Saved Songs:** Build your personal library.  
  * **History:** Automatically tracks your listening history.  
* **Advanced Playback:** Background audio support, seek, skip, and mini-player controls using expo-av.  
* **Secure Authentication:** Seamless login and session management via Firebase Auth (persisted with AsyncStorage).

## **🛠️ Tech Stack**

### **Frontend (Mobile App)**

* **Framework:** React Native (via Expo)  
* **Styling:** NativeWind (Tailwind CSS for React Native)  
* **Navigation:** React Navigation (Stack)  
* **State Management:** React Context API  
* **Audio:** Expo AV

### **Backend (API & Scraper)**

* **Runtime:** Node.js & Express  
* **Scraping Engine:** Puppeteer (Headless Chrome)  
* **Process Management:** PM2

### **Infrastructure & Services**

* **Hosting:** Microsoft Azure Virtual Machine (Standard B2s / Ubuntu 22.04 LTS)  
* **Database:** Firebase Firestore (NoSQL)  
* **Authentication:** Firebase Auth

## **🏗️ Architecture**

1. **Client:** The React Native app sends a search query or album request.  
2. **API Layer:** The Node.js server on Azure receives the request.  
3. **Scraper:** Puppeteer launches a headless browser instance to fetch data from public web sources. It parses the HTML to extract song titles, artists, images, and direct audio links.  
4. **Response:** The server formats this data into clean JSON and sends it back to the app.  
5. **Stream:** The app streams the audio directly from the source URL provided by the backend.

## **📲 Download & Test**

You can download the latest APK release for Android here:

[**⬇️ Download Melo APK**](https://www.google.com/search?q=YOUR_GOOGLE_DRIVE_OR_DROPBOX_LINK_HERE)

## **🤝 Contributing**

Contributions, issues, and feature requests are welcome

## **📄 License**

Distributed under the MIT License. 