function chatbotReply(message) {

    if (message.includes("halo")) {
        return "Halo juga 👋";
    }

    if (message.includes("layanan")) {
        return "Kami menyediakan layanan chatbot bisnis.";
    }

    return "Maaf, saya belum memahami pesan itu.";
}
